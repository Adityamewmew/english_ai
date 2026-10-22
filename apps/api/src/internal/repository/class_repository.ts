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
    grantedBy = "student_purchase"
  ) => {
    const existing = await db
      .select()
      .from(userClassAccess)
      .where(
        and(
          eq(userClassAccess.userId, userId),
          eq(userClassAccess.cefr, cefr)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const res = await db
        .update(userClassAccess)
        .set({
          status: "active",
          grantedBy,
          updatedAt: new Date(),
        })
        .where(eq(userClassAccess.id, existing[0].id))
        .returning();
      return res[0];
    }

    const res = await db
      .insert(userClassAccess)
      .values({
        id: randomUUID(),
        userId,
        cefr,
        grantedBy,
        status: "active",
      })
      .returning();
    return res[0];
  },
};
