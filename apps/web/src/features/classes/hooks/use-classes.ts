import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesApi, CourseClassItem } from "../api/classes.api";
import { classKeys } from "../query-keys";
import { curriculumKeys } from "@/features/curriculum/query-keys";

export function useClasses(userId?: string) {
  return useQuery({
    queryKey: classKeys.list(userId),
    queryFn: () => classesApi.getClasses(userId),
  });
}

export function usePurchaseClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { userId: string; cefr: string }) =>
      classesApi.purchaseClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
    },
  });
}
