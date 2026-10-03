"use client";

import React, { useState } from "react";
import { ShieldAlert, Check, X, ArrowRight } from "lucide-react";
import { TheoryActionSandbox } from "./TheoryActionSandbox";
import { AnimatedCharacter } from "../AnimatedCharacter";
import { VocabItem } from "../SectionVocab";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeCardHover, animeButtonPop, animeShake } from "@/lib/anime-effects";

interface TheoryConceptDeepProps {
  title: string;
  summary: string;
  rules: any[];
  vocabItems?: VocabItem[];
  commonTrap?: {
    trapTitle?: string;
    explanation: string;
    wrong: string;
    correct: string;
  };
  onNext: () => void;
  onCompleteStep?: () => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onPenalizeWrong?: () => void;
  onPlayAudio?: (text: string) => void;
  onPlaySnap?: () => void;
}

export function TheoryConceptDeep({
  title,
  summary,
  rules,
  vocabItems = [],
  commonTrap,
  onNext,
  onCompleteStep,
  onAwardXp,
  onPenalizeWrong,
  onPlayAudio,
  onPlaySnap,
}: TheoryConceptDeepProps) {
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<"wrong" | "correct" | null>(null);

  const handleSelectQuiz = (opt: "wrong" | "correct", e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.currentTarget) {
      if (opt === "correct") {
        animeButtonPop(e.currentTarget);
      } else {
        animeShake(e.currentTarget);
      }
    }
    if (selectedQuizOpt === null) {
      if (opt === "correct") {
        onAwardXp?.(15, "Mengenali Jebakan Umum!");
      } else {
        onPenalizeWrong?.();
      }
    }
    setSelectedQuizOpt(opt);
    onCompleteStep?.();
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Animated Action Sandbox Stage (No passive text essays) */}
      <TheoryActionSandbox
        vocabItems={vocabItems}
        rules={rules}
        onPlayAudio={onPlayAudio}
        onAwardXp={onAwardXp}
        onPlaySnap={onPlaySnap}
      />

      {/* 2. Common Mistakes Interactive Challenge (Section 12) */}
      {commonTrap && (
        <Card
          onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
          className="bg-gradient-to-br from-amber-50/60 via-slate-50 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/50 p-6 sm:p-8 md:p-10 shadow-xs space-y-6 will-change-transform rounded-2xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Tantangan Jebakan Umum (Common Mistakes)</span>
            </div>
            <Badge variant="accent" className="font-bold text-xs px-3 py-1">
              Uji Cepat (+15 XP)
            </Badge>
          </div>

          {/* Animated Teacher Persona Reaction */}
          <AnimatedCharacter
            persona="teacher"
            state={selectedQuizOpt === "correct" ? "happy" : selectedQuizOpt === "wrong" ? "puzzled" : "idle"}
            message={
              selectedQuizOpt === "correct"
                ? "Sempurna! Kamu jeli sekali membedakan pola baku vs salah kaprah!"
                : selectedQuizOpt === "wrong"
                ? "Hati-hati! Pola ini sering salah digunakan oleh pemula karena terbawa bahasa ibu."
                : "Di antara dua kalimat ini, mana yang menggunakan aturan to be dengan benar?"
            }
            subMessage={selectedQuizOpt ? commonTrap.explanation : "Pilih satu opsi di bawah:"}
          />

          {/* Tactile Quiz Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
            <button
              type="button"
              onClick={(e) => handleSelectQuiz("wrong", e)}
              className={`p-5 sm:p-6 rounded-2xl text-left border border-b-4 transition-all flex flex-col justify-between gap-3 select-none cursor-pointer will-change-transform min-h-[90px] ${
                selectedQuizOpt === "wrong"
                  ? "border-red-500 border-b-red-700 bg-red-50 dark:bg-red-950/40 ring-2 ring-red-400/40 animate-tactile-shake"
                  : selectedQuizOpt === "correct"
                  ? "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 opacity-60"
                  : "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 active:border-b-0 active:translate-y-0.5 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pilihan A</span>
                {selectedQuizOpt === "wrong" && (
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Salah Kaprah
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono leading-relaxed">
                &ldquo;{commonTrap.wrong}&rdquo;
              </p>
            </button>

            <button
              type="button"
              onClick={(e) => handleSelectQuiz("correct", e)}
              className={`p-5 sm:p-6 rounded-2xl text-left border border-b-4 transition-all flex flex-col justify-between gap-3 select-none cursor-pointer will-change-transform min-h-[90px] ${
                selectedQuizOpt === "correct"
                  ? "border-emerald-500 border-b-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-400/40 animate-pop-bounce"
                  : selectedQuizOpt === "wrong"
                  ? "border-emerald-400 border-b-emerald-600 bg-emerald-50/50"
                  : "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 active:border-b-0 active:translate-y-0.5 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pilihan B</span>
                {selectedQuizOpt !== null && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Baku & Tepat
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono leading-relaxed">
                &ldquo;{commonTrap.correct}&rdquo;
              </p>
            </button>
          </div>
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
          className="border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-md will-change-transform px-6 py-3 min-h-[48px] text-sm font-bold gap-2"
        >
          <span>Pahami Rumus & Balok Kata</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const Phase1ConceptDeep = TheoryConceptDeep;
