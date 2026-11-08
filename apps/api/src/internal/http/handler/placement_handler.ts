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
import { userRepository } from "../../repository/user_repository";
import { certificateRepository } from "../../repository/certificate_repository";
import { AiService } from "../../../lib/ai";
import { jsonResponse } from "../../presenter/json";
import { authPlugin } from "../../../lib/auth";
import { UnauthorizedError, ForbiddenError } from "../../../common/errors/app-error";
import { isUserAdmin } from "@english-ai/shared";

export const placementHandler = new Elysia({ prefix: "/api/placement" })
  .use(authPlugin)
  .get("/session", async ({ user, set }) => {
    // Advancement Gate: Active students must complete all current CEFR modules and claim certificate
    if (user && !isUserAdmin(user)) {
      const latestResult = await placementRepository.findLatestByUser(user.id);
      if (latestResult) {
        const userCefr = (user.currentCefr || "A1").slice(0, 2).toUpperCase();
        const stats = await certificateRepository.getCefrCategoryStats(user.id, userCefr);
        const cert = await certificateRepository.findUserCertificateByCefr(user.id, userCefr);

        if (stats.totalModules > 0 && stats.completedModules < stats.totalModules) {
          throw new ForbiddenError(
            `Tes kenaikan level terkunci. Selesaikan seluruh modul CEFR ${userCefr} (${stats.completedModules}/${stats.totalModules}) terlebih dahulu.`
          );
        }
        if (!cert) {
          throw new ForbiddenError(
            `Tes kenaikan level terkunci. Buka sertifikat kelulusan CEFR ${userCefr} terlebih dahulu.`
          );
        }
      }
    }

    const data = await getPlacementSessionUsecase();
    return jsonResponse({
      set,
      statusCode: 200,
      message: "Placement session created successfully",
      data,
    });
  },
  { auth: true }
  )
  .get(
    "/status/:userId",
    async ({ params, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk melihat status tes penempatan.");
      }
      const isAdmin = isUserAdmin(user);
      if (user.id !== params.userId && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk melihat status siswa lain.");
      }

      const cooldown = await placementRepository.checkUserCooldown(params.userId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Placement status retrieved successfully",
        data: {
          ...cooldown,
          isAdmin,
        },
      });
    },
    {
      auth: true,
      params: t.Object({ userId: t.String() }),
    }
  )
  .post(
    "/skip-beginner",
    async ({ user, set }) => {
      const activeUserId = user?.id;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan.");
      }

      // Check if user is already in cooldown (anti-spam)
      if (!isUserAdmin(user)) {
        const cooldown = await placementRepository.checkUserCooldown(activeUserId);
        if (cooldown.isInCooldown) {
          throw new ForbiddenError("Kamu sudah memiliki level penilaian aktif.");
        }
      }

      // 1. Update user currentCefr to A1
      await userRepository.update(activeUserId, { currentCefr: "A1" });

      // 2. Insert beginner self-assessed record
      const record = await placementRepository.createResult({
        userId: activeUserId,
        overallCefr: "A1",
        mcqScore: 0,
        writingScore: 0,
        speakingScore: 0,
        scorePercent: 0,
        details: {
          mode: "self_assessed_beginner",
          note: "Siswa memilih langsung mulai dari level pemula A1 tanpa tes diagnostik.",
          completedAt: new Date().toISOString(),
        },
      });

      return jsonResponse({
        set,
        statusCode: 200,
        message: "Berhasil memilih mulai dari level pemula A1.",
        data: record,
      });
    },
    { auth: true }
  )
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
    async ({ body, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi akun diperlukan untuk transkripsi audio AI.");
      }
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
    { auth: true, body: TranscribeBody }
  )
  .post(
    "/evaluate-writing",
    async ({ body, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi akun diperlukan untuk evaluasi tulisan AI.");
      }
      const data = await AiService.evaluateWriting(body.text);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Writing evaluated successfully",
        data,
      });
    },
    { auth: true, body: EvaluateWritingBody }
  )
  .post(
    "/evaluate-speaking",
    async ({ body, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi akun diperlukan untuk evaluasi percakapan AI.");
      }
      const data = await AiService.evaluateSpeakingSelfIntro(body.transcript);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Speaking evaluated successfully",
        data,
      });
    },
    { auth: true, body: EvaluateSpeakingBody }
  )
  .post(
    "/submit",
    async ({ body, user, set }) => {
      const activeUserId = user?.id;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk mengirim tes penempatan.");
      }

      // Server-side Cooldown Enforcement (Anti-Spam & Cost-Protection SEC-01)
      if (!isUserAdmin(user)) {
        const cooldown = await placementRepository.checkUserCooldown(activeUserId);
        if (cooldown.isInCooldown) {
          throw new ForbiddenError(
            `Masa cooldown tes penempatan kamu masih aktif. Kamu dapat mengambil tes ulang pada ${new Date(
              cooldown.nextAvailableAt!
            ).toLocaleDateString("id-ID")}.`
          );
        }

        // Advancement Gate: Active students must complete all current CEFR modules and claim certificate
        const latestResult = await placementRepository.findLatestByUser(activeUserId);
        if (latestResult) {
          const userCefr = (user.currentCefr || "A1").slice(0, 2).toUpperCase();
          const stats = await certificateRepository.getCefrCategoryStats(activeUserId, userCefr);
          const cert = await certificateRepository.findUserCertificateByCefr(activeUserId, userCefr);

          if (stats.totalModules > 0 && stats.completedModules < stats.totalModules) {
            throw new ForbiddenError(
              `Tes kenaikan level terkunci. Selesaikan seluruh modul CEFR ${userCefr} (${stats.completedModules}/${stats.totalModules}) terlebih dahulu.`
            );
          }
          if (!cert) {
            throw new ForbiddenError(
              `Tes kenaikan level terkunci. Buka sertifikat kelulusan CEFR ${userCefr} terlebih dahulu.`
            );
          }
        }
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
