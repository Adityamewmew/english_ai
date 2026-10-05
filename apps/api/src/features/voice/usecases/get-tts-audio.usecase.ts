import { GeminiService } from "../../../lib/gemini";
import { AppError } from "../../../core/errors/app-error";

export async function getTtsAudioUsecase(text: string) {
  if (!text || text.trim() === "") {
    throw new AppError("Missing text parameter", 400);
  }

  const streamRes = await GeminiService.getSpeechStream(text);
  if (streamRes && streamRes.body) {
    const contentType = streamRes.headers.get("content-type") || "audio/wav";
    return {
      type: "stream" as const,
      body: streamRes.body,
      contentType,
    };
  }

  const audioBuffer = await GeminiService.generateSpeech(text);
  if (!audioBuffer) {
    throw new AppError("Failed to generate audio", 500);
  }

  const isWav = audioBuffer.length > 4 && audioBuffer.toString("utf8", 0, 4) === "RIFF";
  const contentType = isWav ? "audio/wav" : "audio/mpeg";

  return {
    type: "buffer" as const,
    data: new Uint8Array(audioBuffer),
    length: audioBuffer.length,
    contentType,
  };
}
