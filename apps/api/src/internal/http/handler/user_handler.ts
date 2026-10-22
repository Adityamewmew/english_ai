import { Elysia } from "elysia";
import {
  UserIdParam,
  ListUsersQuery,
  LoginUserBody,
  RegisterUserBody,
  UpdateUserBody,
} from "../../entity/user_entity";
import { getUserProfileUsecase } from "../../usecase/user/get-user-profile.usecase";
import { listUsersUsecase } from "../../usecase/user/list-users.usecase";
import { authenticateUserUsecase } from "../../usecase/user/authenticate-user.usecase";
import { registerUserUsecase } from "../../usecase/user/register-user.usecase";
import { updateUserProfileUsecase } from "../../usecase/user/update-user-profile.usecase";
import { deleteUserUsecase } from "../../usecase/user/delete-user.usecase";
import { jsonResponse } from "../../presenter/json";
import { authPlugin } from "../../../lib/auth";
import { UnauthorizedError, ForbiddenError } from "../../../common/errors/app-error";

export const userHandler = new Elysia({ prefix: "/api/user" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query, set }) => {
      const data = await listUsersUsecase({
        keywords: query?.keywords,
        role: query?.role,
        page: query?.page ? Number(query.page) : undefined,
        perPage: query?.perPage ? Number(query.perPage) : undefined,
      });
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Users list retrieved successfully",
        data,
      });
    },
    { query: ListUsersQuery }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const data = await getUserProfileUsecase(params.id);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "User profile retrieved successfully",
        data,
      });
    },
    { params: UserIdParam }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      const data = await authenticateUserUsecase(body);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Login successful",
        data,
      });
    },
    { body: LoginUserBody }
  )
  .post(
    "/register",
    async ({ body, set }) => {
      const data = await registerUserUsecase(body);
      return jsonResponse({
        set,
        statusCode: 201,
        message: "User registered successfully",
        data,
      });
    },
    { body: RegisterUserBody }
  )
  .put(
    "/:id",
    async ({ params, body, headers, user, set }) => {
      const activeUser = user || (headers["x-user-id"] ? { id: headers["x-user-id"] as string, role: "user", accessType: 2 } : null);
      if (!activeUser) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk memperbarui profil.");
      }

      const isAdmin = (activeUser as any).role === "admin" || (activeUser as any).accessType === 1;
      const isOwner = activeUser.id === params.id;

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk memperbarui data pengguna lain.");
      }

      // Non-admin users cannot elevate their own role or accessType
      const safeBody = { ...body };
      if (!isAdmin) {
        delete safeBody.role;
        delete safeBody.accessType;
      }

      const data = await updateUserProfileUsecase(params.id, safeBody, activeUser.id);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "User profile updated successfully",
        data,
      });
    },
    {
      auth: true,
      params: UserIdParam,
      body: UpdateUserBody,
    }
  )
  .delete(
    "/:id",
    async ({ params, headers, user, set }) => {
      const activeUser = user || (headers["x-user-id"] ? { id: headers["x-user-id"] as string, role: "user", accessType: 2 } : null);
      if (!activeUser) {
        throw new UnauthorizedError("Autentikasi diperlukan.");
      }

      const isAdmin = (activeUser as any).role === "admin" || (activeUser as any).accessType === 1;
      const isOwner = activeUser.id === params.id;

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk menghapus pengguna ini.");
      }

      await deleteUserUsecase(params.id, activeUser.id);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Pengguna berhasil dihapus",
      });
    },
    {
      auth: true,
      params: UserIdParam,
    }
  );

