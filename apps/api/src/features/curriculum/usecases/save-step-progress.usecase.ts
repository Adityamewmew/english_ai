import { curriculumRepository } from "../curriculum.repository";

export async function saveStepProgressUsecase(
  userId: string,
  moduleId: string,
  stepProgress: {
    currentStep: number;
    unlockedStep: number;
    completedSteps: number[];
    isPracticeUnlocked: boolean;
    isSpeakingComplete?: boolean;
  }
) {
  const existing = await curriculumRepository.findUserModuleProgress(userId, moduleId);
  const newStatus = existing?.status === "completed" ? "completed" : "unlocked";

  await curriculumRepository.upsertProgress({
    userId,
    moduleId,
    status: newStatus,
    stepProgress: {
      ...stepProgress,
      isSpeakingComplete: stepProgress.isSpeakingComplete ?? false,
    },
  });

  return { saved: true };
}
