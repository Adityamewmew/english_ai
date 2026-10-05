import { db } from "../../db";
import { callSessions } from "./voice.schema";
import { users } from "../users/users.schema";
import { curriculumModules, moduleSections } from "../curriculum/curriculum.schema";
import { eq, desc, and, isNull, or, like } from "drizzle-orm";
import crypto from "crypto";

export const voiceRepository = {
  createSession: async (data: {
    userId: string;
    moduleId?: string;
    topic: string;
    durationSeconds: number;
    transcript?: string;
    evaluation?: any;
  }) => {
    const [session] = await db
      .insert(callSessions)
      .values({
        id: crypto.randomUUID(),
        ...data,
      })
      .returning();
    return session;
  },

  findById: async (id: string) => {
    const [session] = await db
      .select()
      .from(callSessions)
      .where(eq(callSessions.id, id))
      .limit(1);
    return session || null;
  },

  findByUserId: async (userId: string, limit = 10) => {
    return db
      .select()
      .from(callSessions)
      .where(eq(callSessions.userId, userId))
      .orderBy(desc(callSessions.createdAt))
      .limit(limit);
  },

  hasPastSessions: async (userId: string) => {
    const past = await db
      .select({ id: callSessions.id })
      .from(callSessions)
      .where(eq(callSessions.userId, userId))
      .limit(1);
    return past.length > 0;
  },

  getUserInfo: async (userId: string) => {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        currentCefr: users.currentCefr,
        memory: users.memory,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);
    return user || null;
  },

  updateUserMemory: async (userId: string, memory: any) => {
    const [updated] = await db
      .update(users)
      .set({ memory, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated || null;
  },

  findCurriculumContext: async (keywords: string[], studentCefr = "A1") => {
    if (keywords.length > 0) {
      const orConditions = keywords.map((k) =>
        or(
          like(curriculumModules.title, `%${k}%`),
          like(curriculumModules.objective, `%${k}%`),
          like(curriculumModules.group, `%${k}%`)
        )
      );

      const [matched] = await db
        .select()
        .from(curriculumModules)
        .where(and(isNull(curriculumModules.deletedAt), or(...orConditions)))
        .limit(1);

      if (matched) return matched;
    }

    const [byLevel] = await db
      .select()
      .from(curriculumModules)
      .where(and(isNull(curriculumModules.deletedAt), eq(curriculumModules.cefr, studentCefr)))
      .limit(1);

    return byLevel || null;
  },

  getModuleSections: async (moduleId: string) => {
    return db
      .select()
      .from(moduleSections)
      .where(eq(moduleSections.moduleId, moduleId))
      .orderBy(moduleSections.orderIndex);
  },
};
