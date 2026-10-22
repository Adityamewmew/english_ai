import { db } from "../../db";
import { courseClasses, userClassAccess } from "../../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const classRepository = {
  findActiveClasses: async () => {
    return await db
      .select()
      .from(courseClasses)
      .where(eq(courseClasses.isActive, true))
      .orderBy(asc(courseClasses.orderIndex));
  },

  findClassByCefr: async (cefr: string) => {
    const res = await db
      .select()
      .from(courseClasses)
      .where(eq(courseClasses.cefr, cefr))
      .limit(1);
    return res[0] ?? null;
  },

  findUserAccesses: async (userId: string) => {
    return await db
      .select()
      .from(userClassAccess)
      .where(
        and(
          eq(userClassAccess.userId, userId),
          eq(userClassAccess.status, "active")
        )
      );
  },

  findUserAccessByCefr: async (userId: string, cefr: string) => {
    const res = await db
      .select()
      .from(userClassAccess)
      .where(
        and(
          eq(userClassAccess.userId, userId),
          eq(userClassAccess.cefr, cefr),
          eq(userClassAccess.status, "active")
        )
      )
      .limit(1);
    return res[0] ?? null;
  },

  grantAccess: async (
    userId: string,
    cefr: string,
    tier = "basic",
    grantedBy = "student_purchase"
  ) => {
    const normalizedTier = tier.toLowerCase();
    const id = randomUUID();

    const [row] = await db
      .insert(userClassAccess)
      .values({
        id,
        userId,
        cefr,
        tier: normalizedTier,
        grantedBy,
        status: "active",
      })
      .onConflictDoUpdate({
        target: [userClassAccess.userId, userClassAccess.cefr],
        set: {
          status: "active",
          tier: normalizedTier,
          grantedBy,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  },
};
