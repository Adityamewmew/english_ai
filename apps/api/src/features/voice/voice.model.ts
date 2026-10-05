import { t } from "elysia";

export const VoiceTtsQuery = t.Object({
  text: t.String({ minLength: 1 }),
});

export const VoiceTurnStreamBody = t.Object({
  topic: t.String(),
  history: t.Array(
    t.Object({
      role: t.Union([t.Literal("assistant"), t.Literal("user")]),
      content: t.String(),
    })
  ),
  studentMessage: t.String(),
});

export const VoiceGreetingQuery = t.Optional(
  t.Object({
    topic: t.Optional(t.String()),
    userId: t.Optional(t.String()),
    name: t.Optional(t.String()),
    hasCalledBefore: t.Optional(t.String()),
  })
);

export const VoiceEvaluateBody = t.Object({
  userId: t.Optional(t.String()),
  topic: t.String(),
  durationSeconds: t.Number(),
  transcript: t.Optional(t.String()),
});
