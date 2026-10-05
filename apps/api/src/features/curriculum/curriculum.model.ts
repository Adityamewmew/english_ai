import { t } from "elysia";

export const ModuleIdParam = t.Object({
  id: t.String(),
});

export const CurriculumOverviewQuery = t.Optional(
  t.Object({
    levelId: t.Optional(t.String()),
    userId: t.Optional(t.String()),
  })
);

export const SubmitQuizBody = t.Object({
  userId: t.String(),
  answers: t.Record(t.String(), t.Number()),
  speakingScore: t.Optional(t.Number()),
});

export type SubmitQuizBody = typeof SubmitQuizBody.static;

export const StepProgressBody = t.Object({
  userId: t.String(),
  currentStep: t.Number(),
  unlockedStep: t.Number(),
  completedSteps: t.Array(t.Number()),
  isPracticeUnlocked: t.Boolean(),
  isSpeakingComplete: t.Optional(t.Boolean()),
});

export type StepProgressBody = typeof StepProgressBody.static;
