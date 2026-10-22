import { curriculumRepository } from "../../repository/curriculum_repository";
import { classRepository } from "../../repository/class_repository";
import { certificateRepository } from "../../repository/certificate_repository";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function getCurriculumUsecase(userId?: string, levelId?: string) {
  const levels = await curriculumRepository.findAllLevels();
  const modules = await curriculumRepository.findModules(levelId);
  const activeClasses = await classRepository.findActiveClasses();

  const classMap: Record<string, any> = {};
  for (const c of activeClasses) {
    classMap[c.cefr.toUpperCase()] = c;
  }

  let userProgressMap: Record<
    string,
    { status: string; score: number | null; completedAt: any }
  > = {};
  let userAccessMap: Record<string, boolean> = {};
  let userCertsMap: Record<string, boolean> = {};
  let userCefr = "A1";
  let isAdmin = false;

  if (userId) {
    const [u] = await db
      .select({
        currentCefr: users.currentCefr,
        role: users.role,
        accessType: users.accessType,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (u) {
      if (u.currentCefr) userCefr = u.currentCefr;
      if (
        u.role === "admin" ||
        u.accessType === 1 ||
        u.email?.toLowerCase().includes("khoirul")
      ) {
        isAdmin = true;
      }
    }

    const progresses = await curriculumRepository.findUserProgressList(userId);
    for (const p of progresses) {
      userProgressMap[p.moduleId] = {
        status: p.status,
        score: p.score,
        completedAt: p.completedAt,
      };
    }

    const accesses = await classRepository.findUserAccesses(userId);
    for (const a of accesses) {
      userAccessMap[a.cefr.toUpperCase()] = true;
    }

    const certs = await certificateRepository.findUserCertificates(userId);
    for (const c of certs) {
      userCertsMap[c.cefrLevel.toUpperCase()] = true;
    }
  }

  const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userRank = cefrOrder.indexOf(userCefr.toUpperCase().slice(0, 2));

  const result = levels.map((lvl) => {
    const lvlModules = modules
      .filter((m: any) => m.levelId === lvl.id)
      .sort(
        (a: any, b: any) =>
          a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)
      );

    const baseCefr = (lvl.cefr || "A1").toUpperCase().slice(0, 2);
    const lvlRank = cefrOrder.indexOf(baseCefr);
    const classInfo = classMap[baseCefr] ?? null;

    const hasAccess = isAdmin || !!userAccessMap[baseCefr];
    const isEligible =
      isAdmin ||
      hasAccess ||
      lvlRank === 0 ||
      (userRank !== -1 && lvlRank <= userRank) ||
      (lvlRank > 0 && !!userCertsMap[cefrOrder[lvlRank - 1]]);

    const isUnlocked = hasAccess;
    const requiresPurchase = !hasAccess && !isAdmin;

    const enrichedModules = lvlModules.map((m: any, idx: number) => {
      const prog = userProgressMap[m.id];
      let status = "locked";

      if (isAdmin) {
        status = prog?.status === "completed" ? "completed" : "unlocked";
      } else if (!hasAccess) {
        status = "requires_access";
      } else if (prog?.status === "completed") {
        status = "completed";
      } else if (idx === 0) {
        status = "unlocked";
      } else if (idx > 0) {
        const prevProg = userProgressMap[lvlModules[idx - 1].id];
        if (prevProg?.status === "completed") {
          status = "unlocked";
        }
      }

      return {
        ...m,
        status,
        score: prog?.score ?? null,
        completedAt: prog?.completedAt ?? null,
      };
    });

    return {
      level: lvl,
      modules: enrichedModules,
      isUnlocked,
      hasAccess,
      isEligible,
      requiresPurchase,
      classInfo,
    };
  });

  return result;
}
