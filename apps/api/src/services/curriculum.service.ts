import { db } from "@/db";
import { curriculumLevels, curriculumModules, moduleSections, userModuleProgress, users } from "@/db/schema";
import { eq, asc, isNull, and } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import crypto from "crypto";

export class CurriculumService {
  async getAll(levelId?: string): Promise<ServiceResult<any>> {
    try {
      const data = await db
        .select()
        .from(curriculumModules)
        .where(
          levelId
            ? and(isNull(curriculumModules.deletedAt), eq(curriculumModules.levelId, levelId))
            : isNull(curriculumModules.deletedAt)
        )
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

      // 4. Enrich modules per level secara sekuensial (admin bebas buka semua)
      const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const userRank = cefrOrder.indexOf(userCefr.toUpperCase().slice(0, 2));

      const result = levels.map((lvl, lvlIdx) => {
        const lvlModules = modules.filter((m) => m.levelId === lvl.id);
        const lvlRank = cefrOrder.indexOf(lvl.cefr.toUpperCase().slice(0, 2));

        // Cek apakah level sebelumnya telah diselesaikan
        let prevLevelCompleted = true;
        if (lvlIdx > 0) {
          const prevLvl = levels[lvlIdx - 1];
          const prevLvlMods = modules.filter((m) => m.levelId === prevLvl.id);
          const prevLastMod = prevLvlMods[prevLvlMods.length - 1];
          if (prevLastMod) {
            const lastProg = userProgressMap[prevLastMod.id];
            prevLevelCompleted = Boolean(
              lastProg &&
              lastProg.status === "completed" &&
              (lastProg.score ?? 0) >= (prevLastMod.passingScore || 70)
            );
          }
        }

        const isFirstSubLevelOfCefr = lvl.id.endsWith(".1") || lvlIdx === 0;
        const isLevelUnlocked =
          isAdmin ||
          lvlIdx === 0 ||
          prevLevelCompleted ||
          (userRank > lvlRank && lvlRank !== -1) ||
          (userRank === lvlRank && isFirstSubLevelOfCefr);

        let lockReason: string | null = null;
        if (!isLevelUnlocked) {
          lockReason = `Selesaikan ujian akhir sub-level sebelumnya atau placement test untuk membuka ${lvl.title}.`;
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

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qId = q.id ?? `q-${i}`;
        const selected =
          answers[qId.toString()] ??
          (q.id !== undefined && q.id !== null ? answers[q.id.toString()] : undefined) ??
          answers[i.toString()] ??
          (q.id !== undefined ? answers[q.id] : undefined);

        const correctIndex =
          typeof q.answerIndex === "number"
            ? q.answerIndex
            : Array.isArray(q.options) && q.answer
            ? q.options.indexOf(q.answer)
            : -1;
        const isCorrect = selected === correctIndex;
        if (isCorrect) correctCount++;

        questionResults.push({
          questionId: qId,
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
