import { db } from "../../db";
import { users } from "../users/users.schema";
import {
  curriculumModules,
  curriculumLevels,
  moduleSections,
  userModuleProgress,
} from "../curriculum/curriculum.schema";
import { itemBank } from "../placement/placement.schema";
import {
  isNull,
  desc,
  asc,
  count,
  sql,
  eq,
  and,
  or,
  ilike,
} from "drizzle-orm";

export const adminRepository = {
  getStats: async () => {
    // 1. User metrics
    const [userCounts] = await db
      .select({
        total: count(),
        students: sql<number>`count(*) filter (where ${users.role} = 'student')`,
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
      })
      .from(users)
      .where(isNull(users.deletedAt));

    // 2. Modules & Levels
    const [moduleCounts] = await db
      .select({ total: count() })
      .from(curriculumModules)
      .where(isNull(curriculumModules.deletedAt));

    const [levelCounts] = await db
      .select({ total: count() })
      .from(curriculumLevels);

    // 3. Question Bank
    const [questionCounts] = await db
      .select({ total: count() })
      .from(itemBank)
      .where(isNull(itemBank.deletedAt));

    // 4. Progress metrics
    const [progressCounts] = await db
      .select({
        totalCompleted: sql<number>`count(*) filter (where ${userModuleProgress.status} = 'completed')`,
        totalInProgress: sql<number>`count(*) filter (where ${userModuleProgress.status} = 'in_progress')`,
      })
      .from(userModuleProgress);

    // 5. Recent 5 Students
    const recentStudents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        currentCefr: users.currentCefr,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.role, "student"), isNull(users.deletedAt)))
      .orderBy(desc(users.createdAt))
      .limit(5);

    // 6. CEFR Distribution
    const cefrCounts = await db
      .select({
        cefr: users.currentCefr,
        count: count(),
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(users.currentCefr);

    const cefrDistribution: Record<string, number> = {
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
      C1: 0,
      C2: 0,
    };

    for (const row of cefrCounts) {
      if (row.cefr) {
        cefrDistribution[row.cefr] = Number(row.count);
      }
    }

    return {
      totalUsers: Number(userCounts?.total || 0),
      totalStudents: Number(userCounts?.students || 0),
      totalAdmins: Number(userCounts?.admins || 0),
      totalModules: Number(moduleCounts?.total || 0),
      totalLevels: Number(levelCounts?.total || 0),
      totalQuestions: Number(questionCounts?.total || 0),
      totalCompletedModules: Number(progressCounts?.totalCompleted || 0),
      totalInProgressModules: Number(progressCounts?.totalInProgress || 0),
      recentStudents: recentStudents || [],
      cefrDistribution,
    };
  },

  getAllModules: async (cefrFilter?: string) => {
    const conditions = [isNull(curriculumModules.deletedAt)];
    if (cefrFilter && cefrFilter !== "all") {
      conditions.push(eq(curriculumModules.cefr, cefrFilter));
    }

    const modules = await db
      .select({
        id: curriculumModules.id,
        levelId: curriculumModules.levelId,
        levelTitle: curriculumLevels.title,
        title: curriculumModules.title,
        cefr: curriculumModules.cefr,
        group: curriculumModules.group,
        objective: curriculumModules.objective,
        complexity: curriculumModules.complexity,
        estimatedMinutes: curriculumModules.estimatedMinutes,
        isExam: curriculumModules.isExam,
        passingScore: curriculumModules.passingScore,
        orderIndex: curriculumModules.orderIndex,
      })
      .from(curriculumModules)
      .leftJoin(curriculumLevels, eq(curriculumModules.levelId, curriculumLevels.id))
      .where(and(...conditions))
      .orderBy(asc(curriculumModules.orderIndex));

    const allSections = await db
      .select({
        moduleId: moduleSections.moduleId,
      })
      .from(moduleSections);

    const sectionCountMap: Record<string, number> = {};
    for (const sec of allSections) {
      sectionCountMap[sec.moduleId] = (sectionCountMap[sec.moduleId] || 0) + 1;
    }

    return modules.map((m) => ({
      ...m,
      levelTitle: m.levelTitle || undefined,
      sectionsCount: sectionCountMap[m.id] || 0,
    }));
  },

  getModuleDetailWithSections: async (id: string) => {
    const [mod] = await db
      .select()
      .from(curriculumModules)
      .where(and(eq(curriculumModules.id, id), isNull(curriculumModules.deletedAt)))
      .limit(1);

    if (!mod) return null;

    const sections = await db
      .select()
      .from(moduleSections)
      .where(eq(moduleSections.moduleId, id))
      .orderBy(asc(moduleSections.orderIndex));

    return {
      module: mod,
      sections,
    };
  },

  getAllQuestions: async (params: {
    cefr?: string;
    skill?: string;
    keywords?: string;
    page?: number;
    perPage?: number;
  }) => {
    const { cefr = "all", skill = "all", keywords = "", page = 1, perPage = 20 } = params;

    const conditions = [isNull(itemBank.deletedAt)];

    if (cefr && cefr !== "all") {
      conditions.push(eq(itemBank.cefr, cefr));
    }

    if (skill && skill !== "all") {
      conditions.push(eq(itemBank.skill, skill));
    }

    if (keywords && keywords.trim()) {
      const pattern = `%${keywords.trim()}%`;
      conditions.push(
        or(
          ilike(itemBank.question, pattern),
          ilike(itemBank.id, pattern),
          ilike(itemBank.answer, pattern)
        )!
      );
    }

    const offset = (page - 1) * perPage;

    const [totalCountResult] = await db
      .select({ total: count() })
      .from(itemBank)
      .where(and(...conditions));

    const total = Number(totalCountResult?.total || 0);

    const items = await db
      .select()
      .from(itemBank)
      .where(and(...conditions))
      .orderBy(asc(itemBank.id))
      .limit(perPage)
      .offset(offset);

    return {
      list: items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  },
};
