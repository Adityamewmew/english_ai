import { apiClient } from "@/lib/api-client";

export const voiceApi = {
  getInitialGreeting: async (params?: { topic?: string; userId?: string; name?: string }) => {
    const { data, error } = await apiClient.api.voice["initial-greeting"].get({
      query: params,
    });
    if (error) throw new Error(String(error.value));
    return data;
  },

  evaluateSession: async (payload: {
    userId?: string;
    topic: string;
    durationSeconds: number;
    transcript?: string;
  }) => {
    const { data, error } = await apiClient.api.voice.evaluate.post(payload);
    if (error) throw new Error(String(error.value));
    return data;
  },
};
