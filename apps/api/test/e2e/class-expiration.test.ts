import { describe, it, expect, afterAll } from "bun:test";
import { db } from "../../src/db";
import {
  users,
  userClassAccess,
  userCertificates,
  userModuleProgress,
} from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { classRepository } from "../../src/internal/repository/class_repository";
import { getClassesUsecase } from "../../src/internal/usecase/classes/get-classes.usecase";
import { getCurriculumUsecase } from "../../src/internal/usecase/curriculum/get-curriculum.usecase";
import { getModuleDetailUsecase } from "../../src/internal/usecase/curriculum/get-module-detail.usecase";
import { purchaseClassUsecase } from "../../src/internal/usecase/classes/purchase-class.usecase";
import { checkAiQuotaUsecase } from "../../src/internal/usecase/classes/check-ai-quota.usecase";

describe("Class 1-Month Expiration & Renewal E2E Tests", () => {
  const testUserId = "test-expiry-" + Date.now();
  const testEmail = `test.expiry.${Date.now()}@english.ai`;

  afterAll(async () => {
    await db.delete(userCertificates).where(eq(userCertificates.userId, testUserId)).catch(() => {});
    await db.delete(userModuleProgress).where(eq(userModuleProgress.userId, testUserId)).catch(() => {});
    await db.delete(userClassAccess).where(eq(userClassAccess.userId, testUserId)).catch(() => {});
    await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
  });

  it("1. Setup student & grant 1-month class package access", async () => {
    await db.insert(users).values({
      id: testUserId,
      name: "Student Expiry Test",
      email: testEmail,
      role: "student",
      accessType: 0,
      currentCefr: "A1",
    });

    const access = await classRepository.grantAccess(testUserId, "A1", "basic", "student_topup");
    expect(access).toBeDefined();
    expect(access.expiresAt).toBeDefined();

    // Verify validity within 30 days
    const validity = await classRepository.checkAccessValidity(access, testUserId);
    expect(validity.hasAccess).toBe(true);
    expect(validity.isExpired).toBe(false);
    expect(validity.daysRemaining).toBeGreaterThanOrEqual(29);

    // Verify classes list usecase
    const classes = await getClassesUsecase(testUserId);
    const a1 = classes.find((c) => c.cefr === "A1");
    expect(a1?.hasAccess).toBe(true);
    expect(a1?.isExpired).toBe(false);
  }, 30000);

  it("2. Active student can access module details and curriculum", async () => {
    const curriculum = await getCurriculumUsecase(testUserId);
    const a1Level = curriculum.find((l) => (l.level.cefr || "").startsWith("A1"));
    expect(a1Level?.hasAccess).toBe(true);

    const firstMod = a1Level?.modules[0];
    if (firstMod) {
      const detail = await getModuleDetailUsecase(firstMod.id, testUserId);
      expect(detail.module.id).toBe(firstMod.id);
    }
  }, 30000);

  it("3. After 1 month elapsed without completing modules, access expires", async () => {
    // Fast-forward expiresAt to 2 days in the past
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await db
      .update(userClassAccess)
      .set({ expiresAt: pastDate })
      .where(eq(userClassAccess.userId, testUserId));

    const access = await classRepository.findUserAccessByCefr(testUserId, "A1");
    const validity = await classRepository.checkAccessValidity(access, testUserId);

    expect(validity.hasAccess).toBe(false);
    expect(validity.isExpired).toBe(true);
    expect(validity.daysRemaining).toBe(0);

    // getClassesUsecase reflects expired state
    const classes = await getClassesUsecase(testUserId);
    const a1 = classes.find((c) => c.cefr === "A1");
    expect(a1?.hasAccess).toBe(false);
    expect(a1?.isExpired).toBe(true);

    // Curriculum marks modules as requiring access
    const curriculum = await getCurriculumUsecase(testUserId);
    const a1Level = curriculum.find((l) => (l.level.cefr || "").startsWith("A1"));
    expect(a1Level?.hasAccess).toBe(false);

    // getModuleDetailUsecase throws ForbiddenError for expired access
    const firstMod = a1Level?.modules[0];
    if (firstMod) {
      let threw = false;
      try {
        await getModuleDetailUsecase(firstMod.id, testUserId);
      } catch (err: any) {
        threw = true;
        expect(err.message).toMatch(/expired.*renew/i);
      }
      expect(threw).toBe(true);
    }

    // AI Quota falls back to trial when paid class access has expired
    const quota = await checkAiQuotaUsecase(testUserId);
    expect(quota.tier).toBe("trial");
  }, 30000);

  it("4. If user completes the level or earns a certificate, access is retained even past 30 days", async () => {
    // Insert a graduation certificate for A1
    await db.insert(userCertificates).values({
      id: "cert-" + Date.now(),
      certificateNumber: "CERT-" + Date.now(),
      userId: testUserId,
      cefrLevel: "A1",
      userName: "Student Expiry Test",
      score: 95,
    });

    const access = await classRepository.findUserAccessByCefr(testUserId, "A1");
    const validity = await classRepository.checkAccessValidity(access, testUserId);

    // Completed level retains lifetime access without needing to pay again
    expect(validity.hasAccess).toBe(true);
    expect(validity.isExpired).toBe(false);
    expect(validity.isCompleted).toBe(true);

    // Clean up cert for renewal test
    await db.delete(userCertificates).where(eq(userCertificates.userId, testUserId));
  }, 30000);

  it("5. Expired user can renew package, restoring access for another 30 days", async () => {
    // Ensure access is expired again
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await db
      .update(userClassAccess)
      .set({ expiresAt: pastDate })
      .where(eq(userClassAccess.userId, testUserId));

    // Student renews class package
    const renewResult = await purchaseClassUsecase(testUserId, "A1", "basic");
    expect(renewResult.message).toContain("renewed");

    // Check validity after renewal
    const access = await classRepository.findUserAccessByCefr(testUserId, "A1");
    const validity = await classRepository.checkAccessValidity(access, testUserId);

    expect(validity.hasAccess).toBe(true);
    expect(validity.isExpired).toBe(false);
    expect(validity.daysRemaining).toBeGreaterThanOrEqual(29);

    const classes = await getClassesUsecase(testUserId);
    const a1 = classes.find((c) => c.cefr === "A1");
    expect(a1?.hasAccess).toBe(true);
    expect(a1?.isExpired).toBe(false);
  }, 30000);
});
