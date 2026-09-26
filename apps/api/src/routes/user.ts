import { Elysia, t } from "elysia";
import { userService } from "../services/user.service";

export const userRoutes = new Elysia({ prefix: "/api/user" })
  .get(
    "/",
    async ({ query }) => {
      return await userService.getAll({
        keywords: query.keywords,
        role: query.role,
        page: query.page ? Number(query.page) : undefined,
        perPage: query.perPage ? Number(query.perPage) : undefined,
      });
    },
    {
      query: t.Optional(
        t.Object({
          keywords: t.Optional(t.String()),
          role: t.Optional(t.String()),
          page: t.Optional(t.String()),
          perPage: t.Optional(t.String()),
        })
      ),
    }
  )

  .get(
    "/:id",
    async ({ params }) => {
      return await userService.getById(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  .post(
    "/login",
    async ({ body }) => {
      return await userService.login(body as any);
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  .post(
    "/register",
    async ({ body }) => {
      return await userService.register(body as any);
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  .post(
    "/",
    async ({ body, headers }) => {
      const creatorId = headers["x-user-id"] || "admin-system";
      return await userService.create(body as any, creatorId);
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
        role: t.Optional(t.String()),
        currentCefr: t.Optional(t.String()),
      }),
    }
  )

  .put(
    "/:id",
    async ({ params, body, headers }) => {
      const updaterId = headers["x-user-id"] || "admin-system";
      return await userService.update(params.id, body as any, updaterId);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String()),
        password: t.Optional(t.String()),
        role: t.Optional(t.String()),
        currentCefr: t.Optional(t.String()),
      }),
    }
  )

  .delete(
    "/:id",
    async ({ params, headers }) => {
      const deleterId = headers["x-user-id"] || "admin-system";
      return await userService.delete(params.id, deleterId);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
