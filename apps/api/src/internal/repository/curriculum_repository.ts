import { db } from "../../db";
import {
  curriculumLevels,
  curriculumModules,
  moduleSections,
  userModuleProgress,
  subModules,
  userSubModuleProgress,
} from "../../db/schema";
import { eq, asc, isNull, and, inArray } from "drizzle-orm";
import crypto from "crypto";

export const curriculumRepository = {
  findAllLevels: async () => {
    return db
      .select()
      .from(curriculumLevels)
      .orderBy(asc(curriculumLevels.orderIndex));
  },

  findModules: async (levelId?: string, onlyActive = true) => {
    const conditions = [isNull(curriculumModules.deletedAt)];
    if (onlyActive) {
      conditions.push(eq(curriculumModules.isActive, true));
    }
    if (levelId) {
      conditions.push(eq(curriculumModules.levelId, levelId));
    }
    return db
      .select()
      .from(curriculumModules)
      .where(and(...conditions))
      .orderBy(asc(curriculumModules.orderIndex), asc(curriculumModules.id));
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

  findSubModulesByModuleId: async (moduleId: string) => {
    return db
      .select()
      .from(subModules)
      .where(eq(subModules.moduleId, moduleId))
      .orderBy(asc(subModules.orderIndex));
  },

  findSubModuleById: async (id: string) => {
    const [sub] = await db
      .select()
      .from(subModules)
      .where(eq(subModules.id, id))
      .limit(1);
    return sub || null;
  },

  findSectionsBySubModuleId: async (subModuleId: string) => {
    return db
      .select()
      .from(moduleSections)
      .where(eq(moduleSections.subModuleId, subModuleId))
      .orderBy(asc(moduleSections.orderIndex));
  },

  findUserSubModuleProgress: async (userId: string, subModuleId: string) => {
    const [prog] = await db
      .select()
      .from(userSubModuleProgress)
      .where(
        and(
          eq(userSubModuleProgress.userId, userId),
          eq(userSubModuleProgress.subModuleId, subModuleId)
        )
      )
      .limit(1);
    return prog || null;
  },

  findUserSubModuleProgressList: async (userId: string, subModuleIds: string[]) => {
    if (subModuleIds.length === 0) return [];
    return db
      .select()
      .from(userSubModuleProgress)
      .where(
        and(
          eq(userSubModuleProgress.userId, userId),
          inArray(userSubModuleProgress.subModuleId, subModuleIds)
        )
      );
  },

  upsertSubModuleProgress: async (data: {
    userId: string;
    subModuleId: string;
    status: string;
    score?: number;
    completedAt?: Date;
  }) => {
    const existing = await curriculumRepository.findUserSubModuleProgress(
      data.userId,
      data.subModuleId
    );
    if (existing) {
      const [updated] = await db
        .update(userSubModuleProgress)
        .set({
          status: data.status,
          score: data.score !== undefined ? data.score : existing.score,
          completedAt: data.completedAt ?? existing.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(userSubModuleProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db
        .insert(userSubModuleProgress)
        .values({
          id: crypto.randomUUID(),
          userId: data.userId,
          subModuleId: data.subModuleId,
          status: data.status,
          score: data.score,
          completedAt: data.completedAt,
        })
        .returning();
      return inserted;
    }
  },
};
