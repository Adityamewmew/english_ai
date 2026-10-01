"use client";

import React, { useState } from "react";
import {
  Sparkles,
  PenTool,
  CheckCircle2,
  X,
  Mic,
  MicOff,
  Volume2,
  ArrowDown,
} from "lucide-react";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";

interface TheoryMiniTrialProps {
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
  // Pilih kata pertama kalimat sebagai target pengisian rumpang
  const rawWords = exampleSentence.split(/\s+/).filter(Boolean);
  const cleanWords = rawWords.map((w) => w.replace(/[^a-zA-Z]/g, "")).filter(Boolean);
  const targetWord = cleanWords[0] || "I";

  // Bentuk kalimat rumpang secara aman tanpa crash regex
  const punctuation = rawWords[0] ? rawWords[0].replace(/[a-zA-Z]/g, "") : "";
  const sentenceWithBlank = `[ ... ]${punctuation} ${rawWords.slice(1).join(" ")}`;

  // Siapkan opsi pilihan ganda yang bervariasi
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

  const handleToggleRecord = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
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
    <div className="pt-4 space-y-4">
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Percobaan Pemula Sebelum Masuk Praktikum
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
            Pemanasan Santai
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Coba 2 latihan ringan di bawah ini agar kamu terbiasa sebelum mempraktikkannya langsung bersama AI Tutor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Latihan 1: Writing Trial */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Percobaan 1: Menulis (Writing Trial)</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                Lengkapi kalimat berikut:
              </span>
              <p className="font-semibold text-sm text-slate-900 dark:text-white font-mono">
                {sentenceWithBlank}
              </p>
              {exampleMeaning && (
                <span className="text-[11px] text-slate-500 italic mt-0.5 block">
                  Artinya: ({exampleMeaning})
                </span>
              )}
            </div>

            {/* Opsi Pilihan Kata */}
            <div className="grid grid-cols-2 gap-2">
              {writingOptions.map((opt) => {
                const isSelected = selectedWritingOpt === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedWritingOpt(opt);
                      setIsWritingAnswered(true);
                    }}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                        ? isWritingCorrect
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-red-600 text-white border-red-600"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
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
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  isWritingCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                    : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40"
                }`}
              >
                {isWritingCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tepat! Kata yang tepat untuk melengkapi kalimat adalah &apos;{targetWord}&apos;.</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Kurang tepat. Pilihan yang tepat adalah &apos;{targetWord}&apos;.</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Latihan 2: Speaking Trial */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Percobaan 2: Berbicara (Speaking Trial)</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Coba lafalkan kalimat ini:
                </span>
                {onPlayAudio && (
                  <button
                    type="button"
                    onClick={() => onPlayAudio(exampleSentence)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dengar</span>
                  </button>
                )}
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                &ldquo;{exampleSentence}&rdquo;
              </p>
            </div>

            {/* Action Mic */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Berhenti Merekam</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Tekan & Lafalkan</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-500">
                {isRecording
                  ? "Mendengarkan suaramu..."
                  : isSpeakingTrialDone
                  ? "Selesai dicoba!"
                  : "Latihan tanpa beban skor"}
              </span>
            </div>

            {/* Feedback Speaking */}
            {spokenText && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold">Suaramu terdeteksi:</span>
                  <span className="italic">&ldquo;{spokenText}&rdquo;</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transition Action Card to Fase 2 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h5 className="font-bold text-sm text-slate-900 dark:text-white">
            {isPracticeUnlocked
              ? "Fase Praktikum & Evaluasi Telah Terbuka"
              : "Sudah Paham Materi Teori & Percobaan?"}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isPracticeUnlocked
              ? "Scroll ke bawah untuk melanjutkan praktikum berbicara dan kuis evaluasi."
              : "Lanjutkan ke Fase 2 untuk mempraktikkan speaking secara interaktif bersama Mr. Khoirul."}
          </p>
        </div>

        <button
          type="button"
          onClick={onAdvanceToPractice}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <span>Lanjut ke Praktikum & Evaluasi</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
