import { Elysia } from "elysia";
import {
  AdminQuestionsQuery,
  AdminModulesQuery,
  AdminModuleIdParam,
} from "../../entity/admin_entity";
import { getAdminStatsUsecase } from "../../usecase/admin/get-admin-stats.usecase";
import { getAdminModulesUsecase } from "../../usecase/admin/get-admin-modules.usecase";
import { getAdminModuleDetailUsecase } from "../../usecase/admin/get-admin-module-detail.usecase";
import { getAdminQuestionsUsecase } from "../../usecase/admin/get-admin-questions.usecase";
import { jsonResponse } from "../../presenter/json";

export const adminHandler = new Elysia({ prefix: "/api/admin" })
  .get("/stats", async ({ set }) => {
    const data = await getAdminStatsUsecase();
    return jsonResponse({
      set,
      statusCode: 200,
      message: "Admin statistics retrieved successfully",
      data,
    });
  })
  .get(
    "/modules",
    async ({ query, set }) => {
      const data = await getAdminModulesUsecase(query?.cefr);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Curriculum modules retrieved successfully",
        data,
      });
    },
    { query: AdminModulesQuery }
  )
  .get(
    "/modules/:id",
    async ({ params, set }) => {
      const data = await getAdminModuleDetailUsecase(params.id);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Module details retrieved successfully",
        data,
      });
    },
    { params: AdminModuleIdParam }
  )
  .get(
    "/questions",
    async ({ query, set }) => {
      const data = await getAdminQuestionsUsecase({
        cefr: query?.cefr,
        skill: query?.skill,
        keywords: query?.keywords,
        page: query?.page ? parseInt(query.page, 10) : 1,
        perPage: query?.perPage ? parseInt(query.perPage, 10) : 20,
      });
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Question bank retrieved successfully",
        data,
      });
    },
    { query: AdminQuestionsQuery }
  );
