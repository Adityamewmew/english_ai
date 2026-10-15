"use client";

import React from "react";
import Image from "next/image";
import {
  RotateCcw,
  ArrowRight,
  BookOpen,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { playPopSound } from "@/lib/sound-fx";
import type { PracticumQuestion } from "./speaking-practicum-stage";

interface PracticumSummaryProps {
  questions: PracticumQuestion[];
  scores: Record<number, number>;
  onReset: () => void;
  onNextStep?: () => void;
}

export function PracticumSummary({
  questions,
  scores,
  onReset,
  onNextStep,
}: PracticumSummaryProps) {
  // Calculate average score
  const totalScore = questions.reduce((sum, q, idx) => sum + (scores[idx] ?? 75), 0);
  const averageScore = Math.round(totalScore / Math.max(questions.length, 1));
  const isPassed = averageScore >= 75;

  const storytellingAvg = Math.round(
    questions
      .filter((q) => q.category === "storytelling")
      .reduce((sum, _, idx) => sum + (scores[idx] ?? 80), 0) / 2
  );

  const roleplayAvg = Math.round(
    questions
      .filter((q) => q.category === "roleplay")
      .reduce((sum, _, idx) => sum + (scores[idx + 2] ?? 85), 0) / 4
  );

  const drillAvg = Math.round(
    questions
      .filter((q) => q.category === "linguistic_drill")
      .reduce((sum, _, idx) => sum + (scores[idx + 6] ?? 80), 0) / 4
  );

  return (
    <div
      className={`p-6 sm:p-8 rounded-[28px] bg-white dark:bg-slate-900 border-2 shadow-md space-y-6 ${
        isPassed
          ? "border-emerald-400 dark:border-emerald-600"
          : "border-amber-400 dark:border-amber-600"
      }`}
    >
      {/* Header with Mr. Khoirul */}
      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="relative w-24 h-24 shrink-0 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex items-center justify-center">
          <Image
            src={
              isPassed
                ? "/illustrations/tutor/khoirul-thumbsup.png"
                : "/illustrations/tutor/khoirul-talking.png"
            }
            alt="Mr. Khoirul"
            fill
            className="object-contain p-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                isPassed
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {isPassed ? "PASSED THRESHOLD" : "BELOW 75% TARGET"}
            </span>
            <span className="text-xs font-mono text-slate-400">Target: 75%</span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isPassed
              ? "Outstanding! Speaking Practicum Completed"
              : "Good Effort! You Have Completed All Tasks"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {isPassed
              ? "Mr. Khoirul is proud of your speaking courage! All 10 challenges (free storytelling, real voice calls, and phonetic drills) have been evaluated."
              : "Your final score is below the 75% threshold. Don't be discouraged, you can retake this session to sharpen your pronunciation and flow!"}
          </p>
        </div>

        {/* Big Score Badge */}
        <div className="sm:ml-auto shrink-0 text-center px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
            Final Score
          </span>
          <span
            className={`text-3xl font-black font-mono ${
              isPassed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {averageScore}
          </span>
          <span className="text-xs font-mono text-slate-400 block">/ 100</span>
        </div>
      </div>

      {/* Category Score Breakdown (Unified Surfaces) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="p-1 rounded-md bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-[#F4B41A]/10 dark:text-[#F4B41A]">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {storytellingAvg}%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            2 Storytelling Tasks
          </span>
          <span className="text-[11px] text-slate-500">Duration &amp; narrative fluency</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="p-1 rounded-md bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-[#F4B41A]/10 dark:text-[#F4B41A]">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {roleplayAvg}%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            4 Real Roleplay Calls
          </span>
          <span className="text-[11px] text-slate-500">Two-way dialogue with Mr. Khoirul</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="p-1 rounded-md bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-[#F4B41A]/10 dark:text-[#F4B41A]">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {drillAvg}%
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            4 Phonetic &amp; Grammar Drills
          </span>
          <span className="text-[11px] text-slate-500">Oral pronunciation accuracy</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            playPopSound();
            onReset();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Practicum</span>
        </button>

        {isPassed && onNextStep && (
          <button
            type="button"
            onClick={onNextStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Continue to Next Stage</span>
            <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
          </button>
        )}
      </div>
    </div>
  );
}
