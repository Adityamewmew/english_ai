import { classRepository } from "../../repository/class_repository";
import { aiUsageRepository } from "../../repository/ai_usage_repository";
import { userRepository } from "../../repository/user_repository";
import { isUserAdmin } from "@english-ai/shared";

export interface AiQuotaResult {
  tier: "admin" | "ultra" | "pro" | "basic" | "trial";
  tierName: string;
  usageDate: string;
  chat: {
    used: number;
    limit: number; // -1 for unlimited
    remaining: number; // -1 for unlimited
    isExceeded: boolean;
  };
  voice: {
    usedSeconds: number;
    usedMinutes: number;
    limitMinutes: number; // -1 for unlimited
    remainingMinutes: number; // -1 for unlimited
    isExceeded: boolean;
  };
  canChat: boolean;
  canVoice: boolean;
}

export async function checkAiQuotaUsecase(userId: string): Promise<AiQuotaResult> {
  const usageDate = aiUsageRepository.getTodayDateString();

  // Check user role via repository
  const u = await userRepository.findById(userId);

  const isAdmin = isUserAdmin(u);

  if (isAdmin) {
    const usage = await aiUsageRepository.getDailyUsage(userId, usageDate);
    return {
      tier: "admin",
      tierName: "Administrator (Unlimited)",
      usageDate,
      chat: {
        used: usage.chatCount,
        limit: -1,
        remaining: -1,
        isExceeded: false,
      },
      voice: {
        usedSeconds: usage.voiceSeconds,
        usedMinutes: Math.round(usage.voiceSeconds / 60),
        limitMinutes: -1,
        remainingMinutes: -1,
        isExceeded: false,
      },
      canChat: true,
      canVoice: true,
    };
  }

  // Find user's active class accesses
  const accesses = await classRepository.findUserAccesses(userId);

  let activeTier: "ultra" | "pro" | "basic" | "trial" = "trial";
  let tierName = "Trial Gratis";
  let chatLimit = 5;
  let voiceLimitMinutes = 1;

  if (accesses.length > 0) {
    const tiers = accesses.map((a: any) => (a.tier || "basic").toLowerCase());
    if (tiers.includes("ultra")) {
      activeTier = "ultra";
      tierName = "Paket Ultra";
      chatLimit = -1; // Unlimited
      voiceLimitMinutes = 120;
    } else if (tiers.includes("pro")) {
      activeTier = "pro";
      tierName = "Paket Pro";
      chatLimit = 100;
      voiceLimitMinutes = 30;
    } else {
      activeTier = "basic";
      tierName = "Paket Basic";
      chatLimit = 20;
      voiceLimitMinutes = 5;
    }

    // Dynamic limits lookup from database tier configuration
    const activeClasses = await classRepository.findActiveClasses();
    const highestAccess =
      accesses.find((a: any) => (a.tier || "").toLowerCase() === activeTier) ||
      accesses[0];

    const matchedClass = activeClasses.find(
      (c) => c.cefr.toUpperCase() === highestAccess.cefr.toUpperCase()
    );

    if (matchedClass?.tierPlans && matchedClass.tierPlans[activeTier]) {
      const planConfig = matchedClass.tierPlans[activeTier];
      if (typeof planConfig.dailyChatLimit === "number") {
        chatLimit = planConfig.dailyChatLimit;
      }
      if (typeof planConfig.dailyVoiceMinutes === "number") {
        voiceLimitMinutes = planConfig.dailyVoiceMinutes;
      }
    }
  }

  const usage = await aiUsageRepository.getDailyUsage(userId, usageDate);
  const usedMinutes = Math.floor(usage.voiceSeconds / 60);

  const isChatExceeded = chatLimit !== -1 && usage.chatCount >= chatLimit;
  const isVoiceExceeded =
    voiceLimitMinutes !== -1 && usedMinutes >= voiceLimitMinutes;

  const chatRemaining =
    chatLimit === -1 ? -1 : Math.max(0, chatLimit - usage.chatCount);
  const voiceRemainingMinutes =
    voiceLimitMinutes === -1
      ? -1
      : Math.max(0, voiceLimitMinutes - usedMinutes);

  return {
    tier: activeTier,
    tierName,
    usageDate,
    chat: {
      used: usage.chatCount,
      limit: chatLimit,
      remaining: chatRemaining,
      isExceeded: isChatExceeded,
    },
    voice: {
      usedSeconds: usage.voiceSeconds,
      usedMinutes,
      limitMinutes: voiceLimitMinutes,
      remainingMinutes: voiceRemainingMinutes,
      isExceeded: isVoiceExceeded,
    },
    canChat: !isChatExceeded,
    canVoice: !isVoiceExceeded,
  };
}
