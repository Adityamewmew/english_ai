export const curriculumKeys = {
  all: ["curriculum"] as const,
  lists: () => [...curriculumKeys.all, "list"] as const,
  list: (filters: { levelId?: string; userId?: string }) =>
    [...curriculumKeys.lists(), filters] as const,
  details: () => [...curriculumKeys.all, "detail"] as const,
  detail: (id: string, userId?: string) =>
    [...curriculumKeys.details(), id, { userId }] as const,
  levels: (userId?: string) => [...curriculumKeys.all, "levels", { userId }] as const,
};
