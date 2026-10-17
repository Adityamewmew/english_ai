"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { SpeakingRecorder } from "@/components/audio/SpeakingRecorder";
import {
  CheckCircle2,
  ArrowRight,
  Award,
  Headphones,
  PenTool,
  Mic,
  MessageSquare,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { usePlacementSession, useSubmitPlacement } from "../hooks/use-placement";
import { StudentShell } from "@/features/dashboard";

interface PlacementTestViewProps {
  userId?: string;
}

export function PlacementTestView({ userId }: PlacementTestViewProps) {
  const { data: testData, isLoading, error: loadError, refetch } = usePlacementSession();
  const submitMutation = useSubmitPlacement();

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
  const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});

  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengirim tes penempatan.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 border-b-4 border-b-slate-300 shadow-sm flex items-center justify-center mx-auto text-primary">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <div>
            <p className="font-heading text-base font-bold text-primary">
              Menyiapkan Lembar Tes...
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Mengacak 22 soal diagnostik.
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
              Gagal Memuat Tes
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
            Muat Ulang
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
              Hasil Tes Penempatan
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary pt-2">
              Level Kamu: <span className="text-secondary">{result.overallCefr}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Skor Akhir: <span className="font-bold text-primary">{result.scorePercent}%</span>
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
                Catatan Evaluasi:
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/curriculum" className="flex-1">
              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-[#0c2b48] text-white font-bold text-sm border-b-4 border-b-[#07192b] active:border-b-0 active:translate-y-1 shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                Mulai Belajar Level {result.overallCefr}
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
        </div>
      </div>
    );
  }

  return (
    <StudentShell>
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Test Paper Header */}
      <div className="mb-6 space-y-1.5">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Tes Penempatan Bahasa Inggris
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Jawab pertanyaan di bawah sesuai kemampuanmu saat ini.
        </p>

        {/* Tactile Progress Indicator */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
            <span>Progres:</span>
            <span className="font-bold text-primary">
              {answeredCount} / {totalQuestions} selesai
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Grammar & Vocabulary (10 MCQ) */}
        {mcqs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="font-heading text-base font-bold text-primary">
                1. Grammar &amp; Vocabulary
              </h2>
            </div>

            <div className="space-y-6">
              {mcqs.map((q: any, idx: number) => (
                <div key={q.id} className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-400 mt-0.5 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {q.question}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    {(q.options || []).map((opt: string) => {
                      const isSelected = mcqAnswers[q.id] === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleSelectOption("mcq", q.id, opt)}
                          className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px] flex items-center justify-between ${
                            isSelected
                              ? "bg-primary text-white border-2 border-primary border-b-4 border-b-[#081f34] shadow-xs font-bold translate-y-0.5"
                              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 border-b-3 border-b-slate-300 active:border-b active:translate-y-0.5"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Listening (5 Soal) */}
        {listening.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                <Headphones className="w-4 h-4" />
              </div>
              <h2 className="font-heading text-base font-bold text-primary">
                2. Listening
              </h2>
            </div>

            <div className="space-y-8">
              {listening.map((l: any, idx: number) => (
                <div key={l.id} className="space-y-3 pt-3 border-t first:border-t-0 first:pt-0">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-purple-700 mt-0.5 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {l.question}
                    </p>
                  </div>

                  <div className="pl-7">
                    <AudioPlayer
                      audioUrl={l.audioUrl}
                      audioScript={l.audioScript}
                      title={`Audio #${idx + 1}`}
                      hideTranscript={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
                    {(l.options || []).map((opt: string) => {
                      const isSelected = listeningAnswers[l.id] === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => handleSelectOption("listening", l.id, opt)}
                          className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px] flex items-center justify-between ${
                            isSelected
                              ? "bg-primary text-white border-2 border-primary border-b-4 border-b-[#081f34] shadow-xs font-bold translate-y-0.5"
                              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 border-b-3 border-b-slate-300 active:border-b active:translate-y-0.5"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Writing (5 Soal) */}
        {writing.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <PenTool className="w-4 h-4" />
              </div>
              <h2 className="font-heading text-base font-bold text-primary">
                3. Writing
              </h2>
            </div>

            <div className="space-y-6">
              {writing.map((w: any, idx: number) => {
                const words = (writingAnswers[w.id] || "").split(/\s+/).filter(Boolean).length;
                return (
                  <div key={w.id} className="space-y-2 pt-1">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-emerald-700 mt-0.5 min-w-[20px]">
                        {idx + 1}.
                      </span>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {w.question}
                      </p>
                    </div>

                    <div className="pl-7 space-y-1">
                      <textarea
                        rows={3}
                        value={writingAnswers[w.id] || ""}
                        onChange={(e) => handleWritingChange(w.id, e.target.value)}
                        placeholder="Tulis jawaban dalam bahasa Inggris di sini..."
                        className="w-full p-3.5 rounded-xl border border-slate-200 border-b-2 border-b-slate-300 bg-[#FBFBFE] focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600 transition-all font-normal shadow-inner"
                      />
                      <div className="text-right text-[10px] text-slate-400">
                        {words} kata
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Speaking (2 Soal) */}
        {speaking.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-secondary flex items-center justify-center font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <h2 className="font-heading text-base font-bold text-primary">
                4. Speaking
              </h2>
            </div>

            <div className="space-y-6">
              {speaking.map((s: any, idx: number) => (
                <div key={s.id} className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-secondary mt-0.5 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {s.question}
                    </p>
                  </div>

                  <div className="pl-7">
                    <SpeakingRecorder
                      onTranscriptChange={(transcript) => handleSpeakingTranscript(s.id, transcript)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button (Tactile Action) */}
        <div className="text-center pt-2 pb-8 space-y-3">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold max-w-md mx-auto">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full sm:w-auto min-w-[280px] min-h-[52px] px-8 py-3.5 bg-secondary hover:bg-[#d4720e] text-white rounded-2xl text-sm font-extrabold border-b-4 border-b-[#a85507] active:border-b-0 active:translate-y-1 shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Mengevaluasi...
              </span>
            ) : (
              "Kirim Jawaban & Selesaikan Tes"
            )}
          </button>
        </div>
      </form>
    </div>
    </StudentShell>
  );
}
