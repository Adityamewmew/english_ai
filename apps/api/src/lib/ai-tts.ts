import { sanitizeRepeatedChars } from "./ai-chat";
import crypto from "crypto";

/**
 * Text-To-Speech Service (Mr. Khoirul - ElevenLabs Voice: CwhRBWXzGAHq8TQ4Fs17)
 * Connected via OmniRoute OpenAI-compatible /audio/speech endpoint
 */
// In-memory audio cache for repeated common phrases (max 100 entries, native Map)
export const ttsMemoryCache = new Map<string, Buffer>();

export class AiTtsService {
  public static readonly LIAM_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"; // ElevenLabs Liam (Energetic, Young, Casual - Recommended)
  public static readonly WILL_VOICE_ID = "bIHbv24MWmeRgasZH58o"; // ElevenLabs Will (Relaxed, Optimist, Chill)
  public static readonly ADAM_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // ElevenLabs Adam (Firm, Dynamic)
  public static readonly ROGER_VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17"; // ElevenLabs Roger (Legacy Narrator)
  public static readonly DEFAULT_MODEL = "elevenlabs/eleven_multilingual_v2";
  public static readonly TURBO_MODEL = "elevenlabs/eleven_turbo_v2_5";

  /**
   * Helper to generate speech using Vibi Task Queue API
   */
  private static async generateVibiSpeech(
    cleanText: string,
    voice: string,
    apiKey: string,
    baseUrl: string
  ): Promise<Buffer | null> {
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

      // Poll task status (max 12 checks * 500ms = 6s)
      const historyEndpoint = `${baseUrl.replace(/\/+$/, "")}/v1/history/${task.id}`;
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const hRes = await fetch(historyEndpoint, {
          headers: { "xi-api-key": apiKey },
          signal: AbortSignal.timeout(5000),
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
          return Buffer.from(arrayBuffer);
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
   * Text-To-Speech generator with ElevenLabs via Vibi or OpenAI-compatible gateway
   */
  static async generateSpeech(text: string, voiceOverride?: string): Promise<Buffer | null> {
    const cleanText = sanitizeRepeatedChars(text);
    if (!cleanText || cleanText.trim() === "" || cleanText.length > 1500) return null;

    const baseUrl = process.env.AI_TTS_BASE_URL || process.env.AI_BASE_URL;
    const apiKey = process.env.AI_TTS_API_KEY || process.env.AI_API_KEY || "";

    if (!baseUrl || !apiKey) return null;

    const voice = (voiceOverride || process.env.AI_AUDIO_VOICE || "").trim() || this.LIAM_VOICE_ID;
    const audioModel = (process.env.AI_AUDIO_MODEL || "").trim() || this.DEFAULT_MODEL;

    const cacheKey = crypto.createHash("sha256").update(`eleven:${voice}:${cleanText}`).digest("hex");

    // 0ms Cache Hit for frequent phrases
    const cached = ttsMemoryCache.get(cacheKey);
    if (cached) return cached;

    // 1. Vibi Task Queue Integration
    if (baseUrl.includes("vibi.pro")) {
      const buffer = await this.generateVibiSpeech(cleanText, voice, apiKey, baseUrl);
      if (buffer) {
        if (cleanText.length < 200) {
          if (ttsMemoryCache.size >= 100) {
            const oldestKey = ttsMemoryCache.keys().next().value;
            if (oldestKey) ttsMemoryCache.delete(oldestKey);
          }
          ttsMemoryCache.set(cacheKey, buffer);
        }
        return buffer;
      }
      return null;
    }

    // 2. OpenAI-Compatible Gateway (OmniRoute / Standard)
    const candidates = [
      { model: audioModel, voice },
      { model: this.DEFAULT_MODEL, voice: this.LIAM_VOICE_ID },
      { model: this.TURBO_MODEL, voice: this.LIAM_VOICE_ID },
    ];

    const endpoint = `${baseUrl.replace(/\/+$/, "")}/audio/speech`;

    for (const candidate of candidates) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: candidate.model,
            input: cleanText,
            voice: candidate.voice,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          if (cleanText.length < 150) {
            if (ttsMemoryCache.size >= 100) {
              const oldestKey = ttsMemoryCache.keys().next().value;
              if (oldestKey) ttsMemoryCache.delete(oldestKey);
            }
            ttsMemoryCache.set(cacheKey, buffer);
          }

          return buffer;
        }

        const errText = await res.text();
        console.warn(`TTS Gateway [${candidate.model}/${candidate.voice}] (${res.status}):`, errText);

        if (res.status === 429) break;
      } catch (err: any) {
        console.warn(`TTS candidate [${candidate.model}/${candidate.voice}] error:`, err?.message || err);
      }
    }

    return null;
  }

  /**
   * Text-To-Speech stream with Mr. Khoirul voice
   */
  static async getSpeechStream(text: string): Promise<globalThis.Response | null> {
    const baseUrl = process.env.AI_TTS_BASE_URL || process.env.AI_BASE_URL;
    const apiKey = process.env.AI_TTS_API_KEY || process.env.AI_API_KEY || "";
    const cleanText = sanitizeRepeatedChars(text);

    if (!baseUrl || !apiKey || !cleanText || cleanText.trim() === "") return null;

    const voice = (process.env.AI_AUDIO_VOICE || "").trim() || this.LIAM_VOICE_ID;
    const audioModel = (process.env.AI_AUDIO_MODEL || "").trim() || this.DEFAULT_MODEL;

    // Vibi returns full audio buffer, wrap in Response
    if (baseUrl.includes("vibi.pro")) {
      const buffer = await this.generateSpeech(cleanText, voice);
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

    const candidates = [
      { model: audioModel, voice },
      { model: this.DEFAULT_MODEL, voice: this.LIAM_VOICE_ID },
      { model: this.TURBO_MODEL, voice: this.LIAM_VOICE_ID },
    ];

    const endpoint = `${baseUrl.replace(/\/+$/, "")}/audio/speech`;

    for (const candidate of candidates) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: candidate.model,
            input: cleanText,
            voice: candidate.voice,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          return res;
        }

        if (res.status === 429) break;
      } catch {
        // try next candidate
      }
    }

    return null;
  }
}
