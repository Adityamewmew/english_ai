import { db } from "../../db";
import {
  certificateTemplates,
  userCertificates,
  curriculumModules,
  userModuleProgress,
  users,
  subModules,
  userSubModuleProgress,
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
    structureScore?: number;
    readingScore?: number;
    listeningScore?: number;
    dictationScore?: number;
    conversationScore?: number;
    compositionScore?: number;
    grade?: string;
  }) => {
    const res = await db.insert(userCertificates).values(data).returning();
    return res[0];
  },

  countCertificatesByCefr: async (cefr: string) => {
    const res = await db
      .select({ count: sql<number>`count(*)` })
      .from(userCertificates)
      .where(eq(userCertificates.cefrLevel, cefr));
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
        grade: "FAIR",
        skills: {
          structureScore: 85,
          readingScore: 85,
          listeningScore: 85,
          dictationScore: 85,
          conversationScore: 85,
          compositionScore: 85,
        },
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

    // 3. Sub-module score breakdown per skill
    let structureScore = avgScore;
    let readingScore = avgScore;
    let listeningScore = avgScore;
    let dictationScore = avgScore;
    let conversationScore = avgScore;
    let compositionScore = avgScore;

    try {
      const subScores = await db
        .select({
          skillType: subModules.skillType,
          score: userSubModuleProgress.score,
        })
        .from(userSubModuleProgress)
        .innerJoin(subModules, eq(userSubModuleProgress.subModuleId, subModules.id))
        .where(
          and(
            eq(userSubModuleProgress.userId, userId),
            inArray(subModules.moduleId, moduleIds)
          )
        );

      const filterAvg = (type: string) => {
        const arr = subScores
          .filter((s) => s.skillType === type && typeof s.score === "number")
          .map((s) => s.score as number);
        return arr.length > 0
          ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
          : avgScore;
      };

      readingScore = filterAvg("reading");
      listeningScore = filterAvg("listening");
      compositionScore = filterAvg("writing");
      conversationScore = filterAvg("speaking");
      structureScore = filterAvg("assessment");
      dictationScore = Math.min(
        100,
        Math.max(60, Math.round(listeningScore * 0.6 + structureScore * 0.4))
      );
    } catch {
      // Fallback to module overall average
    }

    const finalAvg = Math.round(
      (structureScore +
        readingScore +
        listeningScore +
        dictationScore +
        conversationScore +
        compositionScore) /
        6
    );

    const grade =
      finalAvg >= 89 ? "EXCELLENT" : finalAvg >= 76 ? "GOOD" : "FAIR";

    const isEligible = totalModules > 0 && completedCount >= totalModules;

    return {
      cefr,
      totalModules,
      completedModules: completedCount,
      averageScore: finalAvg,
      grade,
      skills: {
        structureScore,
        readingScore,
        listeningScore,
        dictationScore,
        conversationScore,
        compositionScore,
      },
      isEligible,
    };
  },
};
