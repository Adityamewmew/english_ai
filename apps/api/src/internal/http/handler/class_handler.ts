import { Elysia, t } from "elysia";
import { getClassesUsecase } from "../../usecase/classes/get-classes.usecase";
import { purchaseClassUsecase } from "../../usecase/classes/purchase-class.usecase";
import { jsonResponse } from "../../presenter/json";
import { UnauthorizedError } from "../../../common/errors/app-error";
import { authPlugin } from "../../../lib/auth";

export const classHandler = new Elysia({ prefix: "/api/classes" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query, user, set }) => {
      const activeUserId = user?.id || query?.userId;
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
  .post(
    "/purchase",
    async ({ body, user, set }) => {
      const activeUserId = user?.id || body?.userId;
      if (!activeUserId) {
        throw new UnauthorizedError(
          "Autentikasi diperlukan untuk membuka akses kelas."
        );
      }

      const data = await purchaseClassUsecase(activeUserId, body.cefr);
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
        userId: t.Optional(t.String()),
      }),
    }
  );
