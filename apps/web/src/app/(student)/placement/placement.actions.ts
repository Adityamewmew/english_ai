"use server";

import { getSession } from "@/lib/session";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function getDynamicPlacementTest() {
  try {
    const res = await fetch(`${API_URL}/api/placement/session`, {
      cache: "no-store",
    });
    return await res.json();
  } catch (err: any) {
    console.error("getDynamicPlacementTest error:", err);
    return { success: false, message: err.message };
  }
}

export async function transcribeSpeakingAudio(formData: FormData) {
  try {
    const audioFile = formData.get("audio") as File;
    if (!audioFile) {
      return { success: false, transcript: "" };
    }

    const bytes = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(bytes).toString("base64");
    const mimeType = audioFile.type || "audio/webm";

    const res = await fetch(`${API_URL}/api/placement/transcribe-speaking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64: base64Audio, mimeType }),
    });

    const result = await res.json();
    return {
      success: result.success,
      transcript: result.success ? result.data : "",
    };
  } catch (err: any) {
    console.error("transcribeSpeakingAudio error:", err);
    return { success: false, error: err.message, transcript: "" };
  }
}

export async function submitPlacementTest(formData: FormData) {
  try {
    const session = await getSession();
    const userId = session?.userId || "anonymous";

    const answersJson = formData.get("answers") as string;
    const writingText = formData.get("writingText") as string;
    const speakingTranscript = formData.get("speakingTranscript") as string;

    let mcqAnswers: Record<string, string> = {};
    try {
      mcqAnswers = JSON.parse(answersJson);
    } catch {
      mcqAnswers = {};
    }

    const res = await fetch(`${API_URL}/api/placement/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        mcqAnswers,
        writingText,
        speakingTranscript,
      }),
    });

    return await res.json();
  } catch (err: any) {
    console.error("submitPlacementTest error:", err);
    return { success: false, message: err.message };
  }
}
