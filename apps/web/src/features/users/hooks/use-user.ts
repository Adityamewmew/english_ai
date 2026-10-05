import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";
import { userKeys } from "../query-keys";

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => usersApi.getProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => usersApi.updateProfile(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.profile(userId) });
    },
  });
}
