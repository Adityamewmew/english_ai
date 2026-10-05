import { t } from "elysia";

export const PlacementSubmitBody = t.Object({
  userId: t.Optional(t.String()),
  answers: t.Record(t.String(), t.String()),
  writingText: t.Optional(t.String()),
  writingEvaluation: t.Optional(t.Any()),
  speakingAudioBase64: t.Optional(t.String()),
  speakingTranscript: t.Optional(t.String()),
  speakingEvaluation: t.Optional(t.Any()),
});

export const TranscribeBody = t.Object({
  audioBase64: t.String(),
  mimeType: t.Optional(t.String()),
});

export const EvaluateWritingBody = t.Object({
  text: t.String(),
});

export const EvaluateSpeakingBody = t.Object({
  transcript: t.String(),
});
