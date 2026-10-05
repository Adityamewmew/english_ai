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
  Sparkles,
  Mic,
  CheckCircle,
  MessageSquare,
  Info,
  Loader2,
} from "lucide-react";
import { usePlacementSession, useSubmitPlacement } from "../hooks/use-placement";

interface PlacementTestViewProps {
  userId?: string;
}

export function PlacementTestView({ userId }: PlacementTestViewProps) {
  const { data: testData, isLoading, error: loadError } = usePlacementSession();
  const submitMutation = useSubmitPlacement();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [writingText, setWritingText] = useState("");
  const [speakingTranscript, setSpeakingTranscript] = useState("");
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const data = await submitMutation.mutateAsync({
        userId: userId || "anonymous",
        mcqAnswers: selectedAnswers,
        writingText,
        speakingTranscript,
      });
      setResult(data);
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
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-2xl border border-red-200">
          <p className="font-bold">Gagal memuat tes penempatan</p>
          <p className="text-sm mt-1">{String(loadError)}</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface py-12">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-3xl bg-accent/30 text-primary flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Hasil Tes Penempatan Selesai
          </span>

          <h2 className="text-3xl font-extrabold text-primary mt-2">
            Grade CEFR Kamu: <span className="text-secondary">{result.overallCefr}</span>
          </h2>

          <div className="my-6 p-4 rounded-2xl bg-surface border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Skor Pilihan Ganda</p>
              <p className="text-xl font-bold text-primary">
                {result.correctCount} / {result.totalQuestions} ({result.scorePercent}%)
              </p>
            </div>
            {result.speakingEvaluation && (
              <div>
                <p className="text-xs text-slate-500">Level Berbicara (Speaking)</p>
                <p className="text-xl font-bold text-secondary">
                  CEFR {result.speakingEvaluation.cefr} ({result.speakingEvaluation.score_0_100}/100)
                </p>
              </div>
            )}
          </div>

          {result.speakingEvaluation && (
            <div className="my-6 text-left p-5 rounded-2xl bg-surface border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-primary">Evaluasi Berbicara & Tata Bahasa</h3>
                    <p className="text-[11px] text-slate-500">Dianalisis oleh AI Mr. Khoirul dengan Dataset CEFR</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-secondary px-2.5 py-1 bg-secondary/10 rounded-lg">
                    Level: {result.speakingEvaluation.cefr}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Skor: {result.speakingEvaluation.score_0_100}/100</p>
                </div>
              </div>

              {result.speakingEvaluation.criteria && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(result.speakingEvaluation.criteria).map(([key, val]: any) => (
                    <div key={key} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{key}</p>
                      <p className="text-sm font-extrabold text-primary">{val} <span className="text-[10px] font-normal text-slate-400">/ 5.0</span></p>
                    </div>
                  ))}
                </div>
              )}

              {result.speakingTranscript && (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Transkrip Ucapan Kamu:</span>
                  <p className="italic text-slate-600 dark:text-slate-400 bg-surface p-2 rounded-lg text-[11px]">
                    &quot;{result.speakingTranscript}&quot;
                  </p>
                </div>
              )}

              {result.speakingEvaluation.grammar_analysis?.strengths?.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Poin Grammar yang Sudah Bagus:
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc pl-5 space-y-0.5">
                    {result.speakingEvaluation.grammar_analysis.strengths.map((str: string, i: number) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.speakingEvaluation.grammar_analysis?.corrections?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Analisis Koreksi Grammar &amp; Kosakata:
                  </h4>
                  <div className="space-y-2">
                    {result.speakingEvaluation.grammar_analysis.corrections.map((corr: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs space-y-1">
                        <div className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold text-[11px] min-w-[55px]">Kamu:</span>
                          <span className="line-through text-slate-500 font-mono text-[11px]">{corr.said}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold text-[11px] min-w-[55px]">Saran:</span>
                          <span className="text-emerald-700 font-semibold font-mono text-[11px]">{corr.better}</span>
                        </div>
                        {corr.explanation && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-[60px] italic flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{corr.explanation}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.speakingEvaluation.feedback_id && (
                <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/20 text-xs space-y-1">
                  <p className="font-bold text-primary flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-secondary" />
                    Catatan Mr. Khoirul:
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">{result.speakingEvaluation.feedback_id}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
            Kurikulum dan gaya mengajar Mr. Khoirul sekarang otomatis disesuaikan dengan tingkat kemampuan <strong>{result.overallCefr}</strong> kamu.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/call" className="flex-1">
              <Button variant="primary" size="lg" className="w-full">
                Mulai Bicara dengan Mr. Khoirul
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Lihat Dashboard Belajar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mcqs = (testData as any)?.mcqs || [];
  const listening = (testData as any)?.listening;
  const writing = (testData as any)?.writing;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tes Penempatan Adaptif CEFR A1 - C2</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
          Ukur Kemampuan Bahasa Inggrismu
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Jawab pertanyaan sesuai kemampuanmu. Jangan khawatir jika ada soal sulit, ini digunakan untuk menentukan level awal belajarmu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Grammar & Vocab */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              Bagian 1: Tata Bahasa &amp; Kosakata (Grammar &amp; Vocabulary)
            </h2>
          </div>

          {mcqs.map((q: any, idx: number) => (
            <div key={q.id} className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{q.question}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                {q.options.map((opt: string) => {
                  const isSelected = selectedAnswers[q.id] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Listening Script Simulation */}
        {listening && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <Headphones className="w-4 h-4 text-secondary" />
                Bagian 2: Pemahaman Mendengarkan (Listening Comprehension)
              </h2>
            </div>

            <AudioPlayer
              audioUrl={listening.audio_url}
              audioScript={listening.audio_script}
              title={listening.title}
              targetLevel={listening.target_level}
            />

            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{listening.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listening.options.map((opt: string) => {
                  const isSelected = selectedAnswers[listening.id] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelectOption(listening.id, opt)}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Writing Sample */}
        {writing && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <PenTool className="w-4 h-4 text-secondary" />
                Bagian 3: Menulis Singkat (Writing Expression)
              </h2>
            </div>

            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{writing.prompt}</p>

            <textarea
              rows={4}
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="Tuliskan jawabanmu dalam Bahasa Inggris di sini (minimal 3-5 kalimat)..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
            />
          </div>
        )}

        {/* Section 4: Speaking Test */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Mic className="w-4 h-4 text-secondary" />
              Bagian 4: Tes Berbicara &amp; Tata Bahasa (Speaking &amp; Grammar)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Perkenalkan dirimu dalam Bahasa Inggris. AI Mr. Khoirul akan mendengarkan rekaman suaramu dan menganalisis akurasi grammar serta level kemampuan berbicaramu berdasarkan standar CEFR.
            </p>
          </div>

          <SpeakingRecorder onTranscriptChange={setSpeakingTranscript} />
        </div>

        {/* Submit Action */}
        <div className="text-center pt-4 space-y-3">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold max-w-md mx-auto">
              {errorMsg}{" "}
              <Link href="/login" className="underline font-bold text-secondary">
                Masuk di sini
              </Link>
            </div>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            disabled={submitMutation.isPending}
            className="w-full md:w-auto min-w-[240px]"
          >
            {submitMutation.isPending ? "Menganalisis Jawaban & Grammar..." : "Kirim & Hitung Level CEFR"}
          </Button>
        </div>
      </form>
    </div>
  );
}
