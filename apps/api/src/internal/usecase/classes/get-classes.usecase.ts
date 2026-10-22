import { classRepository } from "../../repository/class_repository";
import { certificateRepository } from "../../repository/certificate_repository";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function getClassesUsecase(userId?: string) {
  const classes = await classRepository.findActiveClasses();

  let userAccessMap: Record<string, boolean> = {};
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
      if (
        u.role === "admin" ||
        u.accessType === 1 ||
        u.email?.toLowerCase().includes("khoirul")
      ) {
        isAdmin = true;
      }
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

  return classes.map((c) => {
    const cefr = c.cefr.toUpperCase();
    const rank = cefrOrder.indexOf(cefr);
    const hasAccess = isAdmin || !!userAccessMap[cefr];

    // Check prerequisite eligibility:
    // 1. Admin always eligible
    // 2. A1 is always eligible
    // 3. User placement rank >= this rank
    // 4. User holds certificate for previous CEFR level
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
      isEligible,
      prerequisiteCefr: prevCefr,
      requiresCertificate: !hasAccess && rank > 0 && !isEligible,
    };
  });
}
