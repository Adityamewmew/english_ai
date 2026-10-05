import { Elysia } from "elysia";
import {
  AdminQuestionsQuery,
  AdminModulesQuery,
  AdminModuleIdParam,
} from "./admin.model";
import { getAdminStatsUsecase } from "./usecases/get-admin-stats.usecase";
import { getAdminModulesUsecase } from "./usecases/get-admin-modules.usecase";
import { getAdminModuleDetailUsecase } from "./usecases/get-admin-module-detail.usecase";
import { getAdminQuestionsUsecase } from "./usecases/get-admin-questions.usecase";

export const adminController = new Elysia({ prefix: "/api/admin" })
  .get("/stats", async () => {
    const data = await getAdminStatsUsecase();
    return { success: true, data };
  })
  .get(
    "/modules",
    async ({ query }) => {
      const data = await getAdminModulesUsecase(query?.cefr);
      return { success: true, data };
    },
    { query: AdminModulesQuery }
  )
  .get(
    "/modules/:id",
    async ({ params }) => {
      const data = await getAdminModuleDetailUsecase(params.id);
      return { success: true, data };
    },
    { params: AdminModuleIdParam }
  )
  .get(
    "/questions",
    async ({ query }) => {
      const data = await getAdminQuestionsUsecase({
        cefr: query?.cefr,
        skill: query?.skill,
        keywords: query?.keywords,
        page: query?.page ? parseInt(query.page, 10) : 1,
        perPage: query?.perPage ? parseInt(query.perPage, 10) : 20,
      });
      return { success: true, data };
    },
    { query: AdminQuestionsQuery }
  );
