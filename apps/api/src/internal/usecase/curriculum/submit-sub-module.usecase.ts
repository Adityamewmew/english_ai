import { curriculumRepository } from "../../repository/curriculum_repository";
import { NotFoundError } from "../../../common/errors/app-error";

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

  let finalScore = 100;
  let correctCount = 0;
  let totalQuestions = 0;
  const questionResults: any[] = [];

  const rawQuestions =
    quizSection?.content?.questions || practiceSection?.content?.questions;

  if (rawQuestions && Array.isArray(rawQuestions) && answers) {
    const questions = rawQuestions;
    totalQuestions = questions.length;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qId = q.id ?? `q-${i}`;
      const selected = answers[qId.toString()] ?? answers[i.toString()];

      let isCorrect = false;

      if (typeof selected === "string") {
        const cleanUser = selected.trim().toLowerCase().replace(/[.,!?'"]/g, "");
        const rawTarget = q.targetAnswer || q.answer || "";
        const cleanTarget = rawTarget.trim().toLowerCase().replace(/[.,!?'"]/g, "");

        const acceptedList = Array.isArray(q.acceptedAnswers)
          ? q.acceptedAnswers.map((a: string) => a.trim().toLowerCase().replace(/[.,!?'"]/g, ""))
          : [];

        isCorrect =
          cleanUser.length > 0 &&
          (cleanUser === cleanTarget || acceptedList.includes(cleanUser));
      } else {
        const correctIdx =
          q.correctIndex !== undefined
            ? Number(q.correctIndex)
            : Array.isArray(q.options)
            ? q.options.indexOf(q.answer)
            : -1;
        isCorrect = selected !== undefined && Number(selected) === correctIdx;
      }

      if (isCorrect) correctCount++;

      questionResults.push({
        questionId: qId,
        question: q.question || q.prompt || "",
        selectedAnswer: selected !== undefined ? selected : null,
        correctAnswer: q.targetAnswer || q.answer || q.correctIndex,
        isCorrect,
        explanation: q.explanation || "",
      });
    }

    const quizScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    if (speakingScore !== undefined && speakingScore >= 0) {
      finalScore = Math.round(quizScore * 0.5 + speakingScore * 0.5);
    } else {
      finalScore = quizScore;
    }
  } else if (customScore !== undefined) {
    finalScore = customScore;
  } else if (speakingScore !== undefined) {
    finalScore = speakingScore;
  }

  const passingScore = module.passingScore || 70;
  const passed = finalScore >= passingScore;

  // 1. Upsert sub-module progress
  await curriculumRepository.upsertSubModuleProgress({
    userId,
    subModuleId,
    status: passed ? "completed" : "unlocked",
    score: finalScore,
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
        if (s.id === subModuleId) return finalScore;
        const prog = subModuleProgressList.find((p: any) => p.subModuleId === s.id);
        return prog?.score ?? 100;
      });
      const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1));

      await curriculumRepository.upsertProgress({
        userId,
        moduleId: subModule.moduleId,
        status: "completed",
        score: avgScore,
        completedAt: new Date(),
      });

      // Unlock next module if available
      const allModules = await curriculumRepository.findModules();
      const modIdx = allModules.findIndex((m: any) => m.id === subModule.moduleId);
      if (modIdx !== -1 && modIdx + 1 < allModules.length) {
        const nextModId = allModules[modIdx + 1]?.id;
        if (nextModId) {
          const existingNextMod = await curriculumRepository.findUserModuleProgress(userId, nextModId);
          if (!existingNextMod || existingNextMod.status === "locked") {
            await curriculumRepository.upsertProgress({
              userId,
              moduleId: nextModId,
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
    score: finalScore,
    passingScore,
    correctCount,
    totalQuestions,
    questionResults,
    nextSubModuleId,
    moduleCompleted,
  };
}
