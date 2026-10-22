export const classKeys = {
  all: ["classes"] as const,
  list: (userId?: string) => [...classKeys.all, "list", { userId }] as const,
  quota: (userId?: string) => [...classKeys.all, "quota", { userId }] as const,
};

