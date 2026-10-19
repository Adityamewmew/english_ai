import { describe, it, expect } from "bun:test";
import { app } from "../../src/server";

describe("Chat AI E2E / Integration Tests", () => {
  const testUserId = "test-user-" + Date.now();
  let createdSessionId = "";

  it("POST /api/chat/sessions - should create a new chat session", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": testUserId,
        },
        body: JSON.stringify({
          title: "Percakapan Belajar Baru",
          userId: testUserId,
        }),
      })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBeDefined();
    expect(json.data.title).toBe("Percakapan Belajar Baru");
    createdSessionId = json.data.id;
  });

  it("GET /api/chat/sessions - should list user sessions", async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/chat/sessions?userId=${testUserId}`, {
        method: "GET",
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/chat/sessions/:id/stream - should reject unauthorized user or nonexistent session", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/chat/sessions/invalid-session-id/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "unauthorized-user",
        },
        body: JSON.stringify({
          message: "Hello!",
        }),
      })
    );

    expect(res.status).toBe(404);
  });

  it("POST /api/chat/sessions/:id/stream - should return SSE content-type and stream chunks", async () => {
    const clientMessageId = "msg-e2e-" + Date.now();

    const res = await app.handle(
      new Request(`http://localhost/api/chat/sessions/${createdSessionId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": testUserId,
        },
        body: JSON.stringify({
          message: "Hello Mr. Khoirul, I am practicing speaking today.",
          clientMessageId,
        }),
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const text = await res.text();
    expect(text).toContain("data:");
    expect(text).toContain("token");

    // Test Idempotency: second request with identical clientMessageId returns cached reply
    const res2 = await app.handle(
      new Request(`http://localhost/api/chat/sessions/${createdSessionId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": testUserId,
        },
        body: JSON.stringify({
          message: "Hello Mr. Khoirul, I am practicing speaking today.",
          clientMessageId,
        }),
      })
    );
    expect(res2.status).toBe(200);
    const text2 = await res2.text();
    expect(text2).toContain("data:");
  }, 15000);
});
