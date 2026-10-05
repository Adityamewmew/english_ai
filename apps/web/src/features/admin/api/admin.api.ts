import { apiClient } from "@/lib/api-client";

export interface AdminModuleListItem {
  id: string;
  levelId: string;
  levelTitle?: string;
  title: string;
  cefr: string;
  group: string;
  objective: string;
  complexity: string;
  estimatedMinutes: number;
  isExam: boolean;
  passingScore: number;
  orderIndex: number;
  sectionsCount: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalModules: number;
  totalLevels: number;
  totalQuestions: number;
  totalCompletedModules: number;
  totalInProgressModules: number;
  recentStudents: Array<{
    id: string;
    name: string;
    email: string;
    currentCefr: string;
    createdAt: Date;
  }>;
  cefrDistribution: Record<string, number>;
}

export const adminApi = {
  getStats: async (): Promise<AdminDashboardStats> => {
    const { data, error } = await apiClient.api.admin.stats.get();
    if (error) throw new Error(String(error.value));
    return (data as any)?.data;
  },

  getAllModules: async (cefrFilter?: string): Promise<AdminModuleListItem[]> => {
    const { data, error } = await apiClient.api.admin.modules.get({
      query: { cefr: cefrFilter },
    });
    if (error) throw new Error(String(error.value));
    return (data as any)?.data || [];
  },

  getModuleDetail: async (id: string) => {
    const { data, error } = await apiClient.api.admin.modules({ id }).get();
    if (error) throw new Error(String(error.value));
    return (data as any)?.data;
  },

  getAllQuestions: async (params?: {
    cefr?: string;
    skill?: string;
    keywords?: string;
    page?: number;
    perPage?: number;
  }) => {
    const { data, error } = await apiClient.api.admin.questions.get({
      query: {
        cefr: params?.cefr,
        skill: params?.skill,
        keywords: params?.keywords,
        page: params?.page ? String(params.page) : undefined,
        perPage: params?.perPage ? String(params.perPage) : undefined,
      },
    });
    if (error) throw new Error(String(error.value));
    return (data as any)?.data;
  },
};
