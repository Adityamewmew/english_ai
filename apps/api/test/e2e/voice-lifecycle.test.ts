import { describe, it, expect } from "bun:test";
import { app } from "../../src/server";
import { voiceRepository } from "../../src/internal/repository/voice_repository";
import { finalizeAbandonedVoiceSessions } from "../../src/internal/usecase/voice/evaluate-voice-session.usecase";

describe("Voice Call AI Lifecycle E2E Tests", () => {
  const testUserId = "voice-test-" + Date.now();
  let createdSessionId = "";

  it("POST /api/voice/sessions - should initialize an active voice session", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/voice/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": testUserId,
        },
        body: JSON.stringify({
          topic: "Daily English Introduction",
          userId: testUserId,
          sttProvider: "web-speech",
        }),
      })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBeDefined();
    expect(json.data.status).toBe("active");
    createdSessionId = json.data.id;
  });

  it("POST /api/voice/turn-stream - should stream sentence-by-sentence SSE events with index", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/voice/turn-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": testUserId,
        },
        body: JSON.stringify({
          sessionId: createdSessionId,
          topic: "Daily English Introduction",
          history: [],
          studentMessage: "Hello Mr. Khoirul, my name is Budi and I am from Jakarta.",
          turnIndex: 0,
          userId: testUserId,
        }),
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain("data:");
    expect(text).toContain("sentence");
    expect(text).toContain('"index":');

    // Verify transcript was persisted to database
    const sessionInDb = await voiceRepository.findById(createdSessionId);
    expect(sessionInDb).toBeDefined();
    expect(sessionInDb?.transcript).toContain("Jakarta");
  }, 15000);

  it("POST /api/voice/tts - should return MP3 audio buffer with Content-Length", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Hello! Welcome to our English conversation session.",
        }),
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("audio/");
    const length = res.headers.get("content-length");
    expect(length).toBeDefined();
    expect(parseInt(length || "0", 10)).toBeGreaterThan(100);
  });

  it("POST /api/voice/evaluate - should finalize session as completed with CEFR evaluation", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/voice/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": testUserId,
        },
        body: JSON.stringify({
          sessionId: createdSessionId,
          topic: "Daily English Introduction",
          durationSeconds: 120,
          userId: testUserId,
          sttProvider: "web-speech",
        }),
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.evaluation).toBeDefined();
    expect(json.data.evaluation.cefr).toBeDefined();

    // Verify status in DB changed to "completed"
    const sessionInDb = await voiceRepository.findById(createdSessionId);
    expect(sessionInDb?.status).toBe("completed");
    expect(sessionInDb?.durationSeconds).toBe(120);
  }, 20000);

  it("finalizeAbandonedVoiceSessions - should mark empty abandoned session as abandoned", async () => {
    // Create an empty abandoned session to test finalization
    const abandonedSess = await voiceRepository.createSession({
      userId: testUserId,
      topic: "Abandoned Test",
    });

    await finalizeAbandonedVoiceSessions(0, 10);
    const updated = await voiceRepository.findById(abandonedSess.id);
    expect(updated?.status).toBe("abandoned");
  });
});
