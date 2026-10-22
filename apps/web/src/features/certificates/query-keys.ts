export const certificateKeys = {
  all: ["certificates"] as const,
  status: (userId?: string, cefr?: string) => [...certificateKeys.all, "status", { userId, cefr }] as const,
  my: (userId?: string) => [...certificateKeys.all, "my", { userId }] as const,
};
