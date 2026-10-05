import { t } from "elysia";

export const AdminQuestionsQuery = t.Optional(
  t.Object({
    cefr: t.Optional(t.String()),
    skill: t.Optional(t.String()),
    keywords: t.Optional(t.String()),
    page: t.Optional(t.String()),
    perPage: t.Optional(t.String()),
  })
);

export const AdminModulesQuery = t.Optional(
  t.Object({
    cefr: t.Optional(t.String()),
  })
);

export const AdminModuleIdParam = t.Object({
  id: t.String(),
});
