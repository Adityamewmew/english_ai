import { useQuery } from "@tanstack/react-query";
import { curriculumApi } from "../api/curriculum.api";
import { curriculumKeys } from "../query-keys";

export function useCurriculumOverview(params?: {
  levelId?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: curriculumKeys.list(params || {}),
    queryFn: () => curriculumApi.getOverview(params),
  });
}

export function useCurriculumLevels(userId?: string) {
  return useQuery({
    queryKey: curriculumKeys.levels(userId),
    queryFn: () => curriculumApi.getLevels({ userId }),
  });
}
