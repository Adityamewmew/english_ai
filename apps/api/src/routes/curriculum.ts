import { Elysia, t } from "elysia";
import { curriculumService } from "../services/curriculum.service";

export const curriculumRoutes = new Elysia({ prefix: "/api/curriculum" })
  .get("/", async () => {
    return await curriculumService.getAll();
  })
  .get("/modules", async () => {
    return await curriculumService.getAll();
  })
  .get(
    "/levels",
    async ({ query }) => {
      const userId = (query as any)?.userId || "";
      return await curriculumService.getLevelsWithProgress(userId);
    },
    {
      query: t.Optional(
        t.Object({
          userId: t.Optional(t.String()),
        })
      ),
    }
  )
  .get(
    "/modules/:id",
    async ({ params, query }) => {
      const userId = (query as any)?.userId || "";
      return await curriculumService.getModuleDetail(params.id, userId);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Optional(
        t.Object({
          userId: t.Optional(t.String()),
        })
      ),
    }
  )
  .post(
    "/modules/:id/submit",
    async ({ params, body }) => {
      return await curriculumService.submitQuiz(body.userId, params.id, body.answers);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
        answers: t.Record(t.String(), t.Number()),
      }),
    }
  );
