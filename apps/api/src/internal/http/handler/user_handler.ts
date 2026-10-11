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

export const userHandler = new Elysia({ prefix: "/api/user" })
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
    async ({ params, body, headers, set }) => {
      const updaterId = headers["x-user-id"] || "system";
      const data = await updateUserProfileUsecase(params.id, body, updaterId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "User profile updated successfully",
        data,
      });
    },
    {
      params: UserIdParam,
      body: UpdateUserBody,
    }
  )
  .delete(
    "/:id",
    async ({ params, headers, set }) => {
      const deleterId = headers["x-user-id"] || "system";
      await deleteUserUsecase(params.id, deleterId);
      return jsonResponse({
        set,
        statusCode: 200,
        message: "Pengguna berhasil dihapus",
      });
    },
    { params: UserIdParam }
  );
