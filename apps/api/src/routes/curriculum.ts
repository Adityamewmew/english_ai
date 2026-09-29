import { Elysia, t } from "elysia";
import { curriculumService } from "../services/curriculum.service";
import { moduleTutorService } from "../services/module-tutor.service";

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
  )
  // Dedicated Module AI Tutor endpoints (strictly bound to module context)
  .get(
    "/modules/:id/tutor/greeting",
    async ({ params, query }) => {
      const studentName = (query as any)?.studentName || "";
      const userId = (query as any)?.userId || "";
      return await moduleTutorService.getGreeting(params.id, studentName, userId);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Optional(
        t.Object({
          studentName: t.Optional(t.String()),
          userId: t.Optional(t.String()),
        })
      ),
    }
  )
  .post(
    "/modules/:id/tutor/chat",
    async ({ params, body }) => {
      return await moduleTutorService.chatWithTutor(
        params.id,
        body.message,
        body.history as any,
        body.studentName,
        body.userId
      );
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        message: t.String(),
        history: t.Array(
          t.Object({
            role: t.Union([t.Literal("assistant"), t.Literal("user")]),
            content: t.String(),
          })
        ),
        studentName: t.Optional(t.String()),
        userId: t.Optional(t.String()),
      }),
    }
  );
