import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "../api/payment.api";

export const paymentKeys = {
  all: ["payment"] as const,
  methods: () => [...paymentKeys.all, "methods"] as const,
  order: (orderId: string) => [...paymentKeys.all, "order", orderId] as const,
};

export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentKeys.methods(),
    queryFn: () => paymentApi.getMethods(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentOrder(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.order(orderId),
    queryFn: () => paymentApi.getOrder(orderId),
    refetchInterval: (query) => {
      // Auto-poll every 4 seconds if pending or waiting approval
      const status = query.state.data?.status;
      if (status === "pending" || status === "waiting_approval") {
        return 4000;
      }
      return false;
    },
  });
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: paymentApi.createOrder,
  });
}

export function useUploadProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, proofUrl }: { orderId: string; proofUrl: string }) =>
      paymentApi.uploadProof(orderId, proofUrl),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.order(orderId) });
    },
  });
}

export function useSimulateSandbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => paymentApi.simulateSandbox(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}
