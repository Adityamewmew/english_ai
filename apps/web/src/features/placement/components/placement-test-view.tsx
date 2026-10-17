"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Track completion count
  const answeredCount =
    Object.keys(mcqAnswers).length +
    Object.keys(listeningAnswers).length +
    Object.values(writingAnswers).filter((t) => t.trim().length > 3).length +
    Object.values(speakingAnswers).filter((t) => t.trim().length > 2).length;

  const progressPercent = Math.min(100, Math.round((answeredCount / totalQuestions) * 100));

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
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-slate-200 flex items-center justify-center mx-auto text-primary">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <div>
            <p className="font-heading text-base font-bold text-primary">
              Menyiapkan Tes Penempatan Unikmu...
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Mengacak 22 soal diagnostik dari bank soal resmi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-rose-200 bg-rose-50/50 text-center p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-rose-950">
              Gagal Memuat Tes Penempatan
            </h3>
            <p className="text-xs text-rose-700 mt-1">
              {String(loadError?.message || loadError)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Muat Ulang Halaman
          </Button>
        </Card>
      </div>
    );
  }

  // Result Celebration Screen
  if (result) {
    const skills = result.skills || {};
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
        <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-[#E5E9F5] shadow-xs text-center p-6 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-secondary flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-9 h-9 text-secondary" />
          </div>

          <div className="space-y-1">
            <Badge variant="accent" className="text-xs px-3 py-1 uppercase tracking-wider">
              Hasil Tes Penempatan CEFR
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary pt-2">
              Tingkat Kemampuan: <span className="text-secondary">{result.overallCefr}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Skor Komposit Keseluruhan: <span className="font-bold text-primary">{result.scorePercent}%</span>
            </p>
          </div>

          {/* 4 Skill Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="bg-surface p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                MCQ (30%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.mcqScore ?? result.mcqScore ?? 0}%
              </p>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-purple-600" />
                Listening (25%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.listeningScore ?? 0}%
              </p>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                Writing (25%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.writingScore ?? result.writingScore ?? 0}%
              </p>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-secondary" />
                Speaking (20%)
              </span>
              <p className="font-heading text-xl font-extrabold text-primary mt-1">
                {skills.speakingScore ?? result.speakingScore ?? 0}%
              </p>
            </div>
          </div>

          {/* Mr. Khoirul AI Feedback Notes */}
          {(result.writingEvaluation?.feedback_id || result.speakingEvaluation?.feedback_id) && (
            <div className="text-left p-4 rounded-2xl bg-surface border border-slate-200/70 space-y-2">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-secondary" />
                Catatan Tutor AI Mr. Khoirul:
              </p>
              {result.writingEvaluation?.feedback_id && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-primary font-semibold">Writing:</strong> {result.writingEvaluation.feedback_id}
                </p>
              )}
              {result.speakingEvaluation?.feedback_id && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-primary font-semibold">Speaking:</strong> {result.speakingEvaluation.feedback_id}
                </p>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-600">
            Kurikulum dan silabus materi belajar kamu telah otomatis disinkronkan dengan tingkat kemampuan <strong>{result.overallCefr}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/curriculum" className="flex-1">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-primary hover:bg-[#0c2b48] text-white rounded-xl font-bold"
              >
                Mulai Belajar Kurikulum {result.overallCefr}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-slate-200 text-primary font-semibold"
              >
                Buka Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-secondary border border-amber-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>Tes Penempatan Adaptif CEFR</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Ukur Kemampuan Bahasa Inggrismu
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Paket tes ini dirancang untuk mendeteksi kemampuan awalmu secara menyeluruh: 10 soal Tata Bahasa &amp; Kosakata, 5 soal Listening, 5 soal Writing, dan 2 soal Speaking. Jawab senatural mungkin.
        </p>

        {/* Live Progress Bar */}
        <div className="pt-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
            <span>Kemajuan Pengerjaan:</span>
            <span className="text-primary font-bold">
              {answeredCount} dari {totalQuestions} soal terjawab ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: 10 MCQ */}
        {mcqs.length > 0 && (
          <Card className="rounded-2xl border border-[#E5E9F5] bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="font-heading text-base font-bold text-primary">
                    Bagian 1: Tata Bahasa &amp; Kosakata (10 Soal)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Pilih satu opsi kata yang paling tepat melengkapi kalimat.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {mcqs.map((q: any, idx: number) => (
                <div key={q.id} className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {q.question}
                    </p>
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
                              ? "bg-primary text-white border-primary shadow-xs font-bold"
                              : "bg-surface hover:bg-slate-100 text-slate-700 border-slate-200"
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
            </CardContent>
          </Card>
        )}

        {/* Section 2: 5 Listening */}
        {listening.length > 0 && (
          <Card className="rounded-2xl border border-[#E5E9F5] bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="font-heading text-base font-bold text-primary">
                    Bagian 2: Pemahaman Mendengarkan / Listening (5 Soal)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Dengarkan audio percakapan, lalu pilih opsi jawaban yang tepat.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {listening.map((l: any, idx: number) => (
                <div key={l.id} className="space-y-3 pt-3 border-t first:border-t-0 first:pt-0">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-purple-600 mt-0.5">{idx + 1}.</span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {l.question}
                    </p>
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
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs font-bold"
                              : "bg-surface hover:bg-slate-100 text-slate-700 border-slate-200"
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
            </CardContent>
          </Card>
        )}

        {/* Section 3: 5 Writing */}
        {writing.length > 0 && (
          <Card className="rounded-2xl border border-[#E5E9F5] bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="font-heading text-base font-bold text-primary">
                    Bagian 3: Keterampilan Menulis / Writing (5 Soal)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Tuliskan tanggapan singkat dalam Bahasa Inggris sesuai konteks.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {writing.map((w: any, idx: number) => {
                const words = (writingAnswers[w.id] || "").split(/\s+/).filter(Boolean).length;
                return (
                  <div key={w.id} className="space-y-2 pt-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-emerald-600 mt-0.5">{idx + 1}.</span>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {w.question}
                      </p>
                    </div>

                    <div className="pl-5">
                      <textarea
                        rows={3}
                        value={writingAnswers[w.id] || ""}
                        onChange={(e) => handleWritingChange(w.id, e.target.value)}
                        placeholder="Ketik jawaban dalam Bahasa Inggris di sini..."
                        className="w-full p-3.5 rounded-[10px] border border-slate-200 bg-surface focus:bg-white text-xs text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-all font-normal"
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>Panjang disarankan: 2 - 5 kalimat</span>
                        <span className={words >= 5 ? "text-emerald-600 font-bold" : ""}>
                          {words} kata
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Section 4: 2 Speaking */}
        {speaking.length > 0 && (
          <Card className="rounded-2xl border border-[#E5E9F5] bg-white shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-secondary flex items-center justify-center font-bold">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="font-heading text-base font-bold text-primary">
                    Bagian 4: Keterampilan Berbicara / Speaking (2 Soal)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Klik rekam, bicaralah dengan jelas dalam Bahasa Inggris, lalu klik selesai.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {speaking.map((s: any, idx: number) => (
                <div key={s.id} className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-secondary mt-0.5">{idx + 1}.</span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {s.question}
                    </p>
                  </div>

                  <div className="pl-5 space-y-2">
                    <SpeakingRecorder
                      onTranscriptChange={(transcript) => handleSpeakingTranscript(s.id, transcript)}
                    />
                    {speakingAnswers[s.id] && (
                      <div className="p-3 bg-surface rounded-xl border border-slate-200 text-xs">
                        <span className="text-[11px] font-bold text-primary block mb-0.5">
                          Transkrip Suara Terdeteksi:
                        </span>
                        <p className="italic text-slate-700 text-xs">
                          &quot;{speakingAnswers[s.id]}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Submit Bottom Section */}
        <div className="text-center pt-2 pb-6 space-y-3">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold max-w-md mx-auto">
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitMutation.isPending}
            className="w-full sm:w-auto min-w-[280px] min-h-[50px] bg-secondary hover:bg-[#d4720e] text-white rounded-xl text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Menganalisis Jawaban &amp; CEFR...
              </span>
            ) : (
              "Kirim Jawaban & Dapatkan Level CEFR"
            )}
          </Button>

          <p className="text-[11px] text-slate-400">
            Hasil evaluasi akan otomatis menentukan kurikulum belajar yang paling cocok untukmu.
          </p>
        </div>
      </form>
    </div>
  );
}
