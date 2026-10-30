import { classRepository } from "../../repository/class_repository";
import { certificateRepository } from "../../repository/certificate_repository";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { isUserAdmin } from "@english-ai/shared";

export async function getClassesUsecase(userId?: string) {
  const classes = await classRepository.findActiveClasses();

  let userAccessMap: Record<string, boolean> = {};
  let userExpiredMap: Record<string, boolean> = {};
  let userExpiresAtMap: Record<string, string | null> = {};
  let userDaysRemainingMap: Record<string, number | null> = {};
  let userTierMap: Record<string, string> = {};
  let userCertsMap: Record<string, boolean> = {};
  let userCefr = "A1";
  let isAdmin = false;

  if (userId) {
    const [u] = await db
      .select({
        role: users.role,
        accessType: users.accessType,
        email: users.email,
        currentCefr: users.currentCefr,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (u) {
      if (u.currentCefr) userCefr = u.currentCefr;
      if (isUserAdmin(u)) {
        isAdmin = true;
      }
    }

    const accesses = await classRepository.findUserAccesses(userId);
    for (const a of accesses) {
      const cefrKey = a.cefr.toUpperCase();
      const validity = await classRepository.checkAccessValidity(a, userId);
      userAccessMap[cefrKey] = validity.hasAccess;
      userExpiredMap[cefrKey] = validity.isExpired;
      userExpiresAtMap[cefrKey] = validity.expiresAt?.toISOString() ?? null;
      userDaysRemainingMap[cefrKey] = validity.daysRemaining;
      userTierMap[cefrKey] = (a.tier || "basic").toLowerCase();
    }

    const certs = await certificateRepository.findUserCertificates(userId);
    for (const c of certs) {
      userCertsMap[c.cefrLevel.toUpperCase()] = true;
    }
  }

  const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userRank = cefrOrder.indexOf(userCefr.toUpperCase().slice(0, 2));

  return classes.map((c) => {
    const cefr = c.cefr.toUpperCase();
    const rank = cefrOrder.indexOf(cefr);
    const hasAccess = isAdmin || !!userAccessMap[cefr];
    const isExpired = !isAdmin && !!userExpiredMap[cefr];
    const expiresAt = userExpiresAtMap[cefr] ?? null;
    const daysRemaining = userDaysRemainingMap[cefr] ?? null;
    const userTier = userTierMap[cefr] || (isAdmin ? "ultra" : null);

    const isEligible =
      isAdmin ||
      hasAccess ||
      rank === 0 ||
      (userRank !== -1 && rank <= userRank) ||
      (rank > 0 && !!userCertsMap[cefrOrder[rank - 1]]);

    const prevCefr = rank > 0 ? cefrOrder[rank - 1] : null;

    return {
      ...c,
      hasAccess,
      isExpired,
      expiresAt,
      daysRemaining,
      userTier,
      isEligible,
      prerequisiteCefr: prevCefr,
      requiresCertificate: !hasAccess && rank > 0 && !isEligible,
    };
  });
}
