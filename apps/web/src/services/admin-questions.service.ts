import { db } from "@/db";
import { itemBank } from "@/db/schema";
import { eq, asc, isNull, and, or, ilike, count } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";

export interface QuestionFilterParams {
  cefr?: string;
  skill?: string;
  keywords?: string;
  page?: number;
  perPage?: number;
}

export class AdminQuestionsService {
  async getAllQuestions(params: QuestionFilterParams = {}): Promise<ServiceResult<any>> {
    try {
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

      return Response.buildSuccess({
        list: items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (e) {
      console.error("Gagal mengambil bank soal admin:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const adminQuestionsService = new AdminQuestionsService();
