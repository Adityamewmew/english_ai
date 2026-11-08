"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";
import { useSession } from "@/features/auth/hooks/use-session";
import { isUserAdmin } from "@/lib/auth-utils";

interface ConceptCheckQuestion {
  question: string;
  options: string[];
  answer?: string;
  correctAnswer?: string;
  correctIndex?: number;
  explanation?: string;
}

interface ConceptChecksCardProps {
  conceptChecks: ConceptCheckQuestion[];
  accentColor?: "blue" | "purple" | "amber" | "rose" | "emerald";
  embedded?: boolean;
  isAdmin?: boolean;
  onCompleted?: () => void;
  onAnswersChange?: (answers: Record<string, any>) => void;
  initialAnswers?: Record<string | number, string>;
}

export function isOptionCorrect(
  optText: string,
  optIdx: number,
  check: ConceptCheckQuestion
): boolean {
  if (typeof (check as any).correctIndex === "number" && (check as any).correctIndex === optIdx) {
    return true;
  }

  const rawAns = check.answer ?? check.correctAnswer;
  if (rawAns === undefined || rawAns === null) return false;

  const ansStr = String(rawAns).trim();
  // 1. Single letter option index (A, B, C, D)
  if (/^[a-dA-D]$/.test(ansStr)) {
    const targetIdx = ansStr.toUpperCase().charCodeAt(0) - 65;
    return optIdx === targetIdx;
  }

  const clean = (s: string) =>
    (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const cOpt = clean(optText);
  const cAns = clean(ansStr);

  if (cOpt === cAns) return true;

  // 2. Substring overlap (e.g. quote from text vs paraphrase)
  if (cOpt.length > 5 && cAns.length > 5) {
    if (cAns.includes(cOpt) || cOpt.includes(cAns)) return true;
  }

  // 3. Word stem overlap (robust against verb tense / plural variations / minor word shifts)
  const stem = (w: string) => (w.length > 4 ? w.slice(0, 4) : w);
  const wordsOpt = cOpt.split(" ").filter((w) => w.length > 2);
  const wordsAns = cAns.split(" ").filter((w) => w.length > 2);
  if (wordsOpt.length > 0 && wordsAns.length > 0) {
    const stemsAns = wordsAns.map(stem);
    const commonStems = wordsOpt.filter((w) => stemsAns.includes(stem(w)));
    const overlapRatio = commonStems.length / wordsOpt.length;
    if (overlapRatio >= 0.6) return true;
  }

  return false;
}

export function ConceptChecksCard({
  conceptChecks,
  accentColor = "blue",
  embedded = false,
  isAdmin: propIsAdmin,
  onCompleted,
  onAnswersChange,
  initialAnswers,
}: ConceptChecksCardProps) {
  const { data: sessionUser } = useSession();
  const isAdmin = Boolean(propIsAdmin || isUserAdmin(sessionUser));
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(() => {
    if (!initialAnswers) return {};
    const parsed: Record<number, string> = {};
    Object.entries(initialAnswers).forEach(([k, v]) => {
      const numKey = Number(k);
      if (!isNaN(numKey) && typeof v === "string") {
        parsed[numKey] = v;
      }
    });
    return parsed;
  });

  React.useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      const parsed: Record<number, string> = {};
      Object.entries(initialAnswers).forEach(([k, v]) => {
        const numKey = Number(k);
        if (!isNaN(numKey) && typeof v === "string") {
          parsed[numKey] = v;
        }
      });
      setSelectedAnswers(parsed);
    } else {
      setSelectedAnswers({});
    }
  }, [initialAnswers]);

  React.useEffect(() => {
    if (!conceptChecks || conceptChecks.length === 0) {
      onCompleted?.();
    }
  }, [conceptChecks, onCompleted]);

  if (!conceptChecks || conceptChecks.length === 0) return null;

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = conceptChecks.length > 0 && answeredCount >= conceptChecks.length;

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
    onAnswersChange?.(updated);

    if (Object.keys(updated).length >= conceptChecks.length) {
      onCompleted?.();
    }
    if (targetEl) {
      animeButtonPop(targetEl);
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isAllAnswered
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                : answeredCount > 0
                ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {isAllAnswered
              ? `${conceptChecks.length} / ${conceptChecks.length} Selesai ✓`
              : `Dijawab: ${answeredCount} / ${conceptChecks.length}`}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onCompleted?.()}
              className="px-3.5 py-1.5 rounded-xl border border-dashed border-amber-400 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all cursor-pointer shadow-2xs"
            >
              Skip Quiz (Admin)
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {conceptChecks.map((check, qIdx) => {
          const selected = selectedAnswers[qIdx];
          const hasSelected = selected !== undefined;

          return (
            <div
              key={qIdx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 border-b-2 border-b-slate-300 dark:border-b-slate-700 space-y-3"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0D3B66] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {qIdx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {check.question}
                  </p>
                </div>
                {answeredCount > 0 && !hasSelected && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Belum Dijawab
                  </span>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {check.options?.map((opt, optIdx) => {
                  const optText = typeof opt === "string" ? opt : (opt as any)?.text || (opt as any)?.label || String(opt ?? "");
                  const isThisSelected = selected === optText;
                  const btnStyle = isThisSelected
                    ? "bg-[#0D3B66]/10 dark:bg-slate-800 border-[#0D3B66] text-[#0D3B66] dark:text-[#F4B41A] font-bold border-b-2 border-b-[#082542] ring-1 ring-[#0D3B66]/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 border-b-2 border-b-slate-300 dark:border-b-slate-700 hover:border-[#0D3B66]/40 active:translate-y-[1px]";

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={(e) => handleSelect(qIdx, optText, e.currentTarget)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer min-h-[44px] touch-manipulation ${btnStyle}`}
                    >
                      <span>{optText}</span>
                      {isThisSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0D3B66] dark:bg-[#F4B41A] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!isAllAnswered && answeredCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Masih ada <strong>{conceptChecks.length - answeredCount} soal</strong> yang belum dijawab. Lengkapi seluruh soal di atas agar tombol selesai aktif.
            </span>
          </div>
        )}

        {isAllAnswered && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Seluruh {conceptChecks.length} soal pemahaman telah dijawab! Klik tombol &quot;Finish Mission&quot; di dock bawah untuk menyelesaikan modul dan menyimpan progress.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
