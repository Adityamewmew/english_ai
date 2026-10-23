import { db } from "../../db";
import {
  certificateTemplates,
  userCertificates,
  curriculumModules,
  userModuleProgress,
  users,
} from "../../db/schema";
import { eq, and, isNull, inArray, sql } from "drizzle-orm";

export const certificateRepository = {
  findTemplates: async () => {
    return await db.select().from(certificateTemplates);
  },

  findTemplateByCefr: async (cefr: string) => {
    const res = await db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.cefr, cefr))
      .limit(1);
    return res[0] ?? null;
  },

  findUserCertificates: async (userId: string) => {
    return await db
      .select()
      .from(userCertificates)
      .where(eq(userCertificates.userId, userId))
      .orderBy(userCertificates.issuedAt);
  },

  findUserCertificateByCefr: async (userId: string, cefr: string) => {
    const res = await db
      .select()
      .from(userCertificates)
      .where(
        and(
          eq(userCertificates.userId, userId),
          eq(userCertificates.cefrLevel, cefr)
        )
      )
      .limit(1);
    return res[0] ?? null;
  },

  createUserCertificate: async (data: {
    id: string;
    certificateNumber: string;
    userId: string;
    cefrLevel: string;
    userName: string;
    score: number;
    scoresBreakdown?: any;
  }) => {
    const res = await db.insert(userCertificates).values(data).returning();
    return res[0];
  },

  countCertificates: async () => {
    const res = await db
      .select({ count: sql<number>`count(*)` })
      .from(userCertificates);
    return Number(res[0]?.count ?? 0);
  },

  getUserById: async (userId: string) => {
    const res = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return res[0] ?? null;
  },

  getCefrCategoryStats: async (userId: string, cefr: string) => {
    // 1. Get all modules for this CEFR
    const modules = await db
      .select({
        id: curriculumModules.id,
        levelId: curriculumModules.levelId,
        title: curriculumModules.title,
      })
      .from(curriculumModules)
      .where(
        and(
          eq(curriculumModules.cefr, cefr),
          isNull(curriculumModules.deletedAt)
        )
      );

    const totalModules = modules.length;
    if (totalModules === 0) {
      return {
        cefr,
        totalModules: 0,
        completedModules: 0,
        averageScore: 0,
        isEligible: false,
      };
    }

    const moduleIds = modules.map((m) => m.id);

    // 2. Get user progress on these modules
    const progressList = await db
      .select()
      .from(userModuleProgress)
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          inArray(userModuleProgress.moduleId, moduleIds)
        )
      );

    const completedList = progressList.filter((p) => p.status === "completed");
    const completedCount = completedList.length;

    const scores = completedList
      .map((p) => p.score)
      .filter((s): s is number => typeof s === "number");
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 85;

    const isEligible = totalModules > 0 && completedCount >= totalModules;

    return {
      cefr,
      totalModules,
      completedModules: completedCount,
      averageScore: avgScore,
      isEligible,
    };
  },
};
