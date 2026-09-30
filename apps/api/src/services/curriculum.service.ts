import { db } from "@/db";
import { curriculumLevels, curriculumModules, moduleSections, userModuleProgress, users } from "@/db/schema";
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
      let userCefr: string = "A1";
      let isAdmin = false;

      if (userId) {
        const [u] = await db
          .select({
            currentCefr: users.currentCefr,
            role: users.role,
            accessType: users.accessType,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (u) {
          if (u.currentCefr) userCefr = u.currentCefr;
          if (u.role === "admin" || u.accessType === 1) isAdmin = true;
        }

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

      // Evaluasi unlock level:
      // A1.1 selalu terbuka.
      const a1_1Passed =
        userProgressMap["A1-M13"]?.status === "completed" &&
        (userProgressMap["A1-M13"]?.score ?? 0) >= 75;
      const cefrHigherThanA1_1 = ["A1.2", "A1.3", "A2", "B1", "B2", "C1", "C2"].some((c) =>
        userCefr.toUpperCase().includes(c)
      );
      const a1_2Unlocked = isAdmin || a1_1Passed || cefrHigherThanA1_1;

      // A1.3 terbuka jika A1-M26 lulus (skor >= 75) OR placement >= A1.3 OR admin.
      const a1_2Passed =
        userProgressMap["A1-M26"]?.status === "completed" &&
        (userProgressMap["A1-M26"]?.score ?? 0) >= 75;
      const cefrHigherThanA1_2 = ["A1.3", "A2", "B1", "B2", "C1", "C2"].some((c) =>
        userCefr.toUpperCase().includes(c)
      );
      const a1_3Unlocked = isAdmin || a1_2Passed || cefrHigherThanA1_2;

      // 4. Enrich modules per level secara sekuensial (admin bebas buka semua)
      const result = levels.map((lvl) => {
        const lvlModules = modules.filter((m) => m.levelId === lvl.id);
        const isLevelUnlocked =
          isAdmin ||
          lvl.id === "A1.1" ||
          (lvl.id === "A1.2" && a1_2Unlocked) ||
          (lvl.id === "A1.3" && a1_3Unlocked);

        let lockReason: string | null = null;
        if (!isLevelUnlocked) {
          if (lvl.id === "A1.2") {
            lockReason = "Selesaikan Ujian Akhir Level A1.1 (A1-M13, skor min 75%) atau Placement Test untuk membuka level ini.";
          } else if (lvl.id === "A1.3") {
            lockReason = "Selesaikan Ujian Akhir Level A1.2 (A1-M26, skor min 75%) atau Placement Test untuk membuka level ini.";
          } else {
            lockReason = "Selesaikan level sebelumnya untuk membuka level ini.";
          }
        }

        let prevCompletedInLevel = isLevelUnlocked;
        const enrichedLvlModules = lvlModules.map((m, idx) => {
          const progress = userProgressMap[m.id];
          let status: "locked" | "unlocked" | "completed" = "locked";
          let score: number | null = null;

          if (progress && progress.status === "completed") {
            status = "completed";
            score = progress.score;
          } else if (isAdmin || (isLevelUnlocked && (idx === 0 || prevCompletedInLevel))) {
            status = "unlocked";
          } else {
            status = "locked";
          }

          // Modul berikutnya di level ini hanya unlock jika modul ini sudah completed
          prevCompletedInLevel = status === "completed";

          return {
            ...m,
            status,
            score,
            completedAt: progress?.completedAt || null,
          };
        });

        const completedCount = enrichedLvlModules.filter((m) => m.status === "completed").length;
        const totalCount = enrichedLvlModules.length;

        return {
          ...lvl,
          isUnlocked: isLevelUnlocked,
          lockReason,
          modules: enrichedLvlModules,
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
    answers: Record<string, number>,
    speakingScore?: number
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
        const correctIndex =
          typeof q.answerIndex === "number"
            ? q.answerIndex
            : Array.isArray(q.options) && q.answer
            ? q.options.indexOf(q.answer)
            : -1;
        const isCorrect = selected === correctIndex;
        if (isCorrect) correctCount++;

        questionResults.push({
          questionId: q.id,
          question: q.question,
          selectedAnswer: selected,
          correctAnswer: correctIndex,
          isCorrect,
          explanation: q.explanation,
        });
      }

      const quizScore = Math.round((correctCount / questions.length) * 100);
      let finalScore = quizScore;
      if (typeof speakingScore === "number" && !isNaN(speakingScore)) {
        // Bobot: 60% Nilai Praktikum Berbicara + 40% Nilai Kuis Evaluasi
        finalScore = Math.round((speakingScore * 0.6) + (quizScore * 0.4));
      }

      const passed = finalScore >= (module.passingScore || 70);

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
            score: Math.max(existing.score || 0, finalScore),
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
          score: finalScore,
          completedAt,
        });
      }

      // Update persistent module memory on student record
      try {
        const [u] = await db
          .select({ memory: users.memory })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (u) {
          const mem = u.memory || { facts: [], interests: [], weaknesses: [], totalCalls: 0 };
          const modMems = mem.moduleMemories || {};
          const prevMem = modMems[moduleId] || {};

          modMems[moduleId] = {
            ...prevMem,
            attempts: (prevMem.attempts || 0) + 1,
            lastScore: finalScore,
            lastPracticedAt: new Date().toISOString(),
            summary: passed
              ? `Lulus evaluasi modul dengan skor ${finalScore}%. Menguasai materi inti.`
              : `Mencoba kuis modul dengan skor ${finalScore}%. Perlu review tambahan.`,
          };

          await db
            .update(users)
            .set({ memory: { ...mem, moduleMemories: modMems } })
            .where(eq(users.id, userId));
        }
      } catch (memErr) {
        console.warn("Gagal memperbarui memori modul user:", memErr);
      }

      return Response.buildSuccess({
        moduleId,
        score: finalScore,
        quizScore,
        speakingScore: speakingScore ?? null,
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
