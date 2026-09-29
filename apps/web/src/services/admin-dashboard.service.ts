import { db } from "@/db";
import { users, curriculumModules, curriculumLevels, itemBank, callSessions } from "@/db/schema";
import { isNull, desc, count, sql, eq } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalModules: number;
  totalLevels: number;
  totalQuestions: number;
  totalCalls: number;
  totalCallDurationMinutes: number;
  recentStudents: Array<{
    id: string;
    name: string;
    email: string;
    currentCefr: string;
    createdAt: Date;
  }>;
  cefrDistribution: Record<string, number>;
}

export class AdminDashboardService {
  async getStats(): Promise<ServiceResult<AdminDashboardStats>> {
    try {
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

      // 4. Call Sessions
      const [callCounts] = await db
        .select({
          totalCalls: count(),
          totalDuration: sql<number>`coalesce(sum(${callSessions.durationSeconds}), 0)`,
        })
        .from(callSessions);

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
        .where(andWhere(users.role, 'student'))
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

      return Response.buildSuccess({
        totalUsers: Number(userCounts?.total || 0),
        totalStudents: Number(userCounts?.students || 0),
        totalAdmins: Number(userCounts?.admins || 0),
        totalModules: Number(moduleCounts?.total || 0),
        totalLevels: Number(levelCounts?.total || 0),
        totalQuestions: Number(questionCounts?.total || 0),
        totalCalls: Number(callCounts?.totalCalls || 0),
        totalCallDurationMinutes: Math.round(Number(callCounts?.totalDuration || 0) / 60),
        recentStudents: recentStudents || [],
        cefrDistribution,
      });
    } catch (e) {
      console.error("Gagal memuat statistik admin:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

function andWhere(col: any, val: any) {
  return eq(col, val);
}

export const adminDashboardService = new AdminDashboardService();
