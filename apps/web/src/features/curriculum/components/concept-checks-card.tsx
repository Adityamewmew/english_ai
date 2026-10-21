"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";

interface ConceptCheckQuestion {
  question: string;
  options: string[];
  answer?: string;
  correctAnswer?: string;
  explanation?: string;
}

interface ConceptChecksCardProps {
  conceptChecks: ConceptCheckQuestion[];
  accentColor?: "blue" | "purple" | "amber" | "rose" | "emerald";
  embedded?: boolean;
  onCompleted?: () => void;
}

export function ConceptChecksCard({
  conceptChecks,
  accentColor = "blue",
  embedded = false,
  onCompleted,
}: ConceptChecksCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  if (!conceptChecks || conceptChecks.length === 0) return null;

  const colorStyles = {
    blue: {
      badgeBg: "bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-slate-800 dark:text-[#F4B41A]",
      border: "border-[#0D3B66]/30",
      ring: "focus:ring-[#0D3B66]",
    },
    purple: {
      badgeBg: "bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-slate-800 dark:text-[#F4B41A]",
      border: "border-[#0D3B66]/30",
      ring: "focus:ring-[#0D3B66]",
    },
    amber: {
      badgeBg: "bg-[#F4B41A]/20 text-[#855e05] dark:text-[#F4B41A]",
      border: "border-[#F4B41A]/40",
      ring: "focus:ring-[#F4B41A]",
    },
    rose: {
      badgeBg: "bg-[#9E1B1B]/10 text-[#9E1B1B]",
      border: "border-[#9E1B1B]/30",
      ring: "focus:ring-[#9E1B1B]",
    },
    emerald: {
      badgeBg: "bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-slate-800 dark:text-[#F4B41A]",
      border: "border-[#0D3B66]/30",
      ring: "focus:ring-[#0D3B66]",
    },
  }[accentColor];

  const handleSelect = (qIdx: number, option: string, targetEl?: HTMLElement) => {
    const updated = { ...selectedAnswers, [qIdx]: option };
    setSelectedAnswers(updated);
    setShowFeedback((prev) => ({ ...prev, [qIdx]: true }));

    if (Object.keys(updated).length >= conceptChecks.length) {
      onCompleted?.();
    }

    const check = conceptChecks[qIdx];
    const expected = (check?.answer || check?.correctAnswer || "").trim().toLowerCase();
    const isCorrect = option.trim().toLowerCase() === expected;
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
          : "card-skeuo bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5"
      }
    >
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border-b-2 border-slate-200 dark:border-slate-700 ${colorStyles.badgeBg}`}>
          <CheckCircle2 className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A]" />
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
          const expected = (check.answer || check.correctAnswer || "").trim().toLowerCase();
          const isCorrect = selected?.trim().toLowerCase() === expected;

          return (
            <div
              key={qIdx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 border-b-2 border-b-slate-300 dark:border-b-slate-700 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0D3B66] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {qIdx + 1}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {check.question}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {check.options?.map((opt, optIdx) => {
                  const isThisSelected = selected === opt;
                  let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 border-b-2 border-b-slate-300 dark:border-b-slate-700 hover:border-[#0D3B66]/40 active:translate-y-[1px]";

                  if (hasAnswered) {
                    if (opt.trim().toLowerCase() === expected) {
                      btnStyle = "bg-[#0D3B66]/10 dark:bg-slate-800 border-[#0D3B66] text-[#0D3B66] dark:text-[#F4B41A] font-bold border-b-2 border-b-[#082542]";
                    } else if (isThisSelected && !isCorrect) {
                      btnStyle = "bg-[#9E1B1B]/10 dark:bg-[#9E1B1B]/20 border-[#9E1B1B] text-[#9E1B1B] border-b-2 border-b-[#841515] font-bold";
                    } else {
                      btnStyle = "opacity-50 border-slate-200 dark:border-slate-700 text-slate-500 border-b-2 border-b-slate-300 dark:border-b-slate-700";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={(e) => handleSelect(qIdx, opt, e.currentTarget)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer min-h-[44px] touch-manipulation ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && opt.trim().toLowerCase() === expected && (
                         <CheckCircle2 className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A] shrink-0" />
                      )}
                      {hasAnswered && isThisSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#9E1B1B] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && check.explanation && (
                <div
                  className={`p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 ${
                    isCorrect
                      ? "bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-slate-800 dark:text-slate-200 border border-[#0D3B66]/20 border-b-2 border-b-[#0D3B66]/20"
                      : "bg-[#F4B41A]/15 text-[#855e05] dark:bg-slate-800 dark:text-[#F4B41A] border border-[#F4B41A]/30 border-b-2 border-b-[#DDA012]/30"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#F4B41A]" />
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
