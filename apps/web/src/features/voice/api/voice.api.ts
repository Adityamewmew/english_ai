import { apiClient } from "@/lib/api-client";

function extractEdenError(error: any): Error {
  const val = error?.value;
  const message =
    typeof val === "object"
      ? val?.message || JSON.stringify(val)
      : String(val || error?.status || "API Error");
  const err = new Error(message);
  (err as any).status = error?.status || (typeof val === "object" ? val?.statusCode : undefined);
  return err;
}

export const voiceApi = {
  startSession: async (payload: {
    topic: string;
    moduleId?: string;
    userId?: string;
    sttProvider?: string;
  }) => {
    const { data, error } = await apiClient.api.voice.sessions.post(payload);
    if (error) throw extractEdenError(error);
    return (data as any)?.data || data;
  },

  getInitialGreeting: async (params?: { topic?: string; userId?: string; name?: string }) => {
    const { data, error } = await apiClient.api.voice["initial-greeting"].get({
      query: params,
    });
    if (error) throw extractEdenError(error);
    return data;
  },

  evaluateSession: async (payload: {
    sessionId?: string;
    userId?: string;
    topic: string;
    durationSeconds: number;
    transcript?: string;
    sttProvider?: string;
  }) => {
    const { data, error } = await apiClient.api.voice.evaluate.post(payload);
    if (error) throw extractEdenError(error);
    return data;
  },

  getSessions: async (userId?: string) => {
    if (!userId) return [];
    const { data, error } = await apiClient.api.voice.sessions.get({
      query: { userId },
    });
    if (error) throw extractEdenError(error);
    return (data as any)?.data || [];
  },
};
