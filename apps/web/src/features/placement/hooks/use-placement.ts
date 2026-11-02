import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placementApi } from "../api/placement.api";
import { placementKeys } from "../query-keys";

export function usePlacementSession() {
  return useQuery({
    queryKey: placementKeys.session(),
    queryFn: placementApi.getSession,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useLatestPlacement(userId: string) {
  return useQuery({
    queryKey: placementKeys.latest(userId),
    queryFn: () => placementApi.getLatestByUser(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function usePlacementStatus(userId?: string) {
  return useQuery({
    queryKey: placementKeys.status(userId || "anon"),
    queryFn: () => (userId ? placementApi.getStatus(userId) : null),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useSkipBeginner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: placementApi.skipBeginner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: placementKeys.all });
    },
  });
}

export function useSubmitPlacement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: placementApi.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: placementKeys.all });
    },
  });
}
