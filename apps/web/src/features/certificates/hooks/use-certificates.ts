import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificatesApi } from "../api/certificates.api";
import { certificateKeys } from "../query-keys";

export function useCertificateStatus(userId?: string, cefr?: string) {
  return useQuery({
    queryKey: certificateKeys.status(userId, cefr),
    queryFn: () => certificatesApi.getStatus(userId, cefr),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyCertificates(userId?: string) {
  return useQuery({
    queryKey: certificateKeys.my(userId),
    queryFn: () => certificatesApi.getMyCertificates(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useClaimCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cefr, userId }: { cefr: string; userId?: string }) =>
      certificatesApi.claim(cefr, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}
