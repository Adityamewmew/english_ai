import { GeminiService } from "../../../lib/gemini";
import { voiceRagService } from "../voice-rag.service";

export async function* streamVoiceTurnUsecase(payload: {
  topic: string;
  history: Array<{ role: "assistant" | "user"; content: string }>;
  studentMessage: string;
  userId?: string;
  studentCefr?: string;
  signal?: AbortSignal;
}): AsyncGenerator<string, void, unknown> {
  try {
    const ragContext = await voiceRagService.buildTutorCallContext({
      topic: payload.topic,
      userId: payload.userId,
      studentCefr: payload.studentCefr,
    });

    for await (const sentence of GeminiService.streamTutorSentences(
      payload.topic,
      payload.history,
      payload.studentMessage,
      ragContext,
      payload.signal
    )) {
      yield sentence;
    }
  } catch (e) {
    console.error("streamVoiceTurnUsecase error:", e);
    yield "That sounds wonderful! What do you enjoy most about that?";
  }
}
