import { db } from "../../db";
import { userDailyAiUsage } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const aiUsageRepository = {
  getTodayDateString: (): string => {
    // Indonesia Western Time (WIB) is UTC+7
    const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return nowWib.toISOString().slice(0, 10);
  },

  getDailyUsage: async (userId: string, dateString?: string) => {
    const usageDate = dateString || aiUsageRepository.getTodayDateString();
    const res = await db
      .select()
      .from(userDailyAiUsage)
      .where(
        and(
          eq(userDailyAiUsage.userId, userId),
          eq(userDailyAiUsage.usageDate, usageDate)
        )
      )
      .limit(1);

    if (res.length > 0) {
      return res[0];
    }

    return {
      id: "",
      userId,
      usageDate,
      chatCount: 0,
      voiceSeconds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  incrementChatCount: async (userId: string) => {
    const usageDate = aiUsageRepository.getTodayDateString();
    const id = randomUUID();

    const [row] = await db
      .insert(userDailyAiUsage)
      .values({
        id,
        userId,
        usageDate,
        chatCount: 1,
        voiceSeconds: 0,
      })
      .onConflictDoUpdate({
        target: [userDailyAiUsage.userId, userDailyAiUsage.usageDate],
        set: {
          chatCount: sql`${userDailyAiUsage.chatCount} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  },

  recordVoiceDuration: async (userId: string, seconds: number) => {
    if (seconds <= 0) return;
    const usageDate = aiUsageRepository.getTodayDateString();
    const id = randomUUID();

    const [row] = await db
      .insert(userDailyAiUsage)
      .values({
        id,
        userId,
        usageDate,
        chatCount: 0,
        voiceSeconds: seconds,
      })
      .onConflictDoUpdate({
        target: [userDailyAiUsage.userId, userDailyAiUsage.usageDate],
        set: {
          voiceSeconds: sql`${userDailyAiUsage.voiceSeconds} + ${seconds}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  },
};

