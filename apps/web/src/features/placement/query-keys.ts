export const placementKeys = {
  all: ["placement"] as const,
  session: () => [...placementKeys.all, "session"] as const,
  latest: (userId: string) => [...placementKeys.all, "latest", userId] as const,
};
