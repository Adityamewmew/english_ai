import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placementApi } from "../api/placement.api";
import { placementKeys } from "../query-keys";

export function usePlacementSession() {
  return useQuery({
    queryKey: placementKeys.session(),
    queryFn: placementApi.getSession,
  });
}

export function useLatestPlacement(userId: string) {
  return useQuery({
    queryKey: placementKeys.latest(userId),
    queryFn: () => placementApi.getLatestByUser(userId),
    enabled: !!userId,
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
