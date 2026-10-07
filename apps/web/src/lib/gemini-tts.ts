import { sanitizeRepeatedChars } from "./gemini-chat";

/**
 * Multi-Tier Text-To-Speech Service (Mr. Khoirul - ElevenLabs Voice: CwhRBWXzGAHq8TQ4Fs17)
 */
export class GeminiTtsService {
  /**
   * Text-To-Speech generator with Mr. Khoirul voice
   */
  static async generateSpeech(text: string): Promise<Buffer | null> {
    const baseUrl =
      process.env.AI_TTS_BASE_URL ||
      (process.env.AI_BASE_URL?.includes("tiarina")
        ? "http://localhost:20128/v1"
        : process.env.AI_BASE_URL) ||
      "http://localhost:20128/v1";

    const apiKey =
      process.env.AI_TTS_API_KEY ||
      (process.env.AI_BASE_URL?.includes("tiarina")
        ? "sk-96f2316f84884524-2cee23-3c70805b"
        : process.env.AI_API_KEY) ||
      "sk-96f2316f84884524-2cee23-3c70805b";

    const cleanText = sanitizeRepeatedChars(text);
    if (!baseUrl || !cleanText || cleanText.trim() === "") return null;

    // Use OmniRoute combo audio (Deepgram) or ElevenLabs candidate
    const mrKhoirulVoice = process.env.AI_AUDIO_VOICE || "aura-orion-en";
    const candidates = [
      { model: "audio", voice: mrKhoirulVoice },
      { model: "audio", voice: "alloy" },
      { model: "elevenlabs/eleven_multilingual_v2", voice: mrKhoirulVoice },
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
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }

        const errText = await res.text();
        console.warn(`TTS Proxy [${candidate.model}/${candidate.voice}] (${res.status}):`, errText);

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
    const baseUrl =
      process.env.AI_TTS_BASE_URL ||
      (process.env.AI_BASE_URL?.includes("tiarina")
        ? "http://localhost:20128/v1"
        : process.env.AI_BASE_URL) ||
      "http://localhost:20128/v1";

    const apiKey =
      process.env.AI_TTS_API_KEY ||
      (process.env.AI_BASE_URL?.includes("tiarina")
        ? "sk-96f2316f84884524-2cee23-3c70805b"
        : process.env.AI_API_KEY) ||
      "sk-96f2316f84884524-2cee23-3c70805b";

    const cleanText = sanitizeRepeatedChars(text);
    if (!baseUrl || !cleanText || cleanText.trim() === "") return null;

    const mrKhoirulVoice = process.env.AI_AUDIO_VOICE || "aura-orion-en";
    const candidates = [
      { model: "audio", voice: mrKhoirulVoice },
      { model: "audio", voice: "alloy" },
      { model: "elevenlabs/eleven_multilingual_v2", voice: mrKhoirulVoice },
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
          signal: AbortSignal.timeout(6000),
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
