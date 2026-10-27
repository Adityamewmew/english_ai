import { sanitizeRepeatedChars } from "./ai-chat";
import crypto from "crypto";

/**
 * Multi-Tier Text-To-Speech Service (Mr. Khoirul - ElevenLabs Voice: CwhRBWXzGAHq8TQ4Fs17)
 */
// In-memory audio cache for repeated common phrases (max 100 entries, native Map)
export const ttsMemoryCache = new Map<string, Buffer>();

export class AiTtsService {
  public static readonly MINIMAX_VOICE_ID = "English_magnetic_voiced_man";
  public static readonly MINIMAX_MODEL = "speech-2.8-turbo";
  public static readonly MINIMAX_URL = "https://api.minimax.io/v1/t2a_v2";

  // Kode lama ElevenLabs constants (dipertahankan)
  public static readonly ROGER_VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17";
  public static readonly DEFAULT_MODEL = "elevenlabs/eleven_multilingual_v2";

  /**
   * Text-To-Speech generator with MiniMax (Primary) & ElevenLabs (Archived)
   */
  static async generateSpeech(text: string, voiceOverride?: string): Promise<Buffer | null> {
    const cleanText = sanitizeRepeatedChars(text);
    if (!cleanText || cleanText.trim() === "" || cleanText.length > 1500) return null;

    const minimaxKey = process.env.MINIMAX_API_KEY;
    const minimaxUrl = process.env.MINIMAX_API_URL || this.MINIMAX_URL;
    const voice = (voiceOverride || process.env.MINIMAX_VOICE_ID || this.MINIMAX_VOICE_ID).trim();
    const model = (process.env.MINIMAX_MODEL || this.MINIMAX_MODEL).trim();

    const cacheKey = crypto.createHash("sha256").update(`minimax:${voice}:${cleanText}`).digest("hex");

    // 0ms Cache Hit for frequent phrases
    const cached = ttsMemoryCache.get(cacheKey);
    if (cached) return cached;

    // 1. MiniMax Speech 2.8 Turbo
    if (minimaxKey) {
      try {
        const res = await fetch(minimaxUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${minimaxKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            text: cleanText,
            stream: false,
            output_format: "hex",
            voice_setting: {
              voice_id: voice,
              speed: 1.0,
              vol: 1.0,
              pitch: 0,
            },
            audio_setting: {
              sample_rate: 32000,
              bitrate: 128000,
              format: "mp3",
              channel: 1,
            },
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.base_resp?.status_code === 0 && data.data?.audio) {
            const buffer = Buffer.from(data.data.audio, "hex");

            if (cleanText.length < 150) {
              if (ttsMemoryCache.size >= 100) {
                const oldestKey = ttsMemoryCache.keys().next().value;
                if (oldestKey) ttsMemoryCache.delete(oldestKey);
              }
              ttsMemoryCache.set(cacheKey, buffer);
            }

            return buffer;
          } else {
            console.warn("MiniMax TTS warning:", data.base_resp?.status_msg || data);
          }
        }
      } catch (err: any) {
        console.warn("MiniMax TTS fetch error:", err?.message || err);
      }
    }

    /*
    // KODE LAMA ELEVENLABS / OMNIROUTE (DICOMMENT)
    const baseUrl = process.env.AI_TTS_BASE_URL || process.env.AI_BASE_URL;
    const apiKey = process.env.AI_TTS_API_KEY || process.env.AI_API_KEY || "";

    if (!baseUrl || !apiKey) return null;

    const audioModel = (process.env.AI_AUDIO_MODEL || "").trim() || this.DEFAULT_MODEL;

    const candidates = [
      { model: audioModel, voice: (voiceOverride || process.env.AI_AUDIO_VOICE || "").trim() || this.ROGER_VOICE_ID },
      { model: this.DEFAULT_MODEL, voice: this.ROGER_VOICE_ID },
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
    */

    return null;
  }

  /**
   * Text-To-Speech stream with Mr. Khoirul voice
   */
  static async getSpeechStream(text: string): Promise<globalThis.Response | null> {
    /*
    // KODE LAMA ELEVENLABS STREAM (DICOMMENT)
    const baseUrl = process.env.AI_TTS_BASE_URL || process.env.AI_BASE_URL;
    const apiKey = process.env.AI_TTS_API_KEY || process.env.AI_API_KEY || "";
    const cleanText = sanitizeRepeatedChars(text);

    if (!baseUrl || !apiKey || !cleanText || cleanText.trim() === "") return null;

    const voice = (process.env.AI_AUDIO_VOICE || "").trim() || this.ROGER_VOICE_ID;
    const audioModel = (process.env.AI_AUDIO_MODEL || "").trim() || this.DEFAULT_MODEL;

    const candidates = [
      { model: audioModel, voice },
      { model: this.DEFAULT_MODEL, voice: this.ROGER_VOICE_ID },
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
    */

    return null;
  }
}
