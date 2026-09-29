import { db } from "@/db";
import { curriculumModules, curriculumLevels, moduleSections } from "@/db/schema";
import { eq, asc, isNull, and } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";

export interface AdminModuleListItem {
  id: string;
  levelId: string;
  levelTitle?: string;
  title: string;
  cefr: string;
  group: string;
  objective: string;
  complexity: string;
  estimatedMinutes: number;
  isExam: boolean;
  passingScore: number;
  orderIndex: number;
  sectionsCount: number;
}

export class AdminCurriculumService {
  async getAllModules(cefrFilter?: string): Promise<ServiceResult<AdminModuleListItem[]>> {
    try {
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

      // Ambil count section per modul
      const allSections = await db
        .select({
          moduleId: moduleSections.moduleId,
        })
        .from(moduleSections);

      const sectionCountMap: Record<string, number> = {};
      for (const sec of allSections) {
        sectionCountMap[sec.moduleId] = (sectionCountMap[sec.moduleId] || 0) + 1;
      }

      const enriched: AdminModuleListItem[] = modules.map((m) => ({
        ...m,
        levelTitle: m.levelTitle || undefined,
        sectionsCount: sectionCountMap[m.id] || 0,
      }));

      return Response.buildSuccess(enriched);
    } catch (e) {
      console.error("Gagal mengambil modul kurikulum admin:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getModuleDetailWithSections(id: string): Promise<ServiceResult<any>> {
    try {
      const [mod] = await db
        .select()
        .from(curriculumModules)
        .where(eq(curriculumModules.id, id))
        .limit(1);

      if (!mod) {
        return Response.buildErrorNotFound("Modul tidak ditemukan");
      }

      const sections = await db
        .select()
        .from(moduleSections)
        .where(eq(moduleSections.moduleId, id))
        .orderBy(asc(moduleSections.orderIndex));

      return Response.buildSuccess({
        module: mod,
        sections,
      });
    } catch (e) {
      console.error("Gagal mengambil detail modul admin:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const adminCurriculumService = new AdminCurriculumService();
