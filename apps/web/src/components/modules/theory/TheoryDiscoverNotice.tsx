"use client";

import React, { useState } from "react";
import { Eye, ArrowRight, Bot, Check, X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeCardHover, animeButtonPop, animeShake } from "@/lib/anime-effects";

export interface DiscoverNoticeData {
  targetSentence: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TheoryDiscoverNoticeProps {
  data?: DiscoverNoticeData;
  fallbackRule?: string;
  fallbackExample?: string;
  onNext: () => void;
  onCompleteStep?: () => void;
}

export function TheoryDiscoverNotice({
  data,
  fallbackRule,
  fallbackExample,
  onNext,
  onCompleteStep,
}: TheoryDiscoverNoticeProps) {
  // Derive smart discovery if data is not directly provided
  const defaultSentence =
    fallbackExample ||
    (fallbackRule ? fallbackRule.split(":")[1]?.trim() || fallbackRule : "She is from Japan.");

  const noticeData: DiscoverNoticeData = data || {
    targetSentence: defaultSentence,
    question: `Perhatikan struktur kalimat di atas. Pola apa yang paling menonjol pada kalimat tersebut?`,
    options: [
      "Menunjukkan subjek yang dihubungkan dengan kata kerja penjelas",
      "Menyatakan perintah langsung tanpa subjek",
      "Menunjukkan kalimat tanya masa lampau",
    ],
    correctIndex: 0,
    explanation:
      "Tepat sekali! Kalimat ini menghubungkan subjek dengan informasi penjelasnya. Mari kita pelajari rumusnya secara lengkap pada bagian konsep berikutnya.",
  };

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (idx: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedIdx(idx);
    if (e?.currentTarget) {
      if (idx === noticeData.correctIndex) {
        animeButtonPop(e.currentTarget);
      } else {
        animeShake(e.currentTarget);
      }
    }
    onCompleteStep?.();
  };

  const isCorrect = selectedIdx === noticeData.correctIndex;

  return (
    <div className="space-y-6">
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="bg-gradient-to-br from-violet-50/70 via-indigo-50/30 to-white dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-slate-900 border-violet-200/80 dark:border-violet-900/40 p-6 shadow-sm space-y-5 will-change-transform"
      >
        {/* Header Badge */}
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wider">
          <Eye className="w-4 h-4" />
          <span>Amati Polanya (Discover &amp; Notice)</span>
        </div>

        {/* Target Sentence Spotlight */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-violet-200/60 dark:border-violet-800/40 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
            Contoh Kalimat Nyata:
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            &ldquo;{noticeData.targetSentence}&rdquo;
          </p>
        </div>

        {/* Question & Guided Reflection */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
            {noticeData.question}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {noticeData.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const isOptionCorrect = idx === noticeData.correctIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelect(idx, e)}
                  className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-98 will-change-transform ${
                    isSelected
                      ? isOptionCorrect
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-2 ring-emerald-300 dark:ring-emerald-800"
                        : "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-2 ring-red-300 dark:ring-red-800"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-violet-300 hover:bg-violet-50/20"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <span className="shrink-0">
                      {isOptionCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Coach Feedback */}
        {selectedIdx !== null && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
              isCorrect
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold block">
                {isCorrect ? "Pengamatan yang Hebat!" : "Hampir Tepat! Simak Petunjuk Ini:"}
              </span>
              <p className="leading-relaxed opacity-95">{noticeData.explanation}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-end">
        <Button
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="gap-2 px-5 py-2.5 shadow-sm active:translate-y-0.5 will-change-transform"
        >
          <span>Lanjut ke Penjelasan Konsep Mendalam</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const Phase1DiscoverNotice = TheoryDiscoverNotice;
