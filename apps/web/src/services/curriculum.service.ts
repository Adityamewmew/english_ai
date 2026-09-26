import { db } from "@/db";
import { curriculumModules } from "@/db/schema";
import { eq, asc, isNull } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";

export class CurriculumService {
  async getAll(): Promise<ServiceResult<any>> {
    try {
      const data = await db
        .select()
        .from(curriculumModules)
        .where(isNull(curriculumModules.deletedAt))
        .orderBy(asc(curriculumModules.id));

      return Response.buildSuccess(data);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getById(id: string): Promise<ServiceResult<any>> {
    try {
      const [data] = await db
        .select()
        .from(curriculumModules)
        .where(eq(curriculumModules.id, id))
        .limit(1);

      if (!data) return Response.buildErrorNotFound("Modul kurikulum tidak ditemukan");
      return Response.buildSuccess(data);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const curriculumService = new CurriculumService();
