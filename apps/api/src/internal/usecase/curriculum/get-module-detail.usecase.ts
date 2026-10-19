import { curriculumRepository } from "../../repository/curriculum_repository";
import { NotFoundError } from "../../../common/errors/app-error";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function getModuleDetailUsecase(moduleId: string, userId?: string) {
  const module = await curriculumRepository.findModuleById(moduleId);
  if (!module) {
    throw new NotFoundError(`Modul kurikulum '${moduleId}' tidak ditemukan`);
  }

  const rawSections = await curriculumRepository.findSectionsByModuleId(moduleId);
  const subModulesList = await curriculumRepository.findSubModulesByModuleId(moduleId);

  let userProgress = null;
  let progressList: any[] = [];
  let isAdmin = false;

  if (userId) {
    const [u] = await db
      .select({ role: users.role, accessType: users.accessType, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (u && (u.role === "admin" || u.accessType === 1 || u.email?.toLowerCase().includes("khoirul"))) {
      isAdmin = true;
    }

    userProgress = await curriculumRepository.findUserModuleProgress(userId, moduleId);
    if (subModulesList.length > 0) {
      progressList = await curriculumRepository.findUserSubModuleProgressList(
        userId,
        subModulesList.map((s: any) => s.id)
      );
    }
  }

  // Handle sub-modules if present
  const subModulesData = subModulesList.map((sub: any, idx: number) => {
    const subRawSections = rawSections.filter((s: any) => s.subModuleId === sub.id);
    const subSections = enrichPracticeSections(subRawSections);
    const existingProg = progressList.find((p: any) => p.subModuleId === sub.id);

    let status = "locked";
    if (isAdmin) {
      status = existingProg?.status === "completed" ? "completed" : "unlocked";
    } else if (existingProg) {
      status = existingProg.status;
    } else if (idx === 0) {
      status = "unlocked";
    } else {
      const prevProg = progressList.find((p: any) => p.subModuleId === subModulesList[idx - 1].id);
      if (prevProg?.status === "completed") {
        status = "unlocked";
      }
    }

    return {
      ...sub,
      sections: subSections,
      userProgress: existingProg
        ? { ...existingProg, status }
        : { status, score: null, completedAt: null },
    };
  });

  // Legacy sections have subModuleId = null (or empty if none)
  const legacyRawSections = subModulesList.length > 0
    ? rawSections.filter((s: any) => !s.subModuleId)
    : rawSections;
  const sections = enrichPracticeSections(legacyRawSections);

  return {
    module,
    sections,
    subModules: subModulesData,
    userProgress,
  };
}

function enrichPracticeSections(sections: any[]) {
  const vocabSec = sections.find((s: any) => s.sectionType === "vocab");

  return sections.map((sec: any) => {
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
