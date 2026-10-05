import { curriculumRepository } from "../curriculum.repository";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function getCurriculumUsecase(userId?: string, levelId?: string) {
  const levels = await curriculumRepository.findAllLevels();
  const modules = await curriculumRepository.findModules(levelId);

  let userProgressMap: Record<string, { status: string; score: number | null; completedAt: any }> = {};
  let userCefr = "A1";
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

    const progresses = await curriculumRepository.findUserProgressList(userId);
    for (const p of progresses) {
      userProgressMap[p.moduleId] = {
        status: p.status,
        score: p.score,
        completedAt: p.completedAt,
      };
    }
  }

  const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userRank = cefrOrder.indexOf(userCefr.toUpperCase().slice(0, 2));

  const result = levels.map((lvl) => {
    const lvlModules = modules.filter((m) => m.levelId === lvl.id);
    const lvlRank = cefrOrder.indexOf(lvl.cefr.toUpperCase().slice(0, 2));

    let isUnlocked = isAdmin || (userRank !== -1 && lvlRank !== -1 && lvlRank <= userRank);

    const enrichedModules = lvlModules.map((m, idx) => {
      const prog = userProgressMap[m.id];
      let status = "locked";

      if (isAdmin) {
        status = prog?.status === "completed" ? "completed" : "unlocked";
      } else if (prog?.status === "completed") {
        status = "completed";
      } else if (isUnlocked && idx === 0) {
        status = "unlocked";
      } else if (idx > 0 && lvlModules[idx - 1] && userProgressMap[lvlModules[idx - 1]!.id]?.status === "completed") {
        status = "unlocked";
      }

      return {
        ...m,
        status,
        score: prog?.score ?? null,
      };
    });

    return {
      ...lvl,
      isUnlocked,
      modules: enrichedModules,
    };
  });

  return result;
}
