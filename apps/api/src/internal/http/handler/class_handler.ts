import { Elysia, t } from "elysia";
import { getClassesUsecase } from "../../usecase/classes/get-classes.usecase";
import { purchaseClassUsecase } from "../../usecase/classes/purchase-class.usecase";
import { checkAiQuotaUsecase } from "../../usecase/classes/check-ai-quota.usecase";
import { jsonResponse } from "../../presenter/json";
import { UnauthorizedError, ForbiddenError } from "../../../common/errors/app-error";
import { authPlugin } from "../../../lib/auth";
import { isUserAdmin } from "@english-ai/shared";

export const classHandler = new Elysia({ prefix: "/api/classes" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query, user, set }) => {
      const activeUserId = isUserAdmin(user) && query?.userId ? query.userId : user?.id;
      const data = await getClassesUsecase(activeUserId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Daftar kelas berhasil diambil",
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
  .get(
    "/quota",
    async ({ query, user, set }) => {
      const activeUserId = isUserAdmin(user) && query?.userId ? query.userId : user?.id;
      if (!activeUserId) {
        throw new UnauthorizedError(
          "Autentikasi diperlukan untuk memeriksa kuota AI."
        );
      }
      const data = await checkAiQuotaUsecase(activeUserId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Kuota AI harian berhasil diambil",
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
    "/purchase",
    async ({ body, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk membuka akses kelas.");
      }
      if (!isUserAdmin(user)) {
        throw new ForbiddenError(
          "Akses kelas mandiri hanya dapat diaktifkan melalui alur pembayaran resmi (SingaPay)."
        );
      }

      const activeUserId = body?.userId || user.id;

      const data = await purchaseClassUsecase(
        activeUserId,
        body.cefr,
        body.tier as any
      );
      return jsonResponse({
        set,
        statusCode: 200,
        message: data.message,
        data,
      });
    },
    {
      auth: true,
      body: t.Object({
        cefr: t.String(),
        tier: t.Optional(t.String()),
        userId: t.Optional(t.String()),
      }),
    }
  );

