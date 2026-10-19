import { apiClient } from "@/lib/api-client";

export const voiceApi = {
  startSession: async (payload: {
    topic: string;
    moduleId?: string;
    userId?: string;
    sttProvider?: string;
  }) => {
    const { data, error } = await apiClient.api.voice.sessions.post(payload);
    if (error) throw new Error(String(error.value));
    return (data as any)?.data || data;
  },

  getInitialGreeting: async (params?: { topic?: string; userId?: string; name?: string }) => {
    const { data, error } = await apiClient.api.voice["initial-greeting"].get({
      query: params,
    });
    if (error) throw new Error(String(error.value));
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
    if (error) throw new Error(String(error.value));
    return data;
  },

  getSessions: async (userId?: string) => {
    if (!userId) return [];
    const { data, error } = await apiClient.api.voice.sessions.get({
      query: { userId },
    });
    if (error) throw new Error(String(error.value));
    return (data as any)?.data || [];
  },
};
