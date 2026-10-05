import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { curriculumApi } from "../api/curriculum.api";
import { curriculumKeys } from "../query-keys";

export function useModuleDetail(moduleId: string, userId?: string) {
  return useQuery({
    queryKey: curriculumKeys.detail(moduleId, userId),
    queryFn: () => curriculumApi.getModuleDetail(moduleId, userId),
    enabled: !!moduleId,
  });
}

export function useSubmitQuiz(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      userId: string;
      answers: Record<string, number>;
      speakingScore?: number;
    }) => curriculumApi.submitQuiz(moduleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: curriculumKeys.all });
    },
  });
}

export function useSaveStepProgress(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      userId: string;
      currentStep: number;
      unlockedStep: number;
      completedSteps: number[];
      isPracticeUnlocked: boolean;
      isSpeakingComplete?: boolean;
    }) => curriculumApi.saveStepProgress(moduleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: curriculumKeys.detail(moduleId) });
    },
  });
}
