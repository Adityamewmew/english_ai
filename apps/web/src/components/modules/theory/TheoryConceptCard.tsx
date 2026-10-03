"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, ArrowRight, HelpCircle, Bot, HelpCircle as WhyIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeCardHover, animeButtonPop, animeShake } from "@/lib/anime-effects";

interface CommonTrap {
  trapTitle?: string;
  explanation: string;
  wrong: string;
  correct: string;
}

export interface WhyPurpose {
  reason: string;
  withoutConcept: string;
  withConcept: string;
}

interface TheoryConceptCardProps {
  rules: any[];
  commonTrap?: CommonTrap;
  whyPurpose?: WhyPurpose;
  onNext: () => void;
  onCompleteStep?: () => void;
}

export function TheoryConceptCard({
  rules,
  commonTrap,
  whyPurpose,
  onNext,
  onCompleteStep,
}: TheoryConceptCardProps) {
  const [selectedOption, setSelectedOption] = useState<"wrong" | "correct" | null>(null);

  const handleSelectOption = (choice: "wrong" | "correct", e?: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedOption(choice);
    if (e?.currentTarget) {
      if (choice === "correct") {
        animeButtonPop(e.currentTarget);
      } else {
        animeShake(e.currentTarget);
      }
    }
    onCompleteStep?.();
  };

  // Smart derivation of Why / Purpose if not explicitly passed
  const effectiveWhy: WhyPurpose = whyPurpose || {
    reason: "Bentuk ini digunakan agar kalimat terdengar alami, jelas kedudukan subjeknya, dan mudah dipahami lawan bicara.",
    withoutConcept: commonTrap?.wrong || "I from Indonesia.",
    withConcept: commonTrap?.correct || "I am from Indonesia.",
  };

  return (
    <div className="space-y-6">
      {/* 1. Why / Purpose (Section 05 Framework v2) */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="bg-gradient-to-br from-amber-50/50 via-slate-50 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/50 p-5 sm:p-6 shadow-sm space-y-4 will-change-transform"
      >
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
          <WhyIcon className="w-4 h-4" />
          <span>❓ Mengapa Kita Menggunakan Bentuk Ini? (Why & Purpose)</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {effectiveWhy.reason}
        </p>

        {/* Contrast Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Tanpa Konsep Yang Tepat
            </span>
            <p className="text-xs font-semibold text-red-900 dark:text-red-200 italic">
              &ldquo;{effectiveWhy.withoutConcept}&rdquo;
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Dengan Konsep Yang Benar
            </span>
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 italic">
              &ldquo;{effectiveWhy.withConcept}&rdquo;
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Common Trap Challenge (Section 10 Framework v2) */}
      {commonTrap && commonTrap.wrong && commonTrap.correct && (
        <Card
          onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 will-change-transform"
        >
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>⚠️ Jebakan Umum: Pilih Kalimat yang Tepat</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Banyak pembelajar pemula sering keliru dalam pola ini. Manakah kalimat yang benar di bawah ini?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option A (Wrong) */}
            <button
              type="button"
              onClick={(e) => handleSelectOption("wrong", e)}
              className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-98 will-change-transform ${
                selectedOption === "wrong"
                  ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-2 ring-red-300 dark:ring-red-800"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-slate-300"
              }`}
            >
              <span>&ldquo;{commonTrap.wrong}&rdquo;</span>
              {selectedOption === "wrong" && (
                <X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              )}
            </button>

            {/* Option B (Correct) */}
            <button
              type="button"
              onClick={(e) => handleSelectOption("correct", e)}
              className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-98 will-change-transform ${
                selectedOption === "correct"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-800"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-slate-300"
              }`}
            >
              <span>&ldquo;{commonTrap.correct}&rdquo;</span>
              {selectedOption === "correct" && (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Feedback & AI Coach Note */}
          {selectedOption && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                selectedOption === "correct"
                  ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              <Bot className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="space-y-1 text-xs">
                <div className="font-bold flex items-center gap-2">
                  <span>Mr. Khoirul (AI Tutor):</span>
                  {selectedOption === "correct" ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Tepat sekali!</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-300 font-semibold">Perhatikan penjelasannya:</span>
                  )}
                </div>
                <p className="leading-relaxed opacity-95">
                  {commonTrap.explanation}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-end">
        <Button
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="gap-2 px-5 py-2.5 shadow-sm active:translate-y-0.5 will-change-transform"
        >
          <span>Pelajari Kosakata Kunci</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const Phase1ConceptCard = TheoryConceptCard;
