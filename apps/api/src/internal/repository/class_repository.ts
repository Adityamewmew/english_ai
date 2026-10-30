import { db } from "../../db";
import {
  courseClasses,
  userClassAccess,
  curriculumLevels,
  curriculumModules,
  userModuleProgress,
  userCertificates,
} from "../../db/schema";
import { eq, and, asc, or, ilike, inArray, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

export const classRepository = {
  findActiveClasses: async () => {
    return await db
      .select()
      .from(courseClasses)
      .where(eq(courseClasses.isActive, true))
      .orderBy(asc(courseClasses.orderIndex));
  },

  findClassByCefr: async (cefr: string) => {
    const res = await db
      .select()
      .from(courseClasses)
      .where(eq(courseClasses.cefr, cefr))
      .limit(1);
    return res[0] ?? null;
  },

  findUserAccesses: async (userId: string) => {
    return await db
      .select()
      .from(userClassAccess)
      .where(
        and(
          eq(userClassAccess.userId, userId),
          eq(userClassAccess.status, "active")
        )
      );
  },

  findUserAccessByCefr: async (userId: string, cefr: string) => {
    const res = await db
      .select()
      .from(userClassAccess)
      .where(
        and(
          eq(userClassAccess.userId, userId),
          eq(userClassAccess.cefr, cefr),
          eq(userClassAccess.status, "active")
        )
      )
      .limit(1);
    return res[0] ?? null;
  },

  isLevelCompleted: async (userId: string, cefr: string): Promise<boolean> => {
    // 1. Cek jika user sudah memperoleh sertifikat kelulusan level ini
    const [cert] = await db
      .select({ id: userCertificates.id })
      .from(userCertificates)
      .where(
        and(
          eq(userCertificates.userId, userId),
          ilike(userCertificates.cefrLevel, `${cefr}%`)
        )
      )
      .limit(1);
    if (cert) return true;

    // 2. Cek semua modul aktif pada sub-level yang cocok dengan CEFR ini
    const matchingLevels = await db
      .select({ id: curriculumLevels.id })
      .from(curriculumLevels)
      .where(
        or(
          ilike(curriculumLevels.cefr, `${cefr}%`),
          ilike(curriculumLevels.id, `${cefr}%`)
        )
      );

    if (matchingLevels.length === 0) return false;
    const levelIds = matchingLevels.map((l) => l.id);

    const mods = await db
      .select({ id: curriculumModules.id })
      .from(curriculumModules)
      .where(
        and(
          isNull(curriculumModules.deletedAt),
          eq(curriculumModules.isActive, true),
          inArray(curriculumModules.levelId, levelIds)
        )
      );

    if (mods.length === 0) return false;

    const completed = await db
      .select({ moduleId: userModuleProgress.moduleId })
      .from(userModuleProgress)
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          eq(userModuleProgress.status, "completed"),
          inArray(userModuleProgress.moduleId, mods.map((m) => m.id))
        )
      );

    return completed.length >= mods.length;
  },

  checkAccessValidity: async (
    access: typeof userClassAccess.$inferSelect | null,
    userId: string
  ): Promise<{
    hasAccess: boolean;
    isExpired: boolean;
    isCompleted: boolean;
    expiresAt: Date | null;
    daysRemaining: number | null;
  }> => {
    if (!access || access.status !== "active") {
      return {
        hasAccess: false,
        isExpired: false,
        isCompleted: false,
        expiresAt: null,
        daysRemaining: null,
      };
    }

    const expiresAt = access.expiresAt
      ? new Date(access.expiresAt)
      : new Date(new Date(access.updatedAt).getTime() + 30 * 24 * 60 * 60 * 1000);

    const now = Date.now();
    const isTimeExpired = now > expiresAt.getTime();
    const diffMs = expiresAt.getTime() - now;
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (!isTimeExpired) {
      return {
        hasAccess: true,
        isExpired: false,
        isCompleted: false,
        expiresAt,
        daysRemaining,
      };
    }

    // 1 bulan telah lewat. Cek apakah seluruh modul pada level ini sudah diselesaikan:
    const isCompleted = await classRepository.isLevelCompleted(userId, access.cefr);
    if (isCompleted) {
      return {
        hasAccess: true,
        isExpired: false,
        isCompleted: true,
        expiresAt,
        daysRemaining: 0,
      };
    }

    // Belum menyelesaikan modul & sudah lewat 1 bulan -> wajib bayar lagi
    return {
      hasAccess: false,
      isExpired: true,
      isCompleted: false,
      expiresAt,
      daysRemaining: 0,
    };
  },

  grantAccess: async (
    userId: string,
    cefr: string,
    tier = "basic",
    grantedBy = "student_purchase"
  ) => {
    const normalizedTier = tier.toLowerCase();
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Masa berlaku 1 bulan (30 hari)

    const [row] = await db
      .insert(userClassAccess)
      .values({
        id,
        userId,
        cefr,
        tier: normalizedTier,
        grantedBy,
        status: "active",
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [userClassAccess.userId, userClassAccess.cefr],
        set: {
          status: "active",
          tier: normalizedTier,
          grantedBy,
          expiresAt,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  },
};
