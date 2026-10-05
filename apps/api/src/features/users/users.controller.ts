import { Elysia } from "elysia";
import {
  UserIdParam,
  ListUsersQuery,
  LoginUserBody,
  RegisterUserBody,
  UpdateUserBody,
} from "./users.model";
import { getUserProfileUsecase } from "./usecases/get-user-profile.usecase";
import { listUsersUsecase } from "./usecases/list-users.usecase";
import { authenticateUserUsecase } from "./usecases/authenticate-user.usecase";
import { registerUserUsecase } from "./usecases/register-user.usecase";
import { updateUserProfileUsecase } from "./usecases/update-user-profile.usecase";
import { deleteUserUsecase } from "./usecases/delete-user.usecase";

export const usersController = new Elysia({ prefix: "/api/user" })
  .get(
    "/",
    async ({ query }) => {
      const data = await listUsersUsecase({
        keywords: query?.keywords,
        role: query?.role,
        page: query?.page ? Number(query.page) : undefined,
        perPage: query?.perPage ? Number(query.perPage) : undefined,
      });
      return { success: true, data };
    },
    { query: ListUsersQuery }
  )
  .get(
    "/:id",
    async ({ params }) => {
      const data = await getUserProfileUsecase(params.id);
      return { success: true, data };
    },
    { params: UserIdParam }
  )
  .post(
    "/login",
    async ({ body }) => {
      const data = await authenticateUserUsecase(body);
      return { success: true, data };
    },
    { body: LoginUserBody }
  )
  .post(
    "/register",
    async ({ body }) => {
      const data = await registerUserUsecase(body);
      return { success: true, data };
    },
    { body: RegisterUserBody }
  )
  .put(
    "/:id",
    async ({ params, body, headers }) => {
      const updaterId = headers["x-user-id"] || "system";
      const data = await updateUserProfileUsecase(params.id, body, updaterId);
      return { success: true, data };
    },
    {
      params: UserIdParam,
      body: UpdateUserBody,
    }
  )
  .delete(
    "/:id",
    async ({ params, headers }) => {
      const deleterId = headers["x-user-id"] || "system";
      await deleteUserUsecase(params.id, deleterId);
      return { success: true, message: "Pengguna berhasil dihapus" };
    },
    { params: UserIdParam }
  );
