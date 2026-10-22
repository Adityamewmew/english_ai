import { db } from "../../db";
import { userDailyAiUsage } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const aiUsageRepository = {
  getTodayDateString: (): string => {
    return new Date().toISOString().slice(0, 10);
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

    const existing = await db
      .select()
      .from(userDailyAiUsage)
      .where(
        and(
          eq(userDailyAiUsage.userId, userId),
          eq(userDailyAiUsage.usageDate, usageDate)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const res = await db
        .update(userDailyAiUsage)
        .set({
          chatCount: sql`${userDailyAiUsage.chatCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userDailyAiUsage.id, existing[0].id))
        .returning();
      return res[0];
    }

    const res = await db
      .insert(userDailyAiUsage)
      .values({
        id: randomUUID(),
        userId,
        usageDate,
        chatCount: 1,
        voiceSeconds: 0,
      })
      .returning();
    return res[0];
  },

  recordVoiceDuration: async (userId: string, seconds: number) => {
    if (seconds <= 0) return;
    const usageDate = aiUsageRepository.getTodayDateString();

    const existing = await db
      .select()
      .from(userDailyAiUsage)
      .where(
        and(
          eq(userDailyAiUsage.userId, userId),
          eq(userDailyAiUsage.usageDate, usageDate)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const res = await db
        .update(userDailyAiUsage)
        .set({
          voiceSeconds: sql`${userDailyAiUsage.voiceSeconds} + ${seconds}`,
          updatedAt: new Date(),
        })
        .where(eq(userDailyAiUsage.id, existing[0].id))
        .returning();
      return res[0];
    }

    const res = await db
      .insert(userDailyAiUsage)
      .values({
        id: randomUUID(),
        userId,
        usageDate,
        chatCount: 0,
        voiceSeconds: seconds,
      })
      .returning();
    return res[0];
  },
};
