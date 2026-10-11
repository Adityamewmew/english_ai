import { Elysia, t } from "elysia";
import {
  ModuleIdParam,
  CurriculumOverviewQuery,
  SubmitQuizBody,
  StepProgressBody,
  SubModuleIdParam,
  SubmitSubModuleBody,
} from "../../entity/curriculum_entity";
import { getCurriculumUsecase } from "../../usecase/curriculum/get-curriculum.usecase";
import { getModuleDetailUsecase } from "../../usecase/curriculum/get-module-detail.usecase";
import { submitQuizUsecase } from "../../usecase/curriculum/submit-quiz.usecase";
import { saveStepProgressUsecase } from "../../usecase/curriculum/save-step-progress.usecase";
import { submitSubModuleUsecase } from "../../usecase/curriculum/submit-sub-module.usecase";
import { jsonResponse } from "../../presenter/json";

export const curriculumHandler = new Elysia({ prefix: "/api/curriculum" })
  .get(
    "/",
    async ({ query, set }) => {
      const data = await getCurriculumUsecase(query?.userId, query?.levelId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum overview retrieved successfully",
        data,
      });
    },
    { query: CurriculumOverviewQuery }
  )
  .get(
    "/modules",
    async ({ query, set }) => {
      const data = await getCurriculumUsecase(query?.userId, query?.levelId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum modules retrieved successfully",
        data,
      });
    },
    { query: CurriculumOverviewQuery }
  )
  .get(
    "/levels",
    async ({ query, set }) => {
      const data = await getCurriculumUsecase(query?.userId, query?.levelId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum levels retrieved successfully",
        data,
      });
    },
    { query: CurriculumOverviewQuery }
  )
  .get(
    "/modules/:id",
    async ({ params, query, set }) => {
      const data = await getModuleDetailUsecase(params.id, query?.userId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Module detail retrieved successfully",
        data,
      });
    },
    {
      params: ModuleIdParam,
      query: t.Optional(t.Object({ userId: t.Optional(t.String()) })),
    }
  )
  .post(
    "/modules/:id/submit",
    async ({ params, body, set }) => {
      const data = await submitQuizUsecase(
        body.userId,
        params.id,
        body.answers,
        body.speakingScore
      );
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Quiz submitted successfully",
        data,
      });
    },
    {
      params: ModuleIdParam,
      body: SubmitQuizBody,
    }
  )
  .post(
    "/modules/:id/step-progress",
    async ({ params, body, set }) => {
      const data = await saveStepProgressUsecase(body.userId, params.id, {
        currentStep: body.currentStep,
        unlockedStep: body.unlockedStep,
        completedSteps: body.completedSteps,
        isPracticeUnlocked: body.isPracticeUnlocked,
        isSpeakingComplete: body.isSpeakingComplete,
      });
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Step progress saved successfully",
        data,
      });
    },
    {
      params: ModuleIdParam,
      body: StepProgressBody,
    }
  )
  .post(
    "/sub-modules/:id/submit",
    async ({ params, body, set }) => {
      const data = await submitSubModuleUsecase(
        body.userId,
        params.id,
        body.answers,
        body.score,
        body.speakingScore
      );
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Sub-module submitted successfully",
        data,
      });
    },
    {
      params: SubModuleIdParam,
      body: SubmitSubModuleBody,
    }
  );
