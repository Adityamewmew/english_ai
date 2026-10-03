"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  PenTool,
  CheckCircle2,
  X,
  Mic,
  MicOff,
  Volume2,
  ArrowDown,
  Award,
} from "lucide-react";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";
import {
  animeButtonPop,
  animeShake,
  animeCardHover,
  animeCardPulse,
  animeCardStagger,
} from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TheoryMiniTrialProps {
  exampleSentence: string;
  exampleMeaning?: string;
  onPlayAudio?: (text: string) => void;
  onAdvanceToPractice: () => void;
  isPracticeUnlocked?: boolean;
}

export function TheoryMiniTrial({
  exampleSentence,
  exampleMeaning,
  onPlayAudio,
  onAdvanceToPractice,
  isPracticeUnlocked = false,
}: TheoryMiniTrialProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  // Extract first word safely as fill-in-the-blank target
  const rawWords = exampleSentence.split(/\s+/).filter(Boolean);
  const cleanWords = rawWords.map((w) => w.replace(/[^a-zA-Z]/g, "")).filter(Boolean);
  const targetWord = cleanWords[0] || "I";

  const punctuation = rawWords[0] ? rawWords[0].replace(/[a-zA-Z]/g, "") : "";
  const sentenceWithBlank = `[ ... ]${punctuation} ${rawWords.slice(1).join(" ")}`;

  // Varied distractors pool
  const distractorPool = [
    "Me",
    "They",
    "She",
    "He",
    "We",
    "You",
    "It",
    "Is",
    "Are",
    "Do",
    "Does",
  ];
  const uniqueDistractors = distractorPool.filter(
    (d) => d.toLowerCase() !== targetWord.toLowerCase()
  );
  const writingOptions = [
    targetWord,
    uniqueDistractors[0] || "Me",
    uniqueDistractors[1] || "They",
    uniqueDistractors[2] || "He",
  ].sort((a, b) => a.localeCompare(b));

  const [selectedWritingOpt, setSelectedWritingOpt] = useState<string | null>(null);
  const [isWritingAnswered, setIsWritingAnswered] = useState(false);

  // Speaking Trial Setup
  const [spokenText, setSpokenText] = useState("");
  const [isSpeakingTrialDone, setIsSpeakingTrialDone] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const { startListening, stopListening } = useSpeechRecorder();

  // Anime.js Stagger trial cards on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>(".trial-interactive-card");
    if (cards.length > 0) {
      animeCardStagger(cards, 80);
    }
  }, []);

  const handleSelectWriting = (e: React.MouseEvent<HTMLButtonElement>, opt: string) => {
    setSelectedWritingOpt(opt);
    setIsWritingAnswered(true);

    const isCorrect = opt.toLowerCase() === targetWord.toLowerCase();
    if (isCorrect) {
      animeButtonPop(e.currentTarget);
    } else {
      animeShake(e.currentTarget);
    }
  };

  const handleToggleRecord = () => {
    if (micButtonRef.current) {
      animeButtonPop(micButtonRef.current);
    }

    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      if (micButtonRef.current) {
        animeCardPulse(micButtonRef.current);
      }
      startListening({
        onTextResult: (text) => {
          setSpokenText(text);
          setIsSpeakingTrialDone(true);
        },
        onAudioResult: () => {},
        onEnd: () => {
          setIsRecording(false);
        },
      });
    }
  };

  const isWritingCorrect =
    selectedWritingOpt?.toLowerCase() === targetWord.toLowerCase();

  return (
    <div ref={containerRef} className="pt-4 space-y-8">
      {/* Trial Header Card using shadcn Card */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="trial-interactive-card p-6 sm:p-8 md:p-10 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900 border-blue-200 dark:border-blue-900/50 shadow-xs space-y-7 rounded-2xl will-change-transform"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Percobaan Pemula Sebelum Masuk Praktikum
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Coba 2 latihan ringan di bawah ini agar kamu percaya diri sebelum berbicara dengan AI Tutor
              </p>
            </div>
          </div>
          <Badge variant="accent" className="text-xs px-3 py-1 font-bold">
            Pemanasan Santai
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Latihan 1: Writing Trial Card using shadcn Card */}
          <Card
            onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
            onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
            className="trial-interactive-card p-6 sm:p-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-5 rounded-2xl will-change-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Percobaan 1: Menulis (Writing Trial)</span>
              </div>
              <Badge variant="primary" size="sm" className="font-semibold text-[11px] px-2.5 py-0.5">
                Pilihan Ganda
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs sm:text-sm space-y-1.5">
              <span className="text-slate-500 dark:text-slate-400 block text-xs">
                Lengkapi kalimat berikut:
              </span>
              <p className="font-bold text-base text-slate-900 dark:text-white font-mono leading-relaxed">
                {sentenceWithBlank}
              </p>
              {exampleMeaning && (
                <span className="text-xs text-slate-500 italic block pt-0.5">
                  Artinya: &ldquo;{exampleMeaning}&rdquo;
                </span>
              )}
            </div>

            {/* Opsi Pilihan Kata */}
            <div className="grid grid-cols-2 gap-3">
              {writingOptions.map((opt) => {
                const isSelected = selectedWritingOpt === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={(e) => handleSelectWriting(e, opt)}
                    className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer select-none active:scale-95 min-h-[48px] ${
                      isSelected
                        ? isWritingCorrect
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback Writing */}
            {isWritingAnswered && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200 ${
                  isWritingCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40"
                }`}
              >
                {isWritingCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tepat sekali! Kata yang sesuai adalah &apos;{targetWord}&apos;.</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Kurang tepat. Pilihan yang benar adalah &apos;{targetWord}&apos;.</span>
                  </>
                )}
              </div>
            )}
          </Card>

          {/* Latihan 2: Speaking Trial Card using shadcn Card */}
          <Card
            onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
            onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
            className="trial-interactive-card p-6 sm:p-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-5 rounded-2xl will-change-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Percobaan 2: Berbicara (Speaking Trial)</span>
              </div>
              <Badge variant="secondary" size="sm" className="font-semibold text-[11px] px-2.5 py-0.5">
                Mikrofon Langsung
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-xs">
                  Coba lafalkan kalimat ini:
                </span>
                {onPlayAudio && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      animeButtonPop(e.currentTarget);
                      onPlayAudio(exampleSentence);
                    }}
                    className="h-auto p-0 text-blue-600 dark:text-blue-400 font-semibold text-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 mr-1" />
                    <span>Dengar Suara</span>
                  </Button>
                )}
              </div>
              <p className="font-bold text-base text-slate-900 dark:text-white leading-relaxed">
                &ldquo;{exampleSentence}&rdquo;
              </p>
            </div>

            {/* Action Mic Button */}
            <div className="flex items-center gap-3.5 pt-1">
              <Button
                ref={micButtonRef}
                onClick={handleToggleRecord}
                className={
                  isRecording
                    ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-400 min-h-[44px] px-4"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] px-4 font-bold"
                }
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-1.5" />
                    <span>Berhenti Merekam</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1.5" />
                    <span>Tekan &amp; Lafalkan</span>
                  </>
                )}
              </Button>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isRecording
                  ? "Mendengarkan suaramu..."
                  : isSpeakingTrialDone
                  ? "✓ Selesai dicoba!"
                  : "Uji coba bebas tanpa beban skor"}
              </span>
            </div>

            {/* Feedback Speaking */}
            {spokenText && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold">Suaramu berhasil terdeteksi:</span>
                  <span className="italic text-slate-800 dark:text-slate-200 font-medium">&ldquo;{spokenText}&rdquo;</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Card>

      {/* Transition Action Card to Fase 2 using shadcn Card */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="trial-interactive-card p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl will-change-transform"
      >
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h5 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              {isPracticeUnlocked
                ? "Fase Praktikum & Evaluasi Telah Terbuka"
                : "Sudah Paham Teori & Siap Praktikum?"}
            </h5>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            {isPracticeUnlocked
              ? "Scroll ke bawah untuk melanjutkan sesi berbicara di Speaking Lab dan kuis evaluasi."
              : "Lanjutkan ke Fase 2 untuk mempraktikkan percakapan secara langsung bersama AI Tutor."}
          </p>
        </div>

        <Button
          size="lg"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onAdvanceToPractice();
          }}
          className="w-full sm:w-auto shadow-md px-6 py-3 min-h-[48px] text-sm font-bold gap-2 shrink-0 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
        >
          <span>Lanjut ke Praktikum &amp; Evaluasi</span>
          <ArrowDown className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}
