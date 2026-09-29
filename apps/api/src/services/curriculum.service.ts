import { db } from "@/db";
import { curriculumLevels, curriculumModules, moduleSections, userModuleProgress } from "@/db/schema";
import { eq, asc, isNull, and } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import crypto from "crypto";

export class CurriculumService {
  async getAll(): Promise<ServiceResult<any>> {
    try {
      const data = await db
        .select()
        .from(curriculumModules)
        .where(isNull(curriculumModules.deletedAt))
        .orderBy(asc(curriculumModules.orderIndex));

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

  async getLevelsWithProgress(userId: string): Promise<ServiceResult<any>> {
    try {
      // 1. Ambil semua level
      const levels = await db
        .select()
        .from(curriculumLevels)
        .orderBy(asc(curriculumLevels.orderIndex));

      // 2. Ambil semua modul aktif
      const modules = await db
        .select()
        .from(curriculumModules)
        .where(isNull(curriculumModules.deletedAt))
        .orderBy(asc(curriculumModules.orderIndex));

      // 3. Ambil riwayat progress user jika userId diberikan
      let userProgressMap: Record<string, { status: string; score: number | null; completedAt: any }> = {};
      if (userId) {
        const progresses = await db
          .select()
          .from(userModuleProgress)
          .where(eq(userModuleProgress.userId, userId));

        for (const p of progresses) {
          userProgressMap[p.moduleId] = {
            status: p.status,
            score: p.score,
            completedAt: p.completedAt,
          };
        }
      }

      // 4. Hitung unlock status per modul secara sekuensial
      let previousCompleted = true; // Modul pertama selalu terbuka
      const enrichedModules = modules.map((m, index) => {
        const progress = userProgressMap[m.id];
        let status: "locked" | "unlocked" | "completed" = "locked";
        let score: number | null = null;

        if (progress && progress.status === "completed") {
          status = "completed";
          score = progress.score;
        } else if (index === 0 || previousCompleted) {
          status = "unlocked";
        } else {
          status = "locked";
        }

        // Modul berikutnya hanya unlock jika modul ini sudah completed
        previousCompleted = status === "completed";

        return {
          ...m,
          status,
          score,
          completedAt: progress?.completedAt || null,
        };
      });

      // 5. Kelompokkan modul ke dalam level masing-masing
      const result = levels.map((lvl) => {
        const lvlModules = enrichedModules.filter((m) => m.levelId === lvl.id);
        const completedCount = lvlModules.filter((m) => m.status === "completed").length;
        const totalCount = lvlModules.length;

        return {
          ...lvl,
          modules: lvlModules,
          totalModules: totalCount,
          completedModules: completedCount,
          progressPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        };
      });

      return Response.buildSuccess(result);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getModuleDetail(moduleId: string, userId?: string): Promise<ServiceResult<any>> {
    try {
      const [module] = await db
        .select()
        .from(curriculumModules)
        .where(eq(curriculumModules.id, moduleId))
        .limit(1);

      if (!module) return Response.buildErrorNotFound("Modul tidak ditemukan");

      const sections = await db
        .select()
        .from(moduleSections)
        .where(eq(moduleSections.moduleId, moduleId))
        .orderBy(asc(moduleSections.orderIndex));

      let userProgress = null;
      if (userId) {
        const [prog] = await db
          .select()
          .from(userModuleProgress)
          .where(and(eq(userModuleProgress.userId, userId), eq(userModuleProgress.moduleId, moduleId)))
          .limit(1);
        userProgress = prog || null;
      }

      return Response.buildSuccess({
        module,
        sections,
        userProgress,
      });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async submitQuiz(
    userId: string,
    moduleId: string,
    answers: Record<string, number>
  ): Promise<ServiceResult<any>> {
    try {
      const [module] = await db
        .select()
        .from(curriculumModules)
        .where(eq(curriculumModules.id, moduleId))
        .limit(1);

      if (!module) return Response.buildErrorNotFound("Modul tidak ditemukan");

      const [quizSection] = await db
        .select()
        .from(moduleSections)
        .where(and(eq(moduleSections.moduleId, moduleId), eq(moduleSections.sectionType, "quiz")))
        .limit(1);

      if (!quizSection || !quizSection.content || !Array.isArray(quizSection.content.questions)) {
        return Response.buildErrorNotFound("Kuis untuk modul ini tidak tersedia");
      }

      const questions = quizSection.content.questions;
      let correctCount = 0;
      const questionResults = [];

      for (const q of questions) {
        const selected = answers[q.id.toString()] ?? answers[q.id];
        const isCorrect = selected === q.answerIndex;
        if (isCorrect) correctCount++;

        questionResults.push({
          questionId: q.id,
          question: q.question,
          selectedAnswer: selected,
          correctAnswer: q.answerIndex,
          isCorrect,
          explanation: q.explanation,
        });
      }

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= (module.passingScore || 70);

      // Simpan progress jika lulus atau perbarui skor
      const [existing] = await db
        .select()
        .from(userModuleProgress)
        .where(and(eq(userModuleProgress.userId, userId), eq(userModuleProgress.moduleId, moduleId)))
        .limit(1);

      const status = passed ? "completed" : existing?.status === "completed" ? "completed" : "unlocked";
      const completedAt = passed ? new Date() : existing?.completedAt || null;

      if (existing) {
        await db
          .update(userModuleProgress)
          .set({
            status,
            score: Math.max(existing.score || 0, score),
            completedAt,
            updatedAt: new Date(),
          })
          .where(eq(userModuleProgress.id, existing.id));
      } else {
        await db.insert(userModuleProgress).values({
          id: crypto.randomUUID(),
          userId,
          moduleId,
          status,
          score,
          completedAt,
        });
      }

      return Response.buildSuccess({
        moduleId,
        score,
        passingScore: module.passingScore || 70,
        passed,
        correctCount,
        totalQuestions: questions.length,
        results: questionResults,
      });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const curriculumService = new CurriculumService();
