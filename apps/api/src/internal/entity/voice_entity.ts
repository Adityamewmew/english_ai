import { t } from "elysia";

export const VoiceCreateSessionBody = t.Object({
  topic: t.String({ minLength: 1 }),
  moduleId: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  sttProvider: t.Optional(t.String()),
});

export const VoiceTtsQuery = t.Object({
  text: t.String({ minLength: 1 }),
  voice: t.Optional(t.String()),
});

export const VoiceTtsBody = t.Object({
  text: t.String({ minLength: 1 }),
  voice: t.Optional(t.String()),
});

export const VoiceTurnStreamBody = t.Object({
  sessionId: t.Optional(t.String()),
  topic: t.String(),
  history: t.Array(
    t.Object({
      role: t.Union([t.Literal("assistant"), t.Literal("user")]),
      content: t.String(),
    })
  ),
  studentMessage: t.String(),
  turnIndex: t.Optional(t.Number()),
  userId: t.Optional(t.String()),
  moduleId: t.Optional(t.String()),
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
  sessionId: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  topic: t.String(),
  durationSeconds: t.Number(),
  transcript: t.Optional(t.String()),
  sttProvider: t.Optional(t.String()),
});
