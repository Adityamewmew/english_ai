import { db } from "../../db";
import { itemBank, placementResults } from "../../db/schema";
import { eq, desc, isNull } from "drizzle-orm";
import crypto from "crypto";

export const placementRepository = {
  findActiveItems: async () => {
    return db.select().from(itemBank).where(isNull(itemBank.deletedAt));
  },

  findLatestByUser: async (userId: string) => {
    const [result] = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId))
      .orderBy(desc(placementResults.createdAt))
      .limit(1);
    return result || null;
  },

  checkUserCooldown: async (userId: string, cooldownDays = 14) => {
    const latest = await placementRepository.findLatestByUser(userId);
    if (!latest) {
      return {
        canTakeTest: true,
        isInCooldown: false,
        daysRemaining: 0,
        lastResult: null,
        nextAvailableAt: null,
      };
    }

    const lastTime = new Date(latest.createdAt).getTime();
    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
    const nextAvailableTime = lastTime + cooldownMs;
    const now = Date.now();

    const isInCooldown = now < nextAvailableTime;
    const daysRemaining = isInCooldown
      ? Math.max(1, Math.ceil((nextAvailableTime - now) / (24 * 60 * 60 * 1000)))
      : 0;

    return {
      canTakeTest: !isInCooldown,
      isInCooldown,
      daysRemaining,
      lastResult: latest,
      nextAvailableAt: new Date(nextAvailableTime).toISOString(),
    };
  },

  createResult: async (data: {
    userId: string;
    overallCefr: string;
    mcqScore: number;
    writingScore?: number;
    speakingScore?: number;
    scorePercent: number;
    details: Record<string, any>;
  }) => {
    const [result] = await db
      .insert(placementResults)
      .values({
        id: crypto.randomUUID(),
        ...data,
      })
      .returning();
    return result;
  },
};
