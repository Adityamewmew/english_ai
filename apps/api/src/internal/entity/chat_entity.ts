import { t } from "elysia";

export const CreateChatSessionBody = t.Object({
  title: t.Optional(t.String()),
  userId: t.Optional(t.String()),
});

export const SendChatMessageBody = t.Object({
  message: t.String({ minLength: 1, maxLength: 4000 }),
  userId: t.Optional(t.String()),
});

export const ChatSessionParam = t.Object({
  id: t.String(),
});
