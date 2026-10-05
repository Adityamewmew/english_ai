import { curriculumRepository } from "../curriculum.repository";
import { NotFoundError, ValidationError } from "../../../core/errors/app-error";

export async function submitQuizUsecase(
  userId: string,
  moduleId: string,
  answers: Record<string, number>,
  speakingScore?: number
) {
  const module = await curriculumRepository.findModuleById(moduleId);
  if (!module) throw new NotFoundError("Modul tidak ditemukan");

  const sections = await curriculumRepository.findSectionsByModuleId(moduleId);
  const quizSection = sections.find((s) => s.sectionType === "quiz");

  if (!quizSection || !quizSection.content || !Array.isArray(quizSection.content.questions)) {
    throw new ValidationError("Kuis untuk modul ini tidak tersedia");
  }

  const questions = quizSection.content.questions;
  let correctCount = 0;
  const questionResults = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qId = q.id ?? `q-${i}`;
    const selected = answers[qId.toString()] ?? answers[i.toString()];
    const isCorrect = selected !== undefined && Number(selected) === Number(q.correctIndex);

    if (isCorrect) correctCount++;

    questionResults.push({
      questionId: qId,
      question: q.question,
      selectedAnswer: selected !== undefined ? selected : null,
      correctAnswer: q.correctIndex,
      isCorrect,
      explanation: q.explanation || "",
    });
  }

  const quizScore = Math.round((correctCount / questions.length) * 100);
  let finalScore = quizScore;
  if (speakingScore !== undefined && speakingScore >= 0) {
    finalScore = Math.round(quizScore * 0.5 + speakingScore * 0.5);
  }

  const passed = finalScore >= (module.passingScore || 70);

  let nextModuleToUnlock = null;
  if (passed) {
    const allModules = await curriculumRepository.findModules();
    const currentIdx = allModules.findIndex((m) => m.id === moduleId);
    if (currentIdx !== -1 && currentIdx + 1 < allModules.length) {
      nextModuleToUnlock = allModules[currentIdx + 1]?.id || null;
    }
  }

  await curriculumRepository.upsertProgress({
    userId,
    moduleId,
    status: passed ? "completed" : "unlocked",
    score: finalScore,
    completedAt: passed ? new Date() : undefined,
  });

  if (passed && nextModuleToUnlock) {
    const existingNext = await curriculumRepository.findUserModuleProgress(userId, nextModuleToUnlock);
    if (!existingNext || existingNext.status === "locked") {
      await curriculumRepository.upsertProgress({
        userId,
        moduleId: nextModuleToUnlock,
        status: "unlocked",
      });
    }
  }

  return {
    passed,
    score: finalScore,
    quizScore,
    speakingScore: speakingScore ?? null,
    passingScore: module.passingScore || 70,
    correctCount,
    totalQuestions: questions.length,
    questionResults,
    nextModuleId: nextModuleToUnlock,
  };
}
