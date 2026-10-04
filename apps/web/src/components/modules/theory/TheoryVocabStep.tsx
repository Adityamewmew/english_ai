"use client";

import React, { useState, useEffect } from "react";
import { Volume2, ArrowRight, HelpCircle, Bot, Check, X, BookOpen } from "lucide-react";
import { VocabItem } from "../SectionVocab";
import { animeCardStagger, animeCardHover, animeButtonPop, animeShake } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TheoryVocabStepProps {
  vocabItems: VocabItem[];
  onPlayAudio?: (text: string) => void;
  onNext: () => void;
  onCompleteStep?: () => void;
}

export function TheoryVocabStep({
  vocabItems = [],
  onPlayAudio,
  onNext,
  onCompleteStep,
}: TheoryVocabStepProps) {
  // Stagger entry of vocab flashcards using Anime.js
  useEffect(() => {
    animeCardStagger(".vocab-card-item", 50);
  }, [vocabItems]);

  // Setup quick vocab quiz from first/second item
  const quizTarget = vocabItems[0];
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Generate options safely
  const otherItems = vocabItems.slice(1, 4);
  const quizOptions = quizTarget
    ? [
        quizTarget.meaning,
        otherItems[0]?.meaning || "aktivitas harian",
        otherItems[1]?.meaning || "tempat pertemuan",
      ]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    : [];

  const handleSelectAnswer = (ans: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedAnswer(ans);
    if (e?.currentTarget) {
      if (ans === quizTarget?.meaning) {
        animeButtonPop(e.currentTarget);
      } else {
        animeShake(e.currentTarget);
      }
    }
    onCompleteStep?.();
  };

  if (!vocabItems || vocabItems.length === 0) {
    return (
      <Card className="p-8 sm:p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Kosakata Telah Terintegrasi dalam Pola Kalimat
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Modul ini berfokus pada struktur dan pola kalimat utama. Kamu dapat langsung lanjut ke langkah percakapan kontekstual.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
          >
            <span>Lanjut ke Percakapan</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Volume2 className="w-4 h-4" />
          <span>Kosakata Kunci dalam Konteks Kalimat</span>
        </div>
        <Badge variant="secondary" className="font-semibold text-xs px-3 py-1">
          {vocabItems.length} Kata Tersedia
        </Badge>
      </div>

      {/* Vocab Cards Grid using shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {vocabItems.map((v, idx) => (
          <Card
            key={idx}
            onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
            onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
            className="vocab-card-item flex flex-col justify-between p-6 sm:p-7 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-400 dark:hover:border-blue-600 transition-colors shadow-xs rounded-2xl group will-change-transform cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {v.word}
                  </span>
                  {v.ipa && (
                    <Badge variant="outline" size="sm" className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {v.ipa}
                    </Badge>
                  )}
                </div>

                {onPlayAudio && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      animeButtonPop(e.currentTarget);
                      onPlayAudio(v.word);
                    }}
                    className="min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors shrink-0"
                    title={`Dengarkan pelafalan "${v.word}"`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {v.meaning}
              </p>
            </div>

            {v.collocation && (
              <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider mb-1.5">
                  Contoh Penggunaan Nyata:
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  &ldquo;{v.collocation}&rdquo;
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Mini Vocab Check using shadcn Card */}
      {quizTarget && quizOptions.length > 1 && (
        <Card className="vocab-card-item bg-gradient-to-br from-indigo-50/60 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-indigo-200/80 dark:border-indigo-900/50 p-6 sm:p-8 md:p-10 shadow-xs space-y-4 rounded-2xl will-change-transform">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Cek Kilat Kosakata</span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
            Apa arti dari kata <strong className="text-indigo-600 dark:text-indigo-400 font-bold">&ldquo;{quizTarget.word}&rdquo;</strong>?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
            {quizOptions.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === quizTarget.meaning;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => handleSelectAnswer(opt, e)}
                  className={`p-4 sm:p-5 rounded-2xl text-left border border-b-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer select-none will-change-transform min-h-[56px] ${
                    isSelected
                      ? isCorrect
                        ? "border-emerald-500 border-b-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold"
                        : "border-rose-500 border-b-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                      : "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-400 active:border-b-0 active:translate-y-1 shadow-xs"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    isCorrect ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <X className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                {selectedAnswer === quizTarget.meaning
                  ? `Mantap! "${quizTarget.word}" berarti "${quizTarget.meaning}".`
                  : `Hampir tepat! Arti yang benar dari "${quizTarget.word}" adalah "${quizTarget.meaning}".`}
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-end">
        <Button
          size="lg"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-md hover:brightness-105 will-change-transform"
        >
          <span>Lanjut ke Aplikasi Dialog</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const Phase1VocabStep = TheoryVocabStep;
export type { TheoryVocabStepProps as Phase1VocabStepProps };
