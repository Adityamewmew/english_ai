"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface ExamProgressHeaderProps {
  currentPart: number;
  totalParts?: number;
  partTitle: string;
  partAnswered: number;
  partTotal: number;
  totalAnswered: number;
  grandTotal?: number;
}

export function ExamProgressHeader({
  currentPart,
  totalParts = 4,
  partTitle,
  partAnswered,
  partTotal,
  totalAnswered,
  grandTotal = 55,
}: ExamProgressHeaderProps) {
  // 50-minute exam timer
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  const grandPercent = Math.min(100, Math.round((totalAnswered / Math.max(1, grandTotal)) * 100));

  return (
    <div className="sticky top-2 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Part {currentPart} of {totalParts} · {partTitle}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              Exam Progress: {totalAnswered} / {grandTotal} Answered ({grandPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            This Part: {partAnswered}/{partTotal}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Cumulative 55-question progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 rounded-full"
          style={{ width: `${grandPercent}%` }}
        />
      </div>
    </div>
  );
}

