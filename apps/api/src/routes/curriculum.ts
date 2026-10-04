import { Elysia, t } from "elysia";
import { curriculumService } from "../services/curriculum.service";
import { moduleTutorService } from "../services/module-tutor.service";
import { curriculumAdminService } from "../services/curriculum-admin.service";

export const curriculumRoutes = new Elysia({ prefix: "/api/curriculum" })
  .get("/", async () => {
    return await curriculumService.getAll();
  })
  .get(
    "/modules",
    async ({ query }) => {
      const levelId = (query as any)?.levelId;
      return await curriculumService.getAll(levelId);
    },
    {
      query: t.Optional(
        t.Object({
          levelId: t.Optional(t.String()),
        })
      ),
    }
  )
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
      return await curriculumService.submitQuiz(
        body.userId,
        params.id,
        body.answers,
        body.speakingScore
      );
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
        answers: t.Record(t.String(), t.Number()),
        speakingScore: t.Optional(t.Number()),
      }),
    }
  )
  .post(
    "/modules/:id/step-progress",
    async ({ params, body }) => {
      return await curriculumService.saveStepProgress(body.userId, params.id, {
        currentStep: body.currentStep,
        unlockedStep: body.unlockedStep,
        completedSteps: body.completedSteps,
        isPracticeUnlocked: body.isPracticeUnlocked,
        isSpeakingComplete: body.isSpeakingComplete ?? false,
      });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        userId: t.String(),
        currentStep: t.Number(),
        unlockedStep: t.Number(),
        completedSteps: t.Array(t.Number()),
        isPracticeUnlocked: t.Boolean(),
        isSpeakingComplete: t.Optional(t.Boolean()),
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
  )
  .post(
    "/modules/:id/evaluate-speech",
    async ({ params, body }) => {
      return await moduleTutorService.evaluateSpeech({
        moduleId: params.id,
        targetText: body.targetText,
        spokenText: body.spokenText,
        score: body.score,
        missedWords: body.missedWords,
        userId: body.userId,
      });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        targetText: t.String(),
        spokenText: t.String(),
        score: t.Number(),
        missedWords: t.Optional(t.Array(t.String())),
        userId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/transcribe-speech",
    async ({ body }) => {
      return await moduleTutorService.transcribeSpeech({
        audioBase64: body.audioBase64,
        mimeType: body.mimeType,
        targetText: body.targetText,
      });
    },
    {
      body: t.Object({
        audioBase64: t.String(),
        mimeType: t.Optional(t.String()),
        targetText: t.Optional(t.String()),
      }),
    }
  )
  // Admin Module CRUD Endpoints
  .post(
    "/admin/modules",
    async ({ body }) => {
      return await curriculumAdminService.createModule(body as any);
    },
    {
      body: t.Object({
        id: t.Optional(t.String()),
        levelId: t.String(),
        title: t.String(),
        cefr: t.String(),
        group: t.String(),
        objective: t.String(),
        complexity: t.Optional(t.String()),
        estimatedMinutes: t.Optional(t.Number()),
        isExam: t.Optional(t.Boolean()),
        passingScore: t.Optional(t.Number()),
        orderIndex: t.Optional(t.Number()),
        sections: t.Optional(t.Array(t.Any())),
      }),
    }
  )
  .put(
    "/admin/modules/:id",
    async ({ params, body }) => {
      return await curriculumAdminService.updateModule(params.id, body as any);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        levelId: t.Optional(t.String()),
        title: t.Optional(t.String()),
        cefr: t.Optional(t.String()),
        group: t.Optional(t.String()),
        objective: t.Optional(t.String()),
        complexity: t.Optional(t.String()),
        estimatedMinutes: t.Optional(t.Number()),
        isExam: t.Optional(t.Boolean()),
        passingScore: t.Optional(t.Number()),
        orderIndex: t.Optional(t.Number()),
        sections: t.Optional(t.Array(t.Any())),
      }),
    }
  )
  .delete(
    "/admin/modules/:id",
    async ({ params }) => {
      return await curriculumAdminService.deleteModule(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    "/admin/modules/ai-draft",
    async ({ body }) => {
      return await curriculumAdminService.generateAiDraft(body as any);
    },
    {
      body: t.Object({
        title: t.String(),
        cefr: t.String(),
        levelId: t.Optional(t.String()),
        objective: t.Optional(t.String()),
      }),
    }
  );

