import { db } from "../../db";
import { itemBank, placementResults } from "./placement.schema";
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
