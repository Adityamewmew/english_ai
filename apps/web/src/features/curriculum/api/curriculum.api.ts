import { apiClient } from "@/lib/api-client";

export const curriculumApi = {
  getOverview: async (params?: { levelId?: string; userId?: string }) => {
    const { data, error } = await apiClient.api.curriculum.get({
      query: params,
    });
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  getLevels: async (params?: { userId?: string }) => {
    const { data, error } = await apiClient.api.curriculum.levels.get({
      query: params,
    });
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  getModuleDetail: async (id: string, userId?: string) => {
    const { data, error } = await apiClient.api.curriculum.modules({ id }).get({
      query: { userId },
    });
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  submitQuiz: async (
    id: string,
    payload: {
      userId: string;
      answers: Record<string, number>;
      speakingScore?: number;
    }
  ) => {
    const { data, error } = await apiClient.api.curriculum
      .modules({ id })
      .submit.post(payload);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  saveStepProgress: async (
    id: string,
    payload: {
      userId: string;
      currentStep: number;
      unlockedStep: number;
      completedSteps: number[];
      isPracticeUnlocked: boolean;
      isSpeakingComplete?: boolean;
    }
  ) => {
    const { data, error } = await apiClient.api.curriculum
      .modules({ id })["step-progress"]
      .post(payload);
    if (error) throw new Error(String(error.value));
    return data?.data;
  },
};
