export const userKeys = {
  all: ["users"] as const,
  profile: (id: string) => [...userKeys.all, "profile", id] as const,
  list: (params: any) => [...userKeys.all, "list", params] as const,
};
