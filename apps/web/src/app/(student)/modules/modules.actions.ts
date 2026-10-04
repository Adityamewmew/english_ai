"use server";

import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:3003";

export interface SubmitQuizResponse {
  success: boolean;
  data?: {
    moduleId: string;
    score: number;
    quizScore?: number;
    speakingScore?: number | null;
    passed: boolean;
    results: any[];
  };
  error?: string;
}

export async function submitModuleQuizAction(
  moduleId: string,
  answers: Record<string, number>,
  speakingScore?: number
): Promise<SubmitQuizResponse> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Sesi telah berakhir, silakan login kembali" };
    }

    const res = await fetch(`${API_URL}/api/curriculum/modules/${moduleId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        answers,
        speakingScore,
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (json.success) {
      // Revalidate daftar modul & dashboard agar status berubah ke "completed / selesai" seketika
      revalidatePath("/modules");
      revalidatePath("/dashboard");
      revalidatePath(`/modules/${moduleId}`);
      return { success: true, data: json.data };
    }

    return { success: false, error: json.error || "Gagal menyimpan hasil kuis" };
  } catch (err: any) {
    console.error("submitModuleQuizAction error:", err);
    return { success: false, error: err.message || "Terjadi kesalahan server" };
  }
}

export async function getModuleDetailAction(moduleId: string) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    const res = await fetch(
      `${API_URL}/api/curriculum/modules/${moduleId}?userId=${session.userId}`,
      { cache: "no-store" }
    );
    const json = await res.json();

    return {
      success: json.success,
      data: json.data,
      user: {
        id: session.userId,
        name: session.name,
      },
    };
  } catch (err: any) {
    console.error("getModuleDetailAction error:", err);
    return { success: false, error: err.message || "Gagal memuat detail modul" };
  }
}

export interface StepProgressPayload {
  currentStep: number;
  unlockedStep: number;
  completedSteps: number[];
  isPracticeUnlocked: boolean;
  isSpeakingComplete?: boolean;
}

export async function saveModuleStepProgressAction(
  moduleId: string,
  progress: StepProgressPayload
) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${API_URL}/api/curriculum/modules/${moduleId}/step-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.userId,
        ...progress,
      }),
      cache: "no-store",
    });

    const json = await res.json();
    return { success: json.success, data: json.data };
  } catch (err: any) {
    console.error("saveModuleStepProgressAction error:", err);
    return { success: false, error: err.message };
  }
}

