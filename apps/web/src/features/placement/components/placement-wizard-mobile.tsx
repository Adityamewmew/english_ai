"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Headphones,
  PenTool,
  Mic,
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { SpeakingRecorder } from "@/components/audio/SpeakingRecorder";
import { animeButtonPop } from "@/lib/anime-effects";

interface QuestionItem {
  id: string;
  section: "mcq" | "listening" | "writing" | "speaking";
  sectionTitle: string;
  sectionBadge: string;
  badgeStyle: string;
  question: string;
  options?: string[];
  audioUrl?: string;
  audioScript?: string;
}

interface PlacementWizardMobileProps {
  mcqs: Array<{ id: string; question: string; options: string[] }>;
  listening: Array<{ id: string; question: string; options: string[]; audioUrl?: string; audioScript?: string }>;
  writing: Array<{ id: string; question: string }>;
  speaking: Array<{ id: string; question: string }>;
  mcqAnswers: Record<string, string>;
  listeningAnswers: Record<string, string>;
  writingAnswers: Record<string, string>;
  speakingAnswers: Record<string, string>;
  onSelectOption: (type: "mcq" | "listening", questionId: string, option: string) => void;
  onWritingChange: (questionId: string, text: string) => void;
  onSpeakingTranscript: (questionId: string, transcript: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  errorMsg: string | null;
}

export function PlacementWizardMobile({
  mcqs = [],
  listening = [],
  writing = [],
  speaking = [],
  mcqAnswers,
  listeningAnswers,
  writingAnswers,
  speakingAnswers,
  onSelectOption,
  onWritingChange,
  onSpeakingTranscript,
  onSubmit,
  isSubmitting,
  errorMsg,
}: PlacementWizardMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showJumpSheet, setShowJumpSheet] = useState(false);

  // Flatten all questions into a unified sequential list
  const questions: QuestionItem[] = useMemo(() => {
    const list: QuestionItem[] = [];

    mcqs.forEach((q) => {
      list.push({
        id: q.id,
        section: "mcq",
        sectionTitle: "Grammar & Vocabulary",
        sectionBadge: "Grammar",
        badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
        question: q.question,
        options: q.options,
      });
    });

    listening.forEach((l) => {
      list.push({
        id: l.id,
        section: "listening",
        sectionTitle: "Listening Comprehension",
        sectionBadge: "Listening",
        badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
        question: l.question,
        options: l.options,
        audioUrl: l.audioUrl,
        audioScript: l.audioScript,
      });
    });

    writing.forEach((w) => {
      list.push({
        id: w.id,
        section: "writing",
        sectionTitle: "Writing Prompt",
        sectionBadge: "Writing",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        question: w.question,
      });
    });

    speaking.forEach((s) => {
      list.push({
        id: s.id,
        section: "speaking",
        sectionTitle: "Speaking Prompt",
        sectionBadge: "Speaking",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
        question: s.question,
      });
    });

    return list;
  }, [mcqs, listening, writing, speaking]);

  const totalQuestions = questions.length || 1;

  const isItemAnswered = (item: QuestionItem): boolean => {
    if (item.section === "mcq") return !!mcqAnswers[item.id];
    if (item.section === "listening") return !!listeningAnswers[item.id];
    if (item.section === "writing") return (writingAnswers[item.id] || "").trim().length > 3;
    if (item.section === "speaking") return (speakingAnswers[item.id] || "").trim().length > 2;
    return false;
  };

  const answeredCount = questions.filter(isItemAnswered).length;
  const progressPercent = Math.min(100, Math.round((answeredCount / totalQuestions) * 100));

  const current = questions[currentIndex] || questions[0];
  const isCurrentAnswered = current ? isItemAnswered(current) : false;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handlePrev = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  };

  const handleJumpTo = (idx: number) => {
    setCurrentIndex(idx);
    setShowJumpSheet(false);
  };

  const getSectionIcon = (section: QuestionItem["section"]) => {
    switch (section) {
      case "mcq":
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      case "listening":
        return <Headphones className="w-3.5 h-3.5 text-purple-600" />;
      case "writing":
        return <PenTool className="w-3.5 h-3.5 text-emerald-600" />;
      case "speaking":
        return <Mic className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  if (!current) return null;

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with Quick Jump */}
      <div className="bg-white rounded-2xl border border-slate-200 border-b-2 border-b-slate-300 p-3.5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Section & Index Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${current.badgeStyle}`}
            >
              {getSectionIcon(current.section)}
              {current.sectionBadge}
            </span>
            <span className="text-xs font-bold text-slate-700">
              Soal {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Quick Jump Grid Button */}
          <button
            type="button"
            onClick={(e) => {
              animeButtonPop(e.currentTarget as HTMLElement);
              setShowJumpSheet(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95 transition-all"
            title="Daftar seluruh soal"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
            <span>Pilih Soal</span>
          </button>
        </div>

        {/* Tactile Progress Indicator */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
            <span>
              {answeredCount} dari {totalQuestions} terjawab
            </span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Focused Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-4 sm:p-6 space-y-4">
        {/* Answered Status Pill */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-slate-400">
            {current.sectionTitle}
          </span>
          {isCurrentAnswered ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" />
              Sudah Dijawab
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Belum Dijawab
            </span>
          )}
        </div>

        {/* Question Prompt */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            {current.question}
          </p>
        </div>

        {/* SECTION SPECIFIC INPUTS */}
        {/* A. MCQ Options */}
        {current.section === "mcq" && current.options && (
          <div className="space-y-2 pt-1">
            {current.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = mcqAnswers[current.id] === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={(e) => {
                    animeButtonPop(e.currentTarget as HTMLElement);
                    onSelectOption("mcq", current.id, opt);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all min-h-[50px] flex items-center justify-between select-none cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? "bg-primary text-white border-2 border-primary border-b-4 border-b-[#07192b] shadow-xs font-bold"
                      : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 border-b-3 border-b-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-white text-primary border-white"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        )}

        {/* B. Listening Player + Options */}
        {current.section === "listening" && (
          <div className="space-y-3.5 pt-1">
            <AudioPlayer
              audioUrl={current.audioUrl}
              audioScript={current.audioScript}
              title={`Audio Soal #${currentIndex + 1}`}
              hideTranscript={true}
            />

            {current.options && (
              <div className="space-y-2 pt-1">
                {current.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = listeningAnswers[current.id] === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={(e) => {
                        animeButtonPop(e.currentTarget as HTMLElement);
                        onSelectOption("listening", current.id, opt);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all min-h-[50px] flex items-center justify-between select-none cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "bg-primary text-white border-2 border-primary border-b-4 border-b-[#07192b] shadow-xs font-bold"
                          : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 border-b-3 border-b-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-white text-primary border-white"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* C. Writing Textarea */}
        {current.section === "writing" && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Tuliskan jawaban dalam bahasa Inggris:</span>
              <span className="font-semibold">
                {(writingAnswers[current.id] || "").split(/\s+/).filter(Boolean).length} kata
              </span>
            </div>
            <textarea
              rows={4}
              value={writingAnswers[current.id] || ""}
              onChange={(e) => onWritingChange(current.id, e.target.value)}
              placeholder="Write your response in English here..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 border-b-2 border-b-slate-300 bg-[#FBFBFE] focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 transition-all font-normal shadow-inner leading-relaxed"
            />
          </div>
        )}

        {/* D. Speaking Recorder */}
        {current.section === "speaking" && (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-slate-500">
              Tekan rekam dan ucapkan jawabanmu dalam bahasa Inggris dengan jelas:
            </p>
            <SpeakingRecorder
              key={current.id}
              onTranscriptChange={(transcript) => onSpeakingTranscript(current.id, transcript)}
            />
          </div>
        )}
      </div>

      {/* 3. Error Banner if Submission Fails */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4. Bottom Thumb-friendly Navigation Strip */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 border-b-3 border-b-slate-300 active:border-b active:translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none min-h-[48px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-secondary hover:bg-[#d4720e] text-white text-xs font-extrabold border-b-3 border-b-[#a85507] active:border-b-0 active:translate-y-1 shadow-sm transition-all disabled:opacity-50 min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Menilai...</span>
                </>
              ) : (
                <span>Kirim Tes</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-primary hover:bg-[#0c2b48] text-white text-xs font-bold border-b-3 border-b-[#07192b] active:border-b-0 active:translate-y-1 shadow-xs transition-all min-h-[48px]"
            >
              <span>Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Submit Option visible if student has answered all or wants to finish */}
        {!isLastQuestion && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || answeredCount === 0}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline active:opacity-75 transition-colors disabled:opacity-30 disabled:no-underline"
            >
              Selesai lebih awal? Kirim jawaban sekarang ({answeredCount}/{totalQuestions})
            </button>
          </div>
        )}
      </div>

      {/* 5. Quick Jump Grid Bottom Sheet / Modal */}
      {showJumpSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-heading font-extrabold text-sm text-slate-900">
                  Daftar Soal ({totalQuestions})
                </h4>
                <p className="text-[11px] text-slate-500">
                  {answeredCount} dari {totalQuestions} telah dijawab
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJumpSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of question pills */}
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const answered = isItemAnswered(q);
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpTo(idx)}
                    className={`h-11 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all select-none ${
                      isActive
                        ? "bg-primary text-white border-2 border-primary border-b-3 border-b-[#07192b] shadow-xs"
                        : answered
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 border-b-2 border-b-emerald-400 font-extrabold"
                        : "bg-white text-slate-700 border border-slate-200 border-b-2 border-b-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[9px] font-normal leading-none opacity-80">
                      {answered ? "✓" : q.sectionBadge.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowJumpSheet(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
