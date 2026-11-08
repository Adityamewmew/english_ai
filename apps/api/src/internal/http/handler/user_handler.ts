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
import { isUserAdmin } from "@english-ai/shared";

// SK12: In-memory brute-force rate limiter (5 attempts per 15 minutes)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(key: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 5) {
    return false;
  }
  record.count += 1;
  return true;
}

function clearLoginRateLimit(key: string) {
  loginAttempts.delete(key);
}

export const userHandler = new Elysia({ prefix: "/api/user" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk melihat daftar pengguna.");
      }
      if (!isUserAdmin(user)) {
        throw new ForbiddenError("Hanya administrator yang diizinkan melihat direktori pengguna.");
      }

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
    { auth: true, query: ListUsersQuery }
  )
  .get(
    "/:id",
    async ({ params, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk melihat data pengguna.");
      }
      const isOwner = user.id === params.id;
      const isAdmin = isUserAdmin(user);
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk melihat profil pengguna lain.");
      }

      const data = await getUserProfileUsecase(params.id);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "User profile retrieved successfully",
        data,
      });
    },
    { auth: true, params: UserIdParam }
  )
  .post(
    "/login",
    async ({ body, set, request }) => {
      const clientIp = request.headers.get("x-forwarded-for") || "local";
      const rateLimitKey = `${clientIp}:${body.email.toLowerCase()}`;

      if (!checkLoginRateLimit(rateLimitKey)) {
        throw new ForbiddenError(
          "Terlalu banyak percobaan login yang gagal. Silakan coba lagi setelah 15 menit."
        );
      }

      try {
        const data = await authenticateUserUsecase(body);
        clearLoginRateLimit(rateLimitKey);
        return jsonResponse({
          set,
          statusCode: 200,
          message: "Login successful",
          data,
        });
      } catch (err) {
        throw err;
      }
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
    async ({ params, body, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan untuk memperbarui profil.");
      }

      const isAdmin = isUserAdmin(user);
      const isOwner = user.id === params.id;

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk memperbarui data pengguna lain.");
      }

      // Non-admin users cannot elevate their own role or accessType
      const safeBody = { ...body };
      if (!isAdmin) {
        delete safeBody.role;
        delete safeBody.accessType;
      }

      const data = await updateUserProfileUsecase(params.id, safeBody, user.id);
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
    async ({ params, user, set }) => {
      if (!user) {
        throw new UnauthorizedError("Autentikasi diperlukan.");
      }

      const isAdmin = isUserAdmin(user);
      const isOwner = user.id === params.id;

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError("Kamu tidak memiliki izin untuk menghapus pengguna ini.");
      }

      await deleteUserUsecase(params.id, user.id);
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

