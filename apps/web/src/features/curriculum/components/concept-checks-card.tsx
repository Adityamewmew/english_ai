"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Sparkles } from "lucide-react";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";

interface ConceptCheckQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface ConceptChecksCardProps {
  conceptChecks: ConceptCheckQuestion[];
  accentColor?: "blue" | "purple" | "amber" | "rose" | "emerald";
  embedded?: boolean;
}

export function ConceptChecksCard({
  conceptChecks,
  accentColor = "blue",
  embedded = false,
}: ConceptChecksCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  if (!conceptChecks || conceptChecks.length === 0) return null;

  const colorStyles = {
    blue: {
      badgeBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/50",
      ring: "focus:ring-blue-500",
    },
    purple: {
      badgeBg: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/50",
      ring: "focus:ring-purple-500",
    },
    amber: {
      badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-900/50",
      ring: "focus:ring-amber-500",
    },
    rose: {
      badgeBg: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-900/50",
      ring: "focus:ring-rose-500",
    },
    emerald: {
      badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/50",
      ring: "focus:ring-emerald-500",
    },
  }[accentColor];

  const handleSelect = (qIdx: number, option: string, targetEl?: HTMLElement) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
    setShowFeedback((prev) => ({ ...prev, [qIdx]: true }));

    const isCorrect = option.trim().toLowerCase() === conceptChecks[qIdx]?.answer?.trim().toLowerCase();
    if (targetEl) {
      if (isCorrect) {
        animeButtonPop(targetEl);
      } else {
        animeShake(targetEl);
      }
    }
  };

  return (
    <div
      className={
        embedded
          ? "space-y-5"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5"
      }
    >
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${colorStyles.badgeBg}`}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Theory Checkpoint (EDCI Post-Test · {conceptChecks.length} Questions)
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Concept Checkpoint & Understanding Test
          </h4>
        </div>
      </div>

      <div className="space-y-4">
        {conceptChecks.map((check, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const hasAnswered = showFeedback[qIdx];
          const isCorrect = selected?.trim().toLowerCase() === check.answer?.trim().toLowerCase();

          return (
            <div
              key={qIdx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {check.question}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {check.options?.map((opt, optIdx) => {
                  const isThisSelected = selected === opt;
                  let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600";

                  if (hasAnswered) {
                    if (opt.trim().toLowerCase() === check.answer.trim().toLowerCase()) {
                      btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold";
                    } else if (isThisSelected && !isCorrect) {
                      btnStyle = "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300";
                    } else {
                      btnStyle = "opacity-50 border-slate-200 dark:border-slate-700 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={(e) => handleSelect(qIdx, opt, e.currentTarget)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && opt.trim().toLowerCase() === check.answer.trim().toLowerCase() && (
                         <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      {hasAnswered && isThisSelected && !isCorrect && (
                        <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && check.explanation && (
                <div
                  className={`p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 ${
                    isCorrect
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40"
                      : "bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{isCorrect ? "Correct! " : "Note: "}</span>
                    {check.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
