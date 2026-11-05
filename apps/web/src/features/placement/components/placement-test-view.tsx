"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Award,
  Headphones,
  PenTool,
  Mic,
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Lock,
  LogOut,
} from "lucide-react";
import { usePlacementSession, useSubmitPlacement, usePlacementStatus, useSkipBeginner } from "../hooks/use-placement";
import { useRouter } from "next/navigation";
import { PlacementCooldownView } from "./placement-cooldown-view";
import { useClasses, ClassUnlockModal } from "@/features/classes";
import Image from "next/image";
import { doLogout } from "@/app/(auth)/auth.actions";
import { PlacementWizardMobile } from "./placement-wizard-mobile";
import { PlacementDesktopForm } from "./placement-desktop-form";

interface PlacementTestViewProps {
  userId?: string;
}

export function PlacementTestView({ userId }: PlacementTestViewProps) {
  const router = useRouter();
  const { data: statusData, isLoading: isStatusLoading } = usePlacementStatus(userId);
  const skipBeginnerMutation = useSkipBeginner();
  const { data: testData, isLoading, error: loadError, refetch } = usePlacementSession();
  const submitMutation = useSubmitPlacement();

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
  const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});

  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore placement draft from localStorage if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("eddys_placement_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mcqAnswers) setMcqAnswers(parsed.mcqAnswers);
        if (parsed.listeningAnswers) setListeningAnswers(parsed.listeningAnswers);
        if (parsed.writingAnswers) setWritingAnswers(parsed.writingAnswers);
        if (parsed.speakingAnswers) setSpeakingAnswers(parsed.speakingAnswers);
      }
    } catch {}
  }, []);

  // Debounced auto-save placement draft whenever answers change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          "eddys_placement_draft",
          JSON.stringify({ mcqAnswers, listeningAnswers, writingAnswers, speakingAnswers })
        );
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [mcqAnswers, listeningAnswers, writingAnswers, speakingAnswers]);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const { data: classesData, refetch: refetchClasses } = useClasses(userId);

  const mcqs = (testData as any)?.mcqs || [];
  const listening = (testData as any)?.listening || [];
  const writing = (testData as any)?.writing || [];
  const speaking = (testData as any)?.speaking || [];
  const totalQuestions = mcqs.length + listening.length + writing.length + speaking.length || 22;

  const answeredCount =
    Object.keys(mcqAnswers).length +
    Object.keys(listeningAnswers).length +
    Object.values(writingAnswers).filter((t) => t.trim().length > 3).length +
    Object.values(speakingAnswers).filter((t) => t.trim().length > 2).length;

  const progressPercent = Math.min(100, Math.round((answeredCount / totalQuestions) * 100));

  const handleSelectOption = (type: "mcq" | "listening", questionId: string, option: string) => {
    if (type === "mcq") {
      setMcqAnswers((prev) => ({ ...prev, [questionId]: option }));
    } else {
      setListeningAnswers((prev) => ({ ...prev, [questionId]: option }));
    }
  };

  const handleWritingChange = (questionId: string, text: string) => {
    setWritingAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSpeakingTranscript = (questionId: string, transcript: string) => {
    setSpeakingAnswers((prev) => ({ ...prev, [questionId]: transcript }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (answeredCount < 5) {
      setErrorMsg("Mohon jawab minimal 5 pertanyaan sebelum mengirim tes penilaian.");
      return;
    }

    try {
      const data = await submitMutation.mutateAsync({
        userId: userId || "anonymous",
        mcqAnswers,
        listeningAnswers,
        writingAnswers,
        speakingAnswers,
      });
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("eddys_placement_draft");
        } catch {}
      }
    } catch (err: any) {
      const isAuthError =
        err?.message?.toLowerCase().includes("autentikasi") ||
        err?.message?.includes("401");
      setErrorMsg(
        isAuthError
          ? "Sesi autentikasi Anda telah berakhir. Jawaban Anda tetap tersimpan otomatis! Silakan login kembali di tab baru lalu kirim ulang penilaian ini."
          : err?.message || "Failed to submit placement test."
      );
    }
  };

  const handleSkipBeginner = async () => {
    try {
      await skipBeginnerMutation.mutateAsync();
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memilih level A1.");
    }
  };

  if (isStatusLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 border-b-4 border-b-slate-300 shadow-sm flex items-center justify-center mx-auto text-primary">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (statusData?.isInCooldown && !statusData?.isAdmin) {
    return <PlacementCooldownView status={statusData} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 border-b-4 border-b-slate-300 shadow-sm flex items-center justify-center mx-auto text-primary">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <div>
            <p className="font-heading text-base font-bold text-primary">
              Preparing Placement Assessment...
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Generating 22 diagnostic questions across 4 core skills.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-rose-200 border-b-4 border-b-rose-300 shadow-sm text-center p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-rose-950">
              Failed to Load Assessment
            </h3>
            <p className="text-xs text-rose-700 mt-1">
              {String(loadError?.message || loadError)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 border-b-3 border-b-slate-400 active:border-b active:translate-y-0.5 transition-all"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Result Screen (Skeuomorphic Certificate Card)
  if (result) {
    const skills = result.skills || {};
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F4F6FF]">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 border-b-6 border-b-slate-300 shadow-md text-center p-6 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 border-b-4 border-b-amber-400 text-secondary flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-9 h-9 text-secondary" />
          </div>

          <div className="space-y-1">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Placement Assessment Results
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary pt-2">
              Assessed CEFR Level: <span className="text-secondary">{result.overallCefr}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Final Score: <span className="font-bold text-primary">{result.scorePercent}%</span>
            </p>
          </div>

          {/* 4 Skill Tactile Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                MCQ (30%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.mcqScore ?? result.mcqScore ?? 0}%
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-purple-600" />
                Listening (25%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.listeningScore ?? 0}%
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                Writing (25%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.writingScore ?? result.writingScore ?? 0}%
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200 border-b-3 border-b-slate-300">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-secondary" />
                Speaking (20%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.speakingScore ?? result.speakingScore ?? 0}%
              </p>
            </div>
          </div>

          {/* Mr. Khoirul AI Notes */}
          {(result.writingEvaluation?.feedback_id || result.speakingEvaluation?.feedback_id) && (
            <div className="text-left p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-secondary" />
                Evaluation Feedback:
              </p>
              {result.writingEvaluation?.feedback_id && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Writing:</strong> {result.writingEvaluation.feedback_id}
                </p>
              )}
              {result.speakingEvaluation?.feedback_id && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Speaking:</strong> {result.speakingEvaluation.feedback_id}
                </p>
              )}
            </div>
          )}

          {(() => {
            const baseCefr = (result.overallCefr || "A1").toUpperCase().slice(0, 2);
            const targetClass = classesData?.find((c) => c.cefr.toUpperCase() === baseCefr);
            const hasAccess = targetClass?.hasAccess ?? false;

            const formatRupiah = (num: number) =>
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(num);

            if (!hasAccess && targetClass) {
              return (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 text-left space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                        Unlock Class Access
                      </span>
                      <span className="font-heading text-lg font-black text-indigo-950">
                        {formatRupiah(targetClass.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      To begin learning <strong>{result.overallCefr}</strong> coursework and unlock full curriculum modules, please activate your class package below.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setIsUnlockModalOpen(true)}
                      className="flex-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm border-b-4 border-b-indigo-800 active:border-b-0 active:translate-y-1 shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Unlock Class {baseCefr} ({formatRupiah(targetClass.price)})
                    </button>
                    <Link href="/dashboard" className="flex-1">
                      <button
                        type="button"
                        className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 border-b-4 border-b-slate-400 active:border-b-0 active:translate-y-1 transition-all"
                      >
                        Dashboard
                      </button>
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/modules" className="flex-1">
                  <button
                    type="button"
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-[#0c2b48] text-white font-bold text-sm border-b-4 border-b-[#07192b] active:border-b-0 active:translate-y-1 shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    Start Learning Level {result.overallCefr}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <button
                    type="button"
                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 border-b-4 border-b-slate-400 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    Dashboard
                  </button>
                </Link>
              </div>
            );
          })()}

          {/* Modal Unlock Kelas */}
          {(() => {
            const baseCefr = (result.overallCefr || "A1").toUpperCase().slice(0, 2);
            const targetClass = classesData?.find((c) => c.cefr.toUpperCase() === baseCefr);
            return (
              <ClassUnlockModal
                isOpen={isUnlockModalOpen}
                onClose={() => setIsUnlockModalOpen(false)}
                classItem={targetClass || null}
                userId={userId || ""}
                onSuccess={() => refetchClasses()}
              />
            );
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FF] text-slate-800 antialiased flex flex-col">
      {/* Top Focused Exam Bar (No Sidebar, No Navigation to Dashboard) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-academy.webp"
              alt="EDDY'S AI Academy"
              width={130}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Mandatory Placement Assessment
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {answeredCount}/{totalQuestions} Answered
            </span>
            <form action={doLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">
        {/* Fast-Track Option for Absolute Beginners */}
        {!statusData?.lastResult && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                Jalur Cepat Pemula
              </span>
              <p className="text-xs text-slate-700 font-medium">
                Belum pernah belajar bahasa Inggris sama sekali? Kamu bisa lewati tes diagnostik ini dan langsung mulai dari level dasar.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkipBeginner}
              disabled={skipBeginnerMutation.isPending}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs border border-blue-300 border-b-3 border-b-blue-400 active:border-b active:translate-y-0.5 transition-all shadow-xs shrink-0 cursor-pointer text-center"
            >
              {skipBeginnerMutation.isPending ? "Menyiapkan A1..." : "Mulai dari Nol (Level A1)"}
            </button>
          </div>
        )}
        {/* Mobile View: 1-Question-at-a-time Wizard */}
        <div className="block sm:hidden">
          <div className="mb-4">
            <h1 className="font-heading text-xl font-extrabold text-primary">
              CEFR Placement Assessment
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Answer the questions based on your current English proficiency.
            </p>
          </div>
          <PlacementWizardMobile
            mcqs={mcqs}
            listening={listening}
            writing={writing}
            speaking={speaking}
            mcqAnswers={mcqAnswers}
            listeningAnswers={listeningAnswers}
            writingAnswers={writingAnswers}
            speakingAnswers={speakingAnswers}
            onSelectOption={handleSelectOption}
            onWritingChange={handleWritingChange}
            onSpeakingTranscript={handleSpeakingTranscript}
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
            errorMsg={errorMsg}
          />
        </div>

        {/* Desktop View: Full Sections Form */}
        <div className="hidden sm:block">
          {/* Test Paper Header */}
          <div className="mb-6 space-y-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
              English Placement Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Answer the questions below based on your current English proficiency.
            </p>

            {/* Tactile Progress Indicator */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
                <span>Progress:</span>
                <span className="font-bold text-primary">
                  {answeredCount} / {totalQuestions} Completed
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-300 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <PlacementDesktopForm
            mcqs={mcqs}
            listening={listening}
            writing={writing}
            speaking={speaking}
            mcqAnswers={mcqAnswers}
            listeningAnswers={listeningAnswers}
            writingAnswers={writingAnswers}
            speakingAnswers={speakingAnswers}
            onSelectOption={handleSelectOption}
            onWritingChange={handleWritingChange}
            onSpeakingTranscript={handleSpeakingTranscript}
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
            errorMsg={errorMsg}
          />
        </div>
      </main>
    </div>
  );
}
