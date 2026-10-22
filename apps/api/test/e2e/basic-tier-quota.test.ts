import { describe, it, expect, afterAll } from "bun:test";
import { db } from "../../src/db";
import { users, userClassAccess, userDailyAiUsage, chatSessions } from "../../src/db/schema";
import { eq, and } from "drizzle-orm";
import { classRepository } from "../../src/internal/repository/class_repository";
import { aiUsageRepository } from "../../src/internal/repository/ai_usage_repository";
import { checkAiQuotaUsecase } from "../../src/internal/usecase/classes/check-ai-quota.usecase";
import { streamChatTurnUsecase } from "../../src/internal/usecase/chat/stream-chat-turn.usecase";
import { evaluateVoiceSessionUsecase } from "../../src/internal/usecase/voice/evaluate-voice-session.usecase";

describe("Basic Tier AI Rate-Limiting & Quota E2E Tests", () => {
  const testUserId = "test-basic-" + Date.now();
  const testEmail = `test.basic.${Date.now()}@english.ai`;
  const today = aiUsageRepository.getTodayDateString();

  afterAll(async () => {
    await db.delete(chatSessions).where(eq(chatSessions.userId, testUserId)).catch(() => {});
    await db.delete(userDailyAiUsage).where(eq(userDailyAiUsage.userId, testUserId)).catch(() => {});
    await db.delete(userClassAccess).where(eq(userClassAccess.userId, testUserId)).catch(() => {});
    await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
  });

  it("1. Setup user with Basic tier access", async () => {
    await db.insert(users).values({
      id: testUserId,
      name: "Siswa Test Basic",
      email: testEmail,
      role: "student",
      accessType: 0,
      currentCefr: "A1",
    });

    await classRepository.grantAccess(testUserId, "A1", "basic", "test_setup");

    const quota = await checkAiQuotaUsecase(testUserId);
    expect(quota.tier).toBe("basic");
    expect(quota.chat.limit).toBe(20);
    expect(quota.chat.used).toBe(0);
    expect(quota.canChat).toBe(true);
    expect(quota.voice.limitMinutes).toBe(5);
    expect(quota.voice.usedMinutes).toBe(0);
    expect(quota.canVoice).toBe(true);
  });

  it("2. Chat turn increments daily chat usage count", async () => {
    await aiUsageRepository.incrementChatCount(testUserId);
    const quota = await checkAiQuotaUsecase(testUserId);
    expect(quota.chat.used).toBe(1);
    expect(quota.chat.remaining).toBe(19);
    expect(quota.canChat).toBe(true);
  });

  it("3. Chat quota exceeded blocks stream and returns polite upgrade message", async () => {
    // Set usage to maximum (20)
    await db
      .update(userDailyAiUsage)
      .set({ chatCount: 20 })
      .where(and(eq(userDailyAiUsage.userId, testUserId), eq(userDailyAiUsage.usageDate, today)));

    const quota = await checkAiQuotaUsecase(testUserId);
    expect(quota.chat.used).toBe(20);
    expect(quota.canChat).toBe(false);
    expect(quota.chat.isExceeded).toBe(true);

    // Call streamChatTurnUsecase
    const sessionId = "chat-sess-" + Date.now();
    await db.insert(chatSessions).values({
      id: sessionId,
      userId: testUserId,
      title: "Test Chat",
    });

    let fullReply = "";
    for await (const chunk of streamChatTurnUsecase({
      sessionId,
      studentMessage: "Hello Mr Khoirul, can we practice?",
      userId: testUserId,
    })) {
      fullReply += chunk;
    }

    expect(fullReply).toContain("mencapai batas");
    expect(fullReply).toContain("20 pesan");
  });

  it("4. Voice call duration tracking and 5-minute quota enforcement", async () => {
    // Reset voice seconds to 0
    await db
      .update(userDailyAiUsage)
      .set({ voiceSeconds: 0 })
      .where(and(eq(userDailyAiUsage.userId, testUserId), eq(userDailyAiUsage.usageDate, today)));

    // Sesi 1: 120 detik (2 menit)
    await evaluateVoiceSessionUsecase({
      userId: testUserId,
      topic: "Daily Introduction",
      durationSeconds: 120,
      skipEvaluation: true,
    });

    let quota = await checkAiQuotaUsecase(testUserId);
    expect(quota.voice.usedMinutes).toBe(2);
    expect(quota.voice.remainingMinutes).toBe(3);
    expect(quota.canVoice).toBe(true);

    // Sesi 2: 200 detik lagi (total 320 detik = 5 menit 20 detik -> limit 5 menit terlampaui)
    await evaluateVoiceSessionUsecase({
      userId: testUserId,
      topic: "Food & Drinks",
      durationSeconds: 200,
      skipEvaluation: true,
    });

    quota = await checkAiQuotaUsecase(testUserId);
    expect(quota.voice.usedMinutes).toBe(5);
    expect(quota.canVoice).toBe(false);
    expect(quota.voice.isExceeded).toBe(true);
  });
});
