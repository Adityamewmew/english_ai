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
import { authPlugin } from "../../../lib/auth";
import { UnauthorizedError } from "../../../common/errors/app-error";

export const curriculumHandler = new Elysia({ prefix: "/api/curriculum" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query, user, set }) => {
      const activeUserId = (user as any)?.id || query?.userId;
      const data = await getCurriculumUsecase(activeUserId, query?.levelId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum overview retrieved successfully",
        data,
      });
    },
    { auth: true, query: CurriculumOverviewQuery }
  )
  .get(
    "/modules",
    async ({ query, user, set }) => {
      const activeUserId = (user as any)?.id || query?.userId;
      const data = await getCurriculumUsecase(activeUserId, query?.levelId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum modules retrieved successfully",
        data,
      });
    },
    { auth: true, query: CurriculumOverviewQuery }
  )
  .get(
    "/levels",
    async ({ query, user, set }) => {
      const activeUserId = (user as any)?.id || query?.userId;
      const data = await getCurriculumUsecase(activeUserId, query?.levelId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum levels retrieved successfully",
        data,
      });
    },
    { auth: true, query: CurriculumOverviewQuery }
  )
  .get(
    "/modules/:id",
    async ({ params, query, user, set }) => {
      const activeUserId = (user as any)?.id || query?.userId;
      const data = await getModuleDetailUsecase(params.id, activeUserId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Module detail retrieved successfully",
        data,
      });
    },
    {
      auth: true,
      params: ModuleIdParam,
      query: t.Optional(t.Object({ userId: t.Optional(t.String()) })),
    }
  )
  .post(
    "/modules/:id/submit",
    async ({ params, body, user, set }) => {
      const activeUserId = (user as any)?.id || body.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk mengirim kuis modul.");
      }
      const data = await submitQuizUsecase(
        activeUserId,
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
      auth: true,
      params: ModuleIdParam,
      body: SubmitQuizBody,
    }
  )
  .post(
    "/modules/:id/step-progress",
    async ({ params, body, user, set }) => {
      const activeUserId = (user as any)?.id || body.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk menyimpan progres modul.");
      }
      const data = await saveStepProgressUsecase(activeUserId, params.id, {
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
      auth: true,
      params: ModuleIdParam,
      body: StepProgressBody,
    }
  )
  .post(
    "/sub-modules/:id/submit",
    async ({ params, body, user, set }) => {
      const activeUserId = (user as any)?.id || body.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk mengirim kuis sub-modul.");
      }
      const data = await submitSubModuleUsecase(
        activeUserId,
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
      auth: true,
      params: SubModuleIdParam,
      body: SubmitSubModuleBody,
    }
  );
