import { Elysia, t } from "elysia";
import {
  ModuleIdParam,
  CurriculumOverviewQuery,
  SubmitQuizBody,
  StepProgressBody,
} from "./curriculum.model";
import { getCurriculumUsecase } from "./usecases/get-curriculum.usecase";
import { getModuleDetailUsecase } from "./usecases/get-module-detail.usecase";
import { submitQuizUsecase } from "./usecases/submit-quiz.usecase";
import { saveStepProgressUsecase } from "./usecases/save-step-progress.usecase";

export const curriculumController = new Elysia({ prefix: "/api/curriculum" })
  .get(
    "/",
    async ({ query }) => {
      const data = await getCurriculumUsecase(query?.userId, query?.levelId);
      return { success: true, data };
    },
    { query: CurriculumOverviewQuery }
  )
  .get(
    "/modules",
    async ({ query }) => {
      const data = await getCurriculumUsecase(query?.userId, query?.levelId);
      return { success: true, data };
    },
    { query: CurriculumOverviewQuery }
  )
  .get(
    "/levels",
    async ({ query }) => {
      const data = await getCurriculumUsecase(query?.userId, query?.levelId);
      return { success: true, data };
    },
    { query: CurriculumOverviewQuery }
  )
  .get(
    "/modules/:id",
    async ({ params, query }) => {
      const data = await getModuleDetailUsecase(params.id, query?.userId);
      return { success: true, data };
    },
    {
      params: ModuleIdParam,
      query: t.Optional(t.Object({ userId: t.Optional(t.String()) })),
    }
  )
  .post(
    "/modules/:id/submit",
    async ({ params, body }) => {
      const data = await submitQuizUsecase(
        body.userId,
        params.id,
        body.answers,
        body.speakingScore
      );
      return { success: true, data };
    },
    {
      params: ModuleIdParam,
      body: SubmitQuizBody,
    }
  )
  .post(
    "/modules/:id/step-progress",
    async ({ params, body }) => {
      const data = await saveStepProgressUsecase(body.userId, params.id, {
        currentStep: body.currentStep,
        unlockedStep: body.unlockedStep,
        completedSteps: body.completedSteps,
        isPracticeUnlocked: body.isPracticeUnlocked,
        isSpeakingComplete: body.isSpeakingComplete,
      });
      return { success: true, data };
    },
    {
      params: ModuleIdParam,
      body: StepProgressBody,
    }
  );
