import { db } from "@/db";
import { callSessions, users } from "@/db/schema";
import { eq, desc, isNull, and, ilike, count } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";

export class AdminCallsService {
  async getAllCalls(page = 1, perPage = 15): Promise<ServiceResult<any>> {
    try {
      const offset = (page - 1) * perPage;

      const [totalCountResult] = await db
        .select({ total: count() })
        .from(callSessions);

      const total = Number(totalCountResult?.total || 0);

      const calls = await db
        .select({
          id: callSessions.id,
          userId: callSessions.userId,
          studentName: users.name,
          studentEmail: users.email,
          studentCefr: users.currentCefr,
          moduleId: callSessions.moduleId,
          topic: callSessions.topic,
          durationSeconds: callSessions.durationSeconds,
          transcript: callSessions.transcript,
          evaluation: callSessions.evaluation,
          createdAt: callSessions.createdAt,
        })
        .from(callSessions)
        .leftJoin(users, eq(callSessions.userId, users.id))
        .orderBy(desc(callSessions.createdAt))
        .limit(perPage)
        .offset(offset);

      return Response.buildSuccess({
        list: calls,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (e) {
      console.error("Gagal mengambil riwayat call admin:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const adminCallsService = new AdminCallsService();
