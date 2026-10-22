import { apiClient } from "@/lib/api-client";

export interface CourseClassItem {
  id: string;
  cefr: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  features?: string[] | null;
  isActive: boolean;
  orderIndex: number;
  hasAccess: boolean;
  isEligible: boolean;
  prerequisiteCefr?: string | null;
  requiresCertificate?: boolean;
}

export const classesApi = {
  getClasses: async (userId?: string) => {
    const { data, error } = await (apiClient.api.classes as any).get({
      query: { userId },
    });
    if (error) throw new Error(String(error.value));
    return data?.data as CourseClassItem[];
  },

  purchaseClass: async (payload: { userId: string; cefr: string }) => {
    const { data, error } = await (apiClient.api.classes as any).purchase.post(
      payload
    );
    if (error) throw new Error(String(error.value));
    return data?.data;
  },
};
