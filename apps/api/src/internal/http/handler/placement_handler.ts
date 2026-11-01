import { Elysia, t } from "elysia";
import {
  PlacementSubmitBody,
  TranscribeBody,
  EvaluateWritingBody,
  EvaluateSpeakingBody,
} from "../../entity/placement_entity";
import { getPlacementSessionUsecase } from "../../usecase/placement/get-placement-session.usecase";
import { submitPlacementUsecase } from "../../usecase/placement/submit-placement.usecase";
import { placementRepository } from "../../repository/placement_repository";
import { AiService } from "../../../lib/ai";
import { jsonResponse } from "../../presenter/json";
import { authPlugin } from "../../../lib/auth";
import { UnauthorizedError, ForbiddenError } from "../../../common/errors/app-error";
import { isUserAdmin } from "@english-ai/shared";

export const placementHandler = new Elysia({ prefix: "/api/placement" })
  .use(authPlugin)
  .get("/session", async ({ set }) => {
    const data = await getPlacementSessionUsecase();
    return jsonResponse({
      set,
      statusCode: 200,
      message: "Placement session created successfully",
      data,
    });
  })
  .get(
    "/latest/:userId",
    async ({ params, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk melihat hasil placement test.");
      }
      const isAdmin = isUserAdmin(user);
      if (user.id !== params.userId && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk melihat hasil tes siswa lain.");
      }

      const data = await placementRepository.findLatestByUser(params.userId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Latest placement result retrieved successfully",
        data,
      });
    },
    {
      auth: true,
      params: t.Object({ userId: t.String() }),
    }
  )
  .post(
    "/transcribe-speaking",
    async ({ body, set }) => {
      const transcript = await AiService.transcribeAudioSelfIntro(
        body.audioBase64,
        body.mimeType || "audio/webm"
      );
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Audio transcribed successfully",
        data: { transcript },
      });
    },
    { body: TranscribeBody }
  )
  .post(
    "/evaluate-writing",
    async ({ body, set }) => {
      const data = await AiService.evaluateWriting(body.text);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Writing evaluated successfully",
        data,
      });
    },
    { body: EvaluateWritingBody }
  )
  .post(
    "/evaluate-speaking",
    async ({ body, set }) => {
      const data = await AiService.evaluateSpeakingSelfIntro(body.transcript);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Speaking evaluated successfully",
        data,
      });
    },
    { body: EvaluateSpeakingBody }
  )
  .post(
    "/submit",
    async ({ body, user, set }) => {
      const activeUserId = user?.id;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk mengirim tes penempatan.");
      }
      const data = await submitPlacementUsecase({ ...body, userId: activeUserId });
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Placement submitted successfully",
        data,
      });
    },
    {
      auth: true,
      body: PlacementSubmitBody,
    }
  );
