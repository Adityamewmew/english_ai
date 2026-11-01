import { curriculumRepository } from "../../repository/curriculum_repository";
import { NotFoundError } from "../../../common/errors/app-error";
import { SubModuleGradingService } from "./submodule-grading.service";

export async function submitSubModuleUsecase(
  userId: string,
  subModuleId: string,
  answers?: Record<string, any>,
  customScore?: number,
  speakingScore?: number
) {
  const subModule = await curriculumRepository.findSubModuleById(subModuleId);
  if (!subModule) {
    throw new NotFoundError(`Sub-modul '${subModuleId}' tidak ditemukan`);
  }

  const module = await curriculumRepository.findModuleById(subModule.moduleId);
  if (!module) {
    throw new NotFoundError(`Modul '${subModule.moduleId}' tidak ditemukan`);
  }

  const sections = await curriculumRepository.findSectionsBySubModuleId(subModuleId);
  const quizSection = sections.find((s: any) => s.sectionType === "quiz");
  const practiceSection = sections.find((s: any) => s.sectionType === "practice");

  // Authoritative grading via SubModuleGradingService
  const grading = SubModuleGradingService.evaluate({
    quizSection,
    practiceSection,
    answers,
    customScore,
    speakingScore,
  });

  const passingScore = module.passingScore || 70;
  const passed = grading.finalScore >= passingScore;

  // 1. Upsert sub-module progress (record real score)
  await curriculumRepository.upsertSubModuleProgress({
    userId,
    subModuleId,
    status: passed ? "completed" : "unlocked",
    score: grading.finalScore,
    completedAt: passed ? new Date() : undefined,
  });

  // 2. Manage sequence unlock
  const allSubModules = await curriculumRepository.findSubModulesByModuleId(subModule.moduleId);
  const currentIdx = allSubModules.findIndex((s: any) => s.id === subModuleId);
  let nextSubModuleId: string | null = null;
  let moduleCompleted = false;

  if (passed) {
    if (currentIdx !== -1 && currentIdx + 1 < allSubModules.length) {
      const nextSub = allSubModules[currentIdx + 1];
      nextSubModuleId = nextSub.id;
      const existingNext = await curriculumRepository.findUserSubModuleProgress(userId, nextSub.id);
      if (!existingNext || existingNext.status === "locked") {
        await curriculumRepository.upsertSubModuleProgress({
          userId,
          subModuleId: nextSub.id,
          status: "unlocked",
        });
      }
    }

    // Check if all submodules completed
    const subModuleProgressList = await curriculumRepository.findUserSubModuleProgressList(
      userId,
      allSubModules.map((s: any) => s.id)
    );

    const allCompleted = allSubModules.every((s: any) => {
      if (s.id === subModuleId) return true;
      const prog = subModuleProgressList.find((p: any) => p.subModuleId === s.id);
      return prog?.status === "completed";
    });

    if (allCompleted) {
      moduleCompleted = true;
      const scores = allSubModules.map((s: any) => {
        if (s.id === subModuleId) return grading.finalScore;
        const prog = subModuleProgressList.find((p: any) => p.subModuleId === s.id);
        return prog?.score ?? grading.finalScore;
      });
      const avgScore = Math.round(
        scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1)
      );

      await curriculumRepository.upsertProgress({
        userId,
        moduleId: subModule.moduleId,
        status: "completed",
        score: avgScore,
        completedAt: new Date(),
      });

      // Unlock next module within the same CEFR level
      const levelModules = await curriculumRepository.findModules(module.levelId);
      const modIdx = levelModules.findIndex((m: any) => m.id === subModule.moduleId);

      let targetNextModId: string | null = null;

      if (modIdx !== -1 && modIdx + 1 < levelModules.length) {
        targetNextModId = levelModules[modIdx + 1]?.id ?? null;
      } else {
        // Current level completed! Find and unlock first module of next CEFR level
        const allLevels = await curriculumRepository.findAllLevels();
        const currentLvlIdx = allLevels.findIndex((l: any) => l.id === module.levelId);
        if (currentLvlIdx !== -1 && currentLvlIdx + 1 < allLevels.length) {
          const nextLevel = allLevels[currentLvlIdx + 1];
          const nextLevelMods = await curriculumRepository.findModules(nextLevel.id);
          if (nextLevelMods.length > 0) {
            targetNextModId = nextLevelMods[0].id;
          }
        }
      }

      if (targetNextModId) {
        const existingNextMod = await curriculumRepository.findUserModuleProgress(userId, targetNextModId);
        if (!existingNextMod || existingNextMod.status === "locked") {
          await curriculumRepository.upsertProgress({
            userId,
            moduleId: targetNextModId,
            status: "unlocked",
          });
        }

        // Auto-unlock first sub-module of next module
        const nextModSubs = await curriculumRepository.findSubModulesByModuleId(targetNextModId);
        if (nextModSubs.length > 0) {
          const firstSubId = nextModSubs[0].id;
          const existingFirstSub = await curriculumRepository.findUserSubModuleProgress(userId, firstSubId);
          if (!existingFirstSub || existingFirstSub.status === "locked") {
            await curriculumRepository.upsertSubModuleProgress({
              userId,
              subModuleId: firstSubId,
              status: "unlocked",
            });
          }
        }
      }
    }
  }

  return {
    subModuleId,
    moduleId: subModule.moduleId,
    passed,
    score: grading.finalScore,
    quizScore: grading.quizScore,
    passingScore,
    correctCount: grading.correctCount,
    totalQuestions: grading.totalQuestions,
    questionResults: grading.questionResults,
    nextSubModuleId,
    moduleCompleted,
  };
}
