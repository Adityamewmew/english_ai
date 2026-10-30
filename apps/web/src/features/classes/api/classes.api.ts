import { apiClient } from "@/lib/api-client";

export interface TierPlan {
  name?: string;
  price: number;
  originalPrice?: number | null;
  dailyChatLimit: number;
  dailyVoiceMinutes: number;
  features: string[];
}

export interface TierPlans {
  basic: TierPlan;
  pro: TierPlan;
  ultra: TierPlan;
}

export interface CourseClassItem {
  id: string;
  cefr: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  features?: string[] | null;
  tierPlans?: TierPlans | null;
  isActive: boolean;
  orderIndex: number;
  hasAccess: boolean;
  isExpired?: boolean;
  expiresAt?: string | null;
  daysRemaining?: number | null;
  userTier?: "basic" | "pro" | "ultra" | "admin" | null;
  isEligible: boolean;
  prerequisiteCefr?: string | null;
  requiresCertificate?: boolean;
}

export interface AiQuotaResult {
  tier: "admin" | "ultra" | "pro" | "basic" | "trial";
  tierName: string;
  usageDate: string;
  chat: {
    used: number;
    limit: number;
    remaining: number;
    isExceeded: boolean;
  };
  voice: {
    usedSeconds: number;
    usedMinutes: number;
    limitMinutes: number;
    remainingMinutes: number;
    isExceeded: boolean;
  };
  canChat: boolean;
  canVoice: boolean;
}

export const classesApi = {
  getClasses: async (userId?: string) => {
    const { data, error } = await (apiClient.api.classes as any).get({
      query: { userId },
    });
    if (error) throw new Error(String(error.value));
    return data?.data as CourseClassItem[];
  },

  purchaseClass: async (payload: {
    userId: string;
    cefr: string;
    tier?: "basic" | "pro" | "ultra";
  }) => {
    const { data, error } = await (apiClient.api.classes as any).purchase.post(
      payload
    );
    if (error) throw new Error(String(error.value));
    return data?.data;
  },

  getQuota: async (userId?: string) => {
    const { data, error } = await (apiClient.api.classes as any).quota.get({
      query: { userId },
    });
    if (error) throw new Error(String(error.value));
    return data?.data as AiQuotaResult;
  },
};

