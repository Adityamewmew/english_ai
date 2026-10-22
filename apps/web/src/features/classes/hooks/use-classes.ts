import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesApi } from "../api/classes.api";
import { classKeys } from "../query-keys";
import { curriculumKeys } from "@/features/curriculum/query-keys";

export function useClasses(userId?: string) {
  return useQuery({
    queryKey: classKeys.list(userId),
    queryFn: () => classesApi.getClasses(userId),
  });
}

export function useAiQuota(userId?: string) {
  return useQuery({
    queryKey: classKeys.quota(userId),
    queryFn: () => classesApi.getQuota(userId),
    refetchInterval: 30000, // Background poll every 30s
  });
}

export function usePurchaseClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      userId: string;
      cefr: string;
      tier?: "basic" | "pro" | "ultra";
    }) => classesApi.purchaseClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
    },
  });
}

