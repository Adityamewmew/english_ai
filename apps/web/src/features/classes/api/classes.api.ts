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
    remainingSeconds?: number;
    isExceeded: boolean;
  };
  canChat: boolean;
  canVoice: boolean;
}

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

export const classesApi = {
  getClasses: async (userId?: string) => {
    const { data, error } = await (apiClient.api.classes as any).get({
      query: { userId },
    });
    if (error) throw extractEdenError(error);
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
    if (error) throw extractEdenError(error);
    return data?.data;
  },

  getQuota: async (userId?: string) => {
    const { data, error } = await (apiClient.api.classes as any).quota.get({
      query: { userId },
    });
    if (error) throw extractEdenError(error);
    return data?.data as AiQuotaResult;
  },
};

