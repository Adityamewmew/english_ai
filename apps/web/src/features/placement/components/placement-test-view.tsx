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
} from "lucide-react";
import { usePlacementSession, useSubmitPlacement } from "../hooks/use-placement";

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

  const handleSelectOption = (
    type: "mcq" | "listening",
    questionId: string,
    option: string
  ) => {
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-primary">Menyiapkan paket tes penempatan unikmu...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-2xl border border-red-200 max-w-md">
          <p className="font-bold text-base mb-1">Gagal memuat tes penempatan</p>
          <p className="text-xs text-slate-600 mb-4">{String(loadError?.message || loadError)}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Muat Ulang
          </Button>
        </div>
      </div>
    );
  }

  // Result Celebration Screen
  if (result) {
    const skills = result.skills || {};
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface py-12">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
            <Award className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Hasil Tes Penempatan CEFR
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-1">
              Level Kamu: <span className="text-secondary">{result.overallCefr}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Skor Komposit: {result.scorePercent}%
            </p>
          </div>

          {/* 4 Skill Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="bg-surface p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                MCQ (30%)
              </span>
              <p className="text-lg font-bold text-primary mt-1">
                {skills.mcqScore ?? result.mcqScore ?? 0}%
              </p>
            </div>

            <div className="bg-surface p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-purple-500" />
                Listening (25%)
              </span>
              <p className="text-lg font-bold text-primary mt-1">
                {skills.listeningScore ?? 0}%
              </p>
            </div>

            <div className="bg-surface p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-emerald-500" />
                Writing (25%)
              </span>
              <p className="text-lg font-bold text-primary mt-1">
                {skills.writingScore ?? result.writingScore ?? 0}%
              </p>
            </div>

            <div className="bg-surface p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-amber-500" />
                Speaking (20%)
              </span>
              <p className="text-lg font-bold text-primary mt-1">
                {skills.speakingScore ?? result.speakingScore ?? 0}%
              </p>
            </div>
          </div>

          {/* Mr. Khoirul AI Notes */}
          {(result.writingEvaluation?.feedback_id || result.speakingEvaluation?.feedback_id) && (
            <div className="text-left p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-2">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-secondary" />
                Catatan Evaluasi Mr. Khoirul:
              </p>
              {result.writingEvaluation?.feedback_id && (
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Writing:</strong> {result.writingEvaluation.feedback_id}
                </p>
              )}
              {result.speakingEvaluation?.feedback_id && (
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Speaking:</strong> {result.speakingEvaluation.feedback_id}
                </p>
              )}
            </div>
          )}

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            Kurikulum materi dan modul belajar kamu otomatis disesuaikan dengan tingkat <strong>{result.overallCefr}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/curriculum" className="flex-1">
              <Button variant="primary" size="lg" className="w-full font-bold">
                Mulai Belajar Kurikulum {result.overallCefr}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" className="w-full font-semibold">
                Buka Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mcqs = (testData as any)?.mcqs || [];
  const listening = (testData as any)?.listening || [];
  const writing = (testData as any)?.writing || [];
  const speaking = (testData as any)?.speaking || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tes Penempatan Komprehensif CEFR</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
          Ukur Kemampuan Bahasa Inggrismu
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Total 22 soal mencakup 4 keahlian: 10 Tata Bahasa &amp; Kosakata, 5 Listening, 5 Writing, dan 2 Speaking. Jawab sebaik mungkin tanpa terburu-buru.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: 10 MCQ */}
        {mcqs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Bagian 1: Tata Bahasa &amp; Kosakata (10 Soal)
              </h2>
            </div>

            {mcqs.map((q: any, idx: number) => (
              <div key={q.id} className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{q.question}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                  {(q.options || []).map((opt: string) => {
                    const isSelected = mcqAnswers[q.id] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSelectOption("mcq", q.id, opt)}
                        className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium border transition-all min-h-[44px] touch-manipulation flex items-center justify-between ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm font-bold"
                            : "bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 2: 5 Listening */}
        {listening.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <Headphones className="w-4 h-4 text-purple-600" />
                Bagian 2: Pemahaman Mendengarkan / Listening (5 Soal)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dengarkan klip audio lalu pilih jawaban yang paling tepat.
              </p>
            </div>

            {listening.map((l: any, idx: number) => (
              <div key={l.id} className="space-y-3 pt-3 border-t first:border-t-0">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-purple-600 mt-0.5">{idx + 1}.</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{l.question}</p>
                </div>

                <div className="pl-5">
                  <AudioPlayer
                    audioUrl={l.audioUrl}
                    audioScript={l.audioScript}
                    title={`Audio Klip Soal ${idx + 1}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 pt-2">
                  {(l.options || []).map((opt: string) => {
                    const isSelected = listeningAnswers[l.id] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSelectOption("listening", l.id, opt)}
                        className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium border transition-all min-h-[44px] touch-manipulation flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm font-bold"
                            : "bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 3: 5 Writing */}
        {writing.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-600" />
                Bagian 3: Keterampilan Menulis / Writing (5 Soal)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tuliskan tanggapan singkat dalam Bahasa Inggris sesuai instruksi setiap soal.
              </p>
            </div>

            {writing.map((w: any, idx: number) => (
              <div key={w.id} className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-emerald-600 mt-0.5">{idx + 1}.</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{w.question}</p>
                </div>

                <div className="pl-5">
                  <textarea
                    rows={3}
                    value={writingAnswers[w.id] || ""}
                    onChange={(e) => handleWritingChange(w.id, e.target.value)}
                    placeholder="Ketik jawabanmu di sini dalam Bahasa Inggris..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all font-normal"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Target: 2 - 5 kalimat</span>
                    <span>{(writingAnswers[w.id] || "").split(/\s+/).filter(Boolean).length} kata</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 4: 2 Speaking */}
        {speaking.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-500" />
                Bagian 4: Keterampilan Berbicara / Speaking (2 Soal)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik tombol rekam, ucapkan jawabanmu dengan suara jelas, lalu klik selesai rekam.
              </p>
            </div>

            {speaking.map((s: any, idx: number) => (
              <div key={s.id} className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-amber-600 mt-0.5">{idx + 1}.</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.question}</p>
                </div>

                <div className="pl-5">
                  <SpeakingRecorder
                    onTranscriptChange={(transcript) => handleSpeakingTranscript(s.id, transcript)}
                  />
                  {speakingAnswers[s.id] && (
                    <div className="mt-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                        Transkrip Rekaman:
                      </span>
                      <p className="italic text-slate-700 dark:text-slate-300 text-xs">
                        &quot;{speakingAnswers[s.id]}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-4 space-y-3">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold max-w-md mx-auto">
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            disabled={submitMutation.isPending}
            className="w-full md:w-auto min-w-[260px] min-h-[50px] touch-manipulation text-sm font-bold shadow-md"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis Jawaban &amp; CEFR...
              </span>
            ) : (
              "Kirim & Dapatkan Hasil Level CEFR"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
