import { useQuery, useMutation } from "@tanstack/react-query";
import { voiceApi } from "../api/voice.api";
import { voiceKeys } from "../query-keys";

export function useInitialGreeting(params?: { topic?: string; userId?: string; name?: string }) {
  return useQuery({
    queryKey: voiceKeys.greeting(params?.topic || "Daily Casual Chat", params?.userId),
    queryFn: () => voiceApi.getInitialGreeting(params),
  });
}

export function useEvaluateSession() {
  return useMutation({
    mutationFn: voiceApi.evaluateSession,
  });
}
