import { curriculumRepository } from "../curriculum.repository";
import { NotFoundError } from "../../../core/errors/app-error";

export async function getModuleDetailUsecase(moduleId: string, userId?: string) {
  const module = await curriculumRepository.findModuleById(moduleId);
  if (!module) {
    throw new NotFoundError(`Modul kurikulum '${moduleId}' tidak ditemukan`);
  }

  const rawSections = await curriculumRepository.findSectionsByModuleId(moduleId);
  const sections = enrichPracticeSections(rawSections);

  let userProgress = null;
  if (userId) {
    userProgress = await curriculumRepository.findUserModuleProgress(userId, moduleId);
  }

  return {
    module,
    sections,
    userProgress,
  };
}

function enrichPracticeSections(sections: any[]) {
  const vocabSec = sections.find((s) => s.sectionType === "vocab");

  return sections.map((sec) => {
    if (sec.sectionType !== "practice") return sec;

    const content = sec.content || {};
    const drills = Array.isArray(content.drills) ? content.drills : [];
    const roleplay = content.roleplay || { context: "", roles: ["Mr. Khoirul", "You"], turns: [] };

    let enrichedDrills = [...drills];

    if (enrichedDrills.length === 0) {
      const vocabItems = vocabSec?.content?.items || [];
      if (Array.isArray(vocabItems) && vocabItems.length > 0) {
        enrichedDrills = vocabItems.slice(0, 3).map((v: any, idx: number) => {
          const rawCollocation = v.collocation || `I am ${v.word}.`;
          const cleanText = rawCollocation.includes(" / ")
            ? rawCollocation.split(" / ")[0].trim()
            : rawCollocation.trim();
          return {
            id: `drill-vocab-${idx + 1}`,
            targetText: cleanText,
            focus: `Pelafalan: "${v.word}" (${v.meaning || ""})`,
            hint: v.ipa ? `Panduan fonetik: ${v.ipa}` : `Fokus pada intonasi natural`,
          };
        });
      }
    }

    return {
      ...sec,
      content: {
        ...content,
        drills: enrichedDrills,
        roleplay,
      },
    };
  });
}
