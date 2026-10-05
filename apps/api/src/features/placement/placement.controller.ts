import { Elysia, t } from "elysia";
import {
  PlacementSubmitBody,
  TranscribeBody,
  EvaluateWritingBody,
  EvaluateSpeakingBody,
} from "./placement.model";
import { getPlacementSessionUsecase } from "./usecases/get-placement-session.usecase";
import { submitPlacementUsecase } from "./usecases/submit-placement.usecase";
import { placementRepository } from "./placement.repository";
import { GeminiService } from "../../lib/gemini";

export const placementController = new Elysia({ prefix: "/api/placement" })
  .get("/session", async () => {
    const data = await getPlacementSessionUsecase();
    return { success: true, data };
  })
  .get(
    "/latest/:userId",
    async ({ params }) => {
      const data = await placementRepository.findLatestByUser(params.userId);
      return { success: true, data };
    },
    { params: t.Object({ userId: t.String() }) }
  )
  .post(
    "/transcribe-speaking",
    async ({ body }) => {
      const transcript = await GeminiService.transcribeAudioSelfIntro(
        body.audioBase64,
        body.mimeType || "audio/webm"
      );
      return { success: true, data: { transcript } };
    },
    { body: TranscribeBody }
  )
  .post(
    "/evaluate-writing",
    async ({ body }) => {
      const data = await GeminiService.evaluateWriting(body.text);
      return { success: true, data };
    },
    { body: EvaluateWritingBody }
  )
  .post(
    "/evaluate-speaking",
    async ({ body }) => {
      const data = await GeminiService.evaluateSpeakingSelfIntro(body.transcript);
      return { success: true, data };
    },
    { body: EvaluateSpeakingBody }
  )
  .post(
    "/submit",
    async ({ body }) => {
      const data = await submitPlacementUsecase(body);
      return { success: true, data };
    },
    { body: PlacementSubmitBody }
  );
