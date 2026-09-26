import { Elysia, t } from "elysia";
import { placementService } from "../services/placement.service";

export const placementRoutes = new Elysia({ prefix: "/api/placement" })
  .get("/session", async () => {
    return await placementService.getDynamicTestSession();
  })

  .get("/latest/:userId", async ({ params }) => {
    return await placementService.getLatestByUser(params.userId);
  })

  .post(
    "/transcribe-speaking",
    async ({ body }) => {
      return await placementService.transcribeSpeaking(
        body.audioBase64,
        body.mimeType || "audio/webm"
      );
    },
    {
      body: t.Object({
        audioBase64: t.String(),
        mimeType: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/evaluate-writing",
    async ({ body }) => {
      return await placementService.evaluateWriting(body.text);
    },
    {
      body: t.Object({
        text: t.String(),
      }),
    }
  )

  .post(
    "/evaluate-speaking",
    async ({ body }) => {
      return await placementService.evaluateSpeaking(body.transcript);
    },
    {
      body: t.Object({
        transcript: t.String(),
      }),
    }
  )

  .post(
    "/submit",
    async ({ body }) => {
      const userId = body.userId || "anonymous";

      let speakingEvaluation = body.speakingEvaluation;
      if (!speakingEvaluation && body.speakingTranscript && body.speakingTranscript.trim().split(/\s+/).filter(Boolean).length >= 3) {
        try {
          const evalRes = await placementService.evaluateSpeaking(body.speakingTranscript.trim());
          if (evalRes.success) speakingEvaluation = evalRes.data;
        } catch (err) {
          console.warn("AI Speaking evaluation error:", err);
        }
      }

      let writingEvaluation = null;
      if (body.writingText && body.writingText.trim().length > 10) {
        try {
          const evalRes = await placementService.evaluateWriting(body.writingText.trim());
          if (evalRes.success) writingEvaluation = evalRes.data;
        } catch (err) {
          console.warn("AI Writing evaluation error:", err);
        }
      }

      const result = await placementService.submit(userId, {
        mcqAnswers: body.mcqAnswers,
        writingText: body.writingText,
        speakingTranscript: body.speakingTranscript,
        speakingEvaluation,
      });

      if (result.success && result.data) {
        if (writingEvaluation) result.data.writingEvaluation = writingEvaluation;
        if (speakingEvaluation) result.data.speakingEvaluation = speakingEvaluation;
        result.data.speakingTranscript = body.speakingTranscript;
      }

      return result;
    },
    {
      body: t.Object({
        userId: t.Optional(t.String()),
        mcqAnswers: t.Record(t.String(), t.String()),
        writingText: t.Optional(t.String()),
        speakingTranscript: t.Optional(t.String()),
        speakingEvaluation: t.Optional(t.Any()),
      }),
    }
  );
