import { AiService } from "../../../lib/ai";
import { AppError } from "../../../common/errors/app-error";

export async function getTtsAudioUsecase(text: string, voice?: string) {
  if (!text || text.trim() === "") {
    throw new AppError("Missing text parameter", 400);
  }
  if (text.length > 1500) {
    throw new AppError("Text exceeds maximum allowed length of 1500 characters", 400);
  }

  // 1. Try cached/buffered speech first (ensures exact Content-Length for HTML5 Audio)
  const audioBuffer = await AiService.generateSpeech(text, voice);
  if (audioBuffer) {
    const isWav = audioBuffer.length > 4 && audioBuffer.toString("utf8", 0, 4) === "RIFF";
    const contentType = isWav ? "audio/wav" : "audio/mpeg";
    return {
      type: "buffer" as const,
      data: new Uint8Array(audioBuffer),
      length: audioBuffer.length,
      contentType,
    };
  }

  // 2. Fallback to direct stream if buffer failed
  const streamRes = await AiService.getSpeechStream(text);
  if (streamRes && streamRes.body) {
    const contentType = streamRes.headers.get("content-type") || "audio/mpeg";
    return {
      type: "stream" as const,
      body: streamRes.body,
      contentType,
    };
  }

  throw new AppError("Failed to generate audio", 500);
}
