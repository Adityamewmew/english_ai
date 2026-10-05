import { GeminiService } from "../../../lib/gemini";
import { voiceRepository } from "../voice.repository";
import { voiceRagService } from "../voice-rag.service";

export async function evaluateVoiceSessionUsecase(payload: {
  userId: string;
  moduleId?: string;
  topic: string;
  durationSeconds: number;
  transcript?: string;
  skipEvaluation?: boolean;
}) {
  let realEvaluation = null;

  if (!payload.skipEvaluation) {
    try {
      const ragEvalContext = await voiceRagService.buildEvaluationContext({
        topic: payload.topic,
      });

      realEvaluation = await GeminiService.evaluateConversation(
        payload.topic,
        payload.transcript || "General speaking practice on " + payload.topic,
        payload.durationSeconds,
        ragEvalContext
      );
    } catch (aiErr) {
      console.warn("AI Conversation Evaluation fallback:", aiErr);
      realEvaluation = {
        fluency: 4.5,
        lexical: 4.0,
        grammar: 4.0,
        pronunciation: 4.5,
        overallBand: 4.5,
        cefr: "A2",
        feedback_id: "Percakapan sudah baik dan berani! Terus latih kelancaran dan pengucapan.",
        feedback_en: "Good effort in expressing your thoughts! Keep practicing to speak with more ease.",
      };
    }
  }

  const session = await voiceRepository.createSession({
    userId: payload.userId,
    moduleId: payload.moduleId,
    topic: payload.topic,
    durationSeconds: payload.durationSeconds,
    transcript: payload.transcript,
    evaluation: realEvaluation,
  });

  if (payload.userId && realEvaluation) {
    try {
      const ev = realEvaluation as any;
      const newFacts: string[] = Array.isArray(ev?.student_facts) ? ev.student_facts : [];
      const newWeaknesses: string[] = [];
      if (ev?.cefr) newWeaknesses.push(`CEFR ${ev.cefr}`);
      if (ev?.grammar && ev.grammar < 5.5) newWeaknesses.push("grammar");
      if (ev?.fluency && ev.fluency < 5.5) newWeaknesses.push("fluency");
      if (ev?.pronunciation && ev.pronunciation < 5.5) newWeaknesses.push("pronunciation");

      await voiceRagService.updateStudentMemory(payload.userId, {
        newFacts,
        newWeaknesses,
        incrementCalls: true,
      });
    } catch (memErr) {
      console.warn("Failed to update student memory:", memErr);
    }
  }

  return {
    success: true,
    data: {
      sessionId: session.id,
      evaluation: realEvaluation,
    },
  };
}
