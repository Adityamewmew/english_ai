import { sanitizeRepeatedChars } from "./ai-chat";
import crypto from "crypto";

/**
 * Text-To-Speech Service (Mr. Khoirul - Powered strictly by Vibi.pro)
 */
export const ttsMemoryCache = new Map<string, Buffer>();

export class AiTtsService {
  public static readonly VOICE_ID = "4N8zjn9tVNuDEBFWVHAq"; // ElevenLabs Jesse (Elearning, Casual Friendly Male)
  public static readonly JESSE_VOICE_ID = AiTtsService.VOICE_ID;

  /**
   * Text-To-Speech generator with ElevenLabs via Vibi.pro
   */
  static async generateSpeech(text: string, voiceOverride?: string): Promise<Buffer | null> {
    const cleanText = sanitizeRepeatedChars(text);
    if (!cleanText || cleanText.trim() === "" || cleanText.length > 1500) return null;

    const baseUrl = process.env.AI_TTS_BASE_URL || "https://api.vibi.pro";
    const apiKey = process.env.AI_TTS_API_KEY || "";

    if (!apiKey) {
      console.warn("AI_TTS_API_KEY is not configured for Vibi");
      return null;
    }

    const voice = (voiceOverride || process.env.AI_AUDIO_VOICE || "").trim() || AiTtsService.VOICE_ID;
    const cacheKey = crypto.createHash("sha256").update(`vibi:${voice}:${cleanText}`).digest("hex");

    // 0ms Cache Hit for frequent phrases
    const cached = ttsMemoryCache.get(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${baseUrl.replace(/\/+$/, "")}/v1/text-to-speech/${voice}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          provider: "elevenlabs",
          language_code: "en",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            speed: 1.05,
          },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`Vibi TTS submit error (${res.status}):`, await res.text());
        return null;
      }

      const task = (await res.json()) as { id?: string; status?: string };
      if (!task.id) return null;

      // Poll task status (max 25 checks * 700ms = 17.5s)
      const historyEndpoint = `${baseUrl.replace(/\/+$/, "")}/v1/history/${task.id}`;
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 700));
        const hRes = await fetch(historyEndpoint, {
          headers: { "xi-api-key": apiKey },
          signal: AbortSignal.timeout(6000),
        });

        if (!hRes.ok) continue;
        const hData = (await hRes.json()) as any;
        if (hData.status === "completed" && hData.result?.audio_url) {
          const audioUrl = String(hData.result.audio_url);
          // Security: Validate audio_url domain
          if (!audioUrl.startsWith("https://api.vibi.pro/") && !audioUrl.startsWith("https://storage.googleapis.com/")) {
            console.warn("Vibi untrusted audio_url domain:", audioUrl);
            return null;
          }

          const audioRes = await fetch(audioUrl, { signal: AbortSignal.timeout(10000) });
          if (!audioRes.ok) return null;
          const arrayBuffer = await audioRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          if (cleanText.length < 200) {
            if (ttsMemoryCache.size >= 100) {
              const oldestKey = ttsMemoryCache.keys().next().value;
              if (oldestKey) ttsMemoryCache.delete(oldestKey);
            }
            ttsMemoryCache.set(cacheKey, buffer);
          }
          return buffer;
        }

        if (hData.status === "failed") {
          console.warn("Vibi TTS task failed:", hData.error || hData.detail_error);
          return null;
        }
      }
    } catch (err: any) {
      console.warn("Vibi generateSpeech error:", err?.message || err);
    }
    return null;
  }

  /**
   * Text-To-Speech stream with Mr. Khoirul voice
   */
  static async getSpeechStream(text: string): Promise<globalThis.Response | null> {
    const buffer = await AiTtsService.generateSpeech(text);
    if (buffer) {
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": buffer.length.toString(),
          "Accept-Ranges": "bytes",
        },
      });
    }
    return null;
  }
}
