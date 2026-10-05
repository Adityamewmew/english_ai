import { db } from "../../db";
import {
  curriculumLevels,
  curriculumModules,
  moduleSections,
  userModuleProgress,
} from "./curriculum.schema";
import { eq, asc, isNull, and } from "drizzle-orm";
import crypto from "crypto";

export const curriculumRepository = {
  findAllLevels: async () => {
    return db
      .select()
      .from(curriculumLevels)
      .orderBy(asc(curriculumLevels.orderIndex));
  },

  findModules: async (levelId?: string) => {
    return db
      .select()
      .from(curriculumModules)
      .where(
        levelId
          ? and(isNull(curriculumModules.deletedAt), eq(curriculumModules.levelId, levelId))
          : isNull(curriculumModules.deletedAt)
      )
      .orderBy(asc(curriculumModules.orderIndex));
  },

  findModuleById: async (id: string) => {
    const [mod] = await db
      .select()
      .from(curriculumModules)
      .where(eq(curriculumModules.id, id))
      .limit(1);
    return mod || null;
  },

  findSectionsByModuleId: async (moduleId: string) => {
    return db
      .select()
      .from(moduleSections)
      .where(eq(moduleSections.moduleId, moduleId))
      .orderBy(asc(moduleSections.orderIndex));
  },

  findUserProgressList: async (userId: string) => {
    return db
      .select()
      .from(userModuleProgress)
      .where(eq(userModuleProgress.userId, userId));
  },

  findUserModuleProgress: async (userId: string, moduleId: string) => {
    const [prog] = await db
      .select()
      .from(userModuleProgress)
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          eq(userModuleProgress.moduleId, moduleId)
        )
      )
      .limit(1);
    return prog || null;
  },

  upsertProgress: async (data: {
    userId: string;
    moduleId: string;
    status: string;
    score?: number;
    stepProgress?: any;
    completedAt?: Date;
  }) => {
    const existing = await curriculumRepository.findUserModuleProgress(data.userId, data.moduleId);
    if (existing) {
      const [updated] = await db
        .update(userModuleProgress)
        .set({
          status: data.status,
          score: data.score !== undefined ? data.score : existing.score,
          stepProgress: data.stepProgress ?? existing.stepProgress,
          completedAt: data.completedAt ?? existing.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(userModuleProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db
        .insert(userModuleProgress)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          moduleId: data.moduleId,
          status: data.status,
          score: data.score,
          stepProgress: data.stepProgress,
          completedAt: data.completedAt,
        })
        .returning();
      return inserted;
    }
  },
};
