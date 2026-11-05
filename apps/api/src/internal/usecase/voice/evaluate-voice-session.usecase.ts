import { AiService } from "../../../lib/ai";
import { voiceRepository } from "../../repository/voice_repository";
import { voiceRagService } from "./voice-rag.service";
import { aiUsageRepository } from "../../repository/ai_usage_repository";
import { ForbiddenError } from "../../../common/errors/app-error";

export async function evaluateVoiceSessionUsecase(payload: {
  sessionId?: string;
  userId: string;
  moduleId?: string;
  topic: string;
  durationSeconds: number;
  transcript?: string;
  sttProvider?: string;
  skipEvaluation?: boolean;
}) {
  let existingSession = null;
  if (payload.sessionId) {
    existingSession = await voiceRepository.findById(payload.sessionId);
    if (existingSession && existingSession.userId !== payload.userId) {
      throw new ForbiddenError("Akses sesi ditolak. Sesi panggilan ini bukan milik akun Anda.");
    }
  }

  // Calculate server-verified duration to prevent client-side duration spoofing (SEC-01)
  let trustedDuration = Math.max(0, payload.durationSeconds);
  if (existingSession && existingSession.createdAt) {
    const serverElapsed = Math.floor((Date.now() - new Date(existingSession.createdAt).getTime()) / 1000);
    if (serverElapsed >= 5 && trustedDuration < serverElapsed - 15) {
      trustedDuration = serverElapsed;
    }
  }

  // Lock daily voice duration immediately in PostgreSQL before running 4-8s AI evaluation
  if (payload.userId && payload.userId !== "anonymous" && trustedDuration > 0) {
    await aiUsageRepository.recordVoiceDuration(payload.userId, trustedDuration).catch(() => {});
  }

  let resolvedTranscript = payload.transcript || "";
  if (existingSession && !resolvedTranscript && existingSession.transcript) {
    resolvedTranscript = existingSession.transcript;
  }

  let realEvaluation = null;

  if (!payload.skipEvaluation) {
    // Short-circuit: skip LLM evaluation if call is trivial (<10s or empty transcript) to save tokens (SEC-04 / Ponytail)
    if (trustedDuration < 10 || !resolvedTranscript || resolvedTranscript.trim().length < 15) {
      realEvaluation = {
        fluency: 4.0,
        lexical: 4.0,
        grammar: 4.0,
        pronunciation: 4.0,
        overallBand: 4.0,
        cefr: "A2",
        feedback_id: "Sesi latihan singkat telah selesai. Terus berlatih berbicara bahasa Inggris ya!",
        feedback_en: "Short practice session completed. Keep practicing your spoken English!",
      };
    } else {
      try {
        const ragEvalContext = await voiceRagService.buildEvaluationContext({
          topic: payload.topic,
        });

        realEvaluation = await AiService.evaluateConversation(
          payload.topic,
          resolvedTranscript,
          trustedDuration,
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
  }

  let returnSessionId = payload.sessionId;

  if (existingSession) {
    await voiceRepository.completeSession(
      existingSession.id,
      trustedDuration,
      realEvaluation
    );
  } else {
    const session = await voiceRepository.createSession({
      userId: payload.userId,
      moduleId: payload.moduleId,
      topic: payload.topic,
      sttProvider: payload.sttProvider || "web-speech",
    });
    returnSessionId = session.id;
    await voiceRepository.completeSession(
      session.id,
      trustedDuration,
      realEvaluation
    );
  }

  if (payload.userId && realEvaluation && payload.userId !== "anonymous") {
    try {
      const ev = realEvaluation as any;
      const newFacts: string[] = Array.isArray(ev?.student_facts) ? ev.student_facts : [];
      const newInterests: string[] = Array.isArray(ev?.student_interests) ? ev.student_interests : [];
      const newWeaknesses: string[] = [];
      if (Array.isArray(ev?.student_weaknesses)) {
        newWeaknesses.push(...ev.student_weaknesses);
      }
      if (ev?.cefr) newWeaknesses.push(`CEFR ${ev.cefr}`);
      if (ev?.grammar && ev.grammar < 5.5) newWeaknesses.push("grammar");
      if (ev?.fluency && ev.fluency < 5.5) newWeaknesses.push("fluency");
      if (ev?.pronunciation && ev.pronunciation < 5.5) newWeaknesses.push("pronunciation");

      await voiceRagService.updateStudentMemory(payload.userId, {
        newFacts,
        newInterests,
        newWeaknesses,
        incrementCalls: true,
      });
    } catch (memErr) {
      console.warn("Failed to update student memory:", memErr);
    }
  }

  return {
    sessionId: returnSessionId,
    evaluation: realEvaluation,
  };
}

/**
 * Server-side finalizer for calls interrupted by browser close or network disconnect
 */
export async function finalizeAbandonedVoiceSessions(minutesOld = 5, limit = 3) {
  try {
    const abandoned = await voiceRepository.findAbandonedActiveSessions(minutesOld, limit);
    for (const session of abandoned) {
      if (session.transcript && session.transcript.trim()) {
        const ragEvalContext = await voiceRagService.buildEvaluationContext({
          topic: session.topic,
        });
        const evalResult = await AiService.evaluateConversation(
          session.topic,
          session.transcript,
          session.durationSeconds || 60,
          ragEvalContext
        ).catch(() => null);

        await voiceRepository.completeSession(
          session.id,
          session.durationSeconds || 60,
          evalResult || {
            overallBand: 4.0,
            cefr: "A1",
            feedback_id: "Sesi terputus. Tetap semangat berlatih!",
            feedback_en: "Call disconnected. Keep practicing!",
          }
        );
      } else {
        await voiceRepository.abandonSession(session.id);
      }
    }
  } catch (err) {
    console.warn("finalizeAbandonedVoiceSessions error:", err);
  }
}
