import { Elysia, t } from "elysia";
import { getCertificateStatusUsecase } from "../../usecase/certificate/get-certificate-status.usecase";
import { claimCertificateUsecase } from "../../usecase/certificate/claim-certificate.usecase";
import { getMyCertificatesUsecase } from "../../usecase/certificate/get-my-certificates.usecase";
import { jsonResponse } from "../../presenter/json";
import { UnauthorizedError } from "../../../common/errors/app-error";
import { authPlugin } from "../../../lib/auth";

export const certificateHandler = new Elysia({ prefix: "/api/curriculum/certificates" })
  .use(authPlugin)
  .get(
    "/status",
    async ({ query, user, set }) => {
      const activeUserId = user?.id || query?.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk melihat status sertifikat.");
      }

      const data = await getCertificateStatusUsecase(activeUserId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Status sertifikat CEFR berhasil diambil",
        data,
      });
    },
    {
      auth: true,
      query: t.Optional(
        t.Object({
          userId: t.Optional(t.String()),
        })
      ),
    }
  )
  .post(
    "/claim",
    async ({ body, user, set }) => {
      const activeUserId = user?.id || body?.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk mengklaim sertifikat.");
      }

      const data = await claimCertificateUsecase(activeUserId, body.cefr);
      return jsonResponse({
        set,
        statusCode: 201,
        message: `Sertifikat CEFR ${body.cefr.toUpperCase()} berhasil diklaim!`,
        data,
      });
    },
    {
      auth: true,
      body: t.Object({
        cefr: t.String(),
        userId: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/my",
    async ({ query, user, set }) => {
      const activeUserId = user?.id || query?.userId;
      if (!activeUserId) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk melihat sertifikat Anda.");
      }

      const data = await getMyCertificatesUsecase(activeUserId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Daftar sertifikat siswa berhasil diambil",
        data,
      });
    },
    {
      auth: true,
      query: t.Optional(
        t.Object({
          userId: t.Optional(t.String()),
        })
      ),
    }
  );
