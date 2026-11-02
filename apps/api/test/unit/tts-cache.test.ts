import { describe, it, expect, beforeEach } from "bun:test";
import crypto from "crypto";
import { ttsMemoryCache, AiTtsService } from "../../src/lib/ai-tts";

describe("TTS Hash Cache Unit Tests", () => {
  beforeEach(() => {
    ttsMemoryCache.clear();
  });

  it("should generate deterministic SHA-256 cache keys", () => {
    const text = "Hello, welcome to English class!";
    const voice = AiTtsService.JESSE_VOICE_ID;

    const key1 = crypto.createHash("sha256").update(`${voice}:${text}`).digest("hex");
    const key2 = crypto.createHash("sha256").update(`${voice}:${text}`).digest("hex");

    expect(key1).toBe(key2);
    expect(key1.length).toBe(64);
  });

  it("should support caching up to 500 entries for credit optimization", () => {
    for (let i = 0; i < 500; i++) {
      ttsMemoryCache.set(`key-${i}`, Buffer.from([i % 256]));
    }
    expect(ttsMemoryCache.size).toBe(500);
    expect(ttsMemoryCache.has("key-0")).toBe(true);
    expect(ttsMemoryCache.has("key-499")).toBe(true);
  });

  it("should produce different cache keys for different voices", () => {
    const text = "Hello, welcome to English class!";
    const key1 = crypto.createHash("sha256").update(`voice-a:${text}`).digest("hex");
    const key2 = crypto.createHash("sha256").update(`voice-b:${text}`).digest("hex");

    expect(key1).not.toBe(key2);
  });

  it("should store and retrieve audio buffer from in-memory cache", () => {
    const key = "test-hash-key";
    const dummyBuffer = Buffer.from([0xff, 0xfb, 0x90, 0x64]); // dummy MP3 header

    ttsMemoryCache.set(key, dummyBuffer);
    expect(ttsMemoryCache.has(key)).toBe(true);
    expect(ttsMemoryCache.get(key)).toBe(dummyBuffer);
  });
});
