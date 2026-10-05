import { t } from "elysia";

export const UserIdParam = t.Object({
  id: t.String(),
});

export const ListUsersQuery = t.Optional(
  t.Object({
    keywords: t.Optional(t.String()),
    role: t.Optional(t.String()),
    page: t.Optional(t.String()),
    perPage: t.Optional(t.String()),
  })
);

export const LoginUserBody = t.Object({
  email: t.String(),
  password: t.String(),
});
export type LoginUserBody = typeof LoginUserBody.static;

export const RegisterUserBody = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
  role: t.Optional(t.String()),
  currentCefr: t.Optional(t.String()),
});
export type RegisterUserBody = typeof RegisterUserBody.static;

export const UpdateUserBody = t.Object({
  name: t.Optional(t.String({ minLength: 2 })),
  email: t.Optional(t.String({ format: "email" })),
  password: t.Optional(t.String({ minLength: 6 })),
  role: t.Optional(t.String()),
  accessType: t.Optional(t.Numeric()),
  currentCefr: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
});
export type UpdateUserBody = typeof UpdateUserBody.static;
