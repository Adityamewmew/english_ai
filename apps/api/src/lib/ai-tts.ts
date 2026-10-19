import { sanitizeRepeatedChars } from "./ai-chat";

/**
 * Multi-Tier Text-To-Speech Service (Mr. Khoirul - ElevenLabs Voice: CwhRBWXzGAHq8TQ4Fs17)
 */
// In-memory audio cache for repeated common phrases (max 100 entries, native Map)
const ttsMemoryCache = new Map<string, Buffer>();

export class AiTtsService {
  private static readonly ROGER_VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17";
  private static readonly DEFAULT_MODEL = "elevenlabs/eleven_multilingual_v2";

  /**
   * Text-To-Speech generator with Mr. Khoirul voice
   */
  static async generateSpeech(text: string): Promise<Buffer | null> {
    const cleanText = sanitizeRepeatedChars(text);
    if (!cleanText || cleanText.trim() === "") return null;

    // 0ms Cache Hit for frequent phrases
    const cached = ttsMemoryCache.get(cleanText);
    if (cached) return cached;

    const baseUrl = process.env.AI_TTS_BASE_URL || process.env.AI_BASE_URL;
    const apiKey = process.env.AI_TTS_API_KEY || process.env.AI_API_KEY || "";

    if (!baseUrl || !apiKey) return null;

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
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Cache up to 100 frequent phrases in memory
          if (cleanText.length < 150) {
            if (ttsMemoryCache.size >= 100) {
              const oldestKey = ttsMemoryCache.keys().next().value;
              if (oldestKey) ttsMemoryCache.delete(oldestKey);
            }
            ttsMemoryCache.set(cleanText, buffer);
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

    return null;
  }
}
