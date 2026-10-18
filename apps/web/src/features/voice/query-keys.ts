export const voiceKeys = {
  all: ["voice"] as const,
  greeting: (topic: string, userId?: string) =>
    [...voiceKeys.all, "greeting", topic, userId] as const,
  sessions: (userId?: string) =>
    [...voiceKeys.all, "sessions", userId] as const,
};
