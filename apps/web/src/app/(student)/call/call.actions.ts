"use server";

import { voiceCallService } from "@/services/voice-call.service";
import { getSession } from "@/lib/session";

export async function getCallInitialGreeting(topic: string, hasCalledBeforeClient: boolean = false) {
  try {
    const session = await getSession();
    const studentName = session?.name ? session.name.split(" ")[0] : "";
    const userId = session?.userId;

    const queryParams = new URLSearchParams({
      topic,
      ...(userId ? { userId } : {}),
      ...(studentName ? { name: studentName } : {}),
      ...(hasCalledBeforeClient ? { hasCalledBefore: "true" } : {}),
    });

    try {
      const res = await fetch(`http://localhost:3001/api/voice/initial-greeting?${queryParams.toString()}`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          greeting: data.greeting,
          studentName,
        };
      }
    } catch {}

    const greeting = await voiceCallService.getInitialGreeting(
      topic,
      userId,
      studentName,
      hasCalledBeforeClient
    );

    return {
      success: true,
      greeting,
      studentName,
    };
  } catch (err: any) {
    console.error("getCallInitialGreeting error:", err);
    return {
      success: true,
      greeting: "Hey there! Good to hear your voice again. Ready to practice some English today?",
      studentName: "",
    };
  }
}

export async function respondToCallTurn(payload: {
  topic: string;
  history: Array<{ role: "assistant" | "user"; content: string }>;
  studentMessage: string;
}) {
  try {
    const session = await getSession();
    const result = await voiceCallService.respondToTurn(
      payload.topic,
      payload.history,
      payload.studentMessage,
      session?.userId,
      session?.currentCefr
    );

    if (result.success) {
      return {
        success: true,
        reply: result.data.reply,
        detectedLanguage: result.data.detectedLanguage,
        correctedStudentMessage: result.data.correctedStudentMessage,
      };
    }

    return {
      success: true,
      reply: "That's wonderful! Could you tell me a little bit more about that?",
      detectedLanguage: "en" as const,
      correctedStudentMessage: payload.studentMessage,
    };
  } catch (err: any) {
    console.error("respondToCallTurn error:", err);
    return {
      success: true,
      reply: "That's wonderful! Could you tell me a little bit more about that?",
      detectedLanguage: "en" as const,
      correctedStudentMessage: payload.studentMessage,
    };
  }
}

export async function processAndSaveCallSession(payload: {
  topic: string;
  durationSeconds: number;
  transcript: string;
  moduleId?: string;
}) {
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    return {
      success: false,
      message: "Silakan login terlebih dahulu untuk menyimpan sesi latihan.",
      data: null,
    };
  }

  try {
    const res = await fetch("http://localhost:3001/api/voice/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        userId,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        return {
          success: true,
          message: "Sesi percakapan berhasil disimpan dan dievaluasi.",
          data: {
            sessionId: result.data.sessionId,
            evaluation: result.data.evaluation,
          },
        };
      }
    }

    const result = await voiceCallService.saveAndEvaluateSession({
      ...payload,
      userId,
    });

    if (result.success) {
      return {
        success: true,
        message: "Sesi percakapan berhasil disimpan dan dievaluasi.",
        data: {
          sessionId: result.data.sessionId,
          evaluation: result.data.evaluation,
        },
      };
    }

    return {
      success: false,
      message: result.message || "Gagal memproses evaluasi percakapan.",
      data: null,
    };
  } catch (err: any) {
    console.error("Call evaluation error:", err);
    return {
      success: false,
      message: "Gagal memproses evaluasi percakapan.",
      data: null,
    };
  }
}
