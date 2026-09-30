import { db } from "@/db";
import { callSessions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import { GeminiService } from "@/lib/gemini";
import { ragService } from "@/services/rag.service";
import crypto from "crypto";

export class VoiceCallService {
  async getInitialGreeting(
    topic: string,
    userId?: string,
    fallbackName?: string,
    forceReturning?: boolean
  ): Promise<string> {
    let studentName = fallbackName ? fallbackName.split(" ")[0] : "";
    let hasPreviousSession = Boolean(forceReturning);

    if (userId) {
      try {
        const [user] = await db
          .select({ name: users.name, memory: users.memory })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user) {
          const mem = (user as any).memory;
          if (mem?.preferredName) {
            studentName = mem.preferredName;
          } else if (!studentName && user.name) {
            studentName = user.name.split(" ")[0];
          }

          if ((mem?.totalCalls ?? 0) > 0 || (mem?.facts && mem.facts.length > 0)) {
            hasPreviousSession = true;
          }
        }
      } catch (e) {
        console.warn("Check user memory error:", e);
      }

      if (!hasPreviousSession) {
        try {
          const past = await db
            .select({ id: callSessions.id })
            .from(callSessions)
            .where(eq(callSessions.userId, userId))
            .limit(1);
          hasPreviousSession = past.length > 0;
        } catch (e) {
          console.warn("Check previous sessions error:", e);
        }
      }
    }

    if (hasPreviousSession) {
      const returningGreetings = [
        studentName
          ? `Hey ${studentName}, welcome back! Good to hear from you again. How are things with you today?`
          : `Hey, welcome back! Good to hear from you again. How are things with you today?`,
        studentName
          ? `Hi ${studentName}, welcome back! Great to connect again. How has your day been going so far?`
          : `Hi, welcome back! Great to connect again. How has your day been going so far?`,
        studentName
          ? `Hey ${studentName}! Good to hear your voice again. Ready to practice some English today?`
          : `Hey there! Good to hear your voice again. Ready to practice some English today?`,
        studentName
          ? `Good to chat with you again, ${studentName}! What have you been up to today?`
          : `Good to chat with you again! What have you been up to today?`,
      ];
      const idx = Math.floor(Math.random() * returningGreetings.length);
      return returningGreetings[idx];
    }

    if (studentName) {
      return `Hello ${studentName}! I am Mr. Khoirul, your English tutor. It is wonderful to meet you today! How are you doing?`;
    }
    return "Hello! I am Mr. Khoirul, your English tutor. It is wonderful to meet you today! How are you doing?";
  }

  async respondToTurn(
    topic: string,
    history: Array<{ role: "assistant" | "user"; content: string }>,
    studentMessage: string,
    userId?: string,
    studentCefr?: string
  ): Promise<
    ServiceResult<{
      reply: string;
      detectedLanguage: "id" | "en";
      correctedStudentMessage: string;
    }>
  > {
    try {
      // Retrieve relevant curriculum & student weakness context via MySQL RAG
      const ragContext = await ragService.buildTutorCallContext({
        topic,
        userId,
        studentCefr,
      });

      const result = await GeminiService.generateTutorCallReply(
        topic,
        history,
        studentMessage,
        ragContext
      );

      return Response.buildSuccess({
        reply: result.reply,
        detectedLanguage: result.detectedLanguage,
        correctedStudentMessage: result.correctedStudentMessage,
      });
    } catch (e) {
      console.error("VoiceCallService.respondToTurn error:", e);
      return Response.buildSuccess({
        reply: "That sounds wonderful! What do you enjoy most about that?",
        detectedLanguage: "en",
        correctedStudentMessage: studentMessage,
      });
    }
  }

  async *streamTurn(payload: {
    topic: string;
    history: Array<{ role: "assistant" | "user"; content: string }>;
    studentMessage: string;
    userId?: string;
    studentCefr?: string;
    signal?: AbortSignal;
  }): AsyncGenerator<string, void, unknown> {
    try {
      const ragContext = await ragService.buildTutorCallContext({
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
      console.error("VoiceCallService.streamTurn error:", e);
      yield "That sounds wonderful! What do you enjoy most about that?";
    }
  }

  async saveAndEvaluateSession(payload: {
    userId: string;
    moduleId?: string;
    topic: string;
    durationSeconds: number;
    transcript?: string;
    skipEvaluation?: boolean;
  }): Promise<ServiceResult<any>> {
    try {
      let realEvaluation = null;
      if (!payload.skipEvaluation) {
        try {
          const ragEvalContext = await ragService.buildEvaluationContext({
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

      const sessionId = crypto.randomUUID();
      await db.insert(callSessions).values({
        id: sessionId,
        userId: payload.userId,
        moduleId: payload.moduleId,
        topic: payload.topic,
        durationSeconds: payload.durationSeconds,
        transcript: payload.transcript,
        evaluation: realEvaluation,
        createdAt: new Date(),
      });

      // Update persistent student memory in users table
      if (payload.userId) {
        try {
          const ev = realEvaluation as any;
          const newFacts: string[] = Array.isArray(ev?.student_facts) ? ev.student_facts : [];
          const newWeaknesses: string[] = [];
          if (ev?.cefr) newWeaknesses.push(`CEFR ${ev.cefr}`);
          if (ev?.grammar && ev.grammar < 5.5) newWeaknesses.push("grammar");
          if (ev?.fluency && ev.fluency < 5.5) newWeaknesses.push("fluency");
          if (ev?.pronunciation && ev.pronunciation < 5.5) newWeaknesses.push("pronunciation");

          await ragService.updateStudentMemory(payload.userId, {
            newFacts,
            newWeaknesses,
            incrementCalls: true,
          });
        } catch (memErr) {
          console.warn("Failed to update student memory:", memErr);
        }
      }

      return Response.buildSuccessCreated({
        sessionId,
        evaluation: realEvaluation,
      });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getHistoryByUser(userId: string): Promise<ServiceResult<any>> {
    try {
      const list = await db
        .select()
        .from(callSessions)
        .where(eq(callSessions.userId, userId))
        .orderBy(desc(callSessions.createdAt));

      return Response.buildSuccess({ list });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const voiceCallService = new VoiceCallService();
