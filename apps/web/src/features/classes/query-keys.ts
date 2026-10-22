export const classKeys = {
  all: ["classes"] as const,
  list: (userId?: string) => [...classKeys.all, "list", { userId }] as const,
};
