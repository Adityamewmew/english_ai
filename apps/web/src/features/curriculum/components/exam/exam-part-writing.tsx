"use client";

import React from "react";
import { PenTool, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamPartWritingProps {
  writingList: any[];
  writingAnswers: Record<number, string>;
  onChangeAnswer: (qIdx: number, val: string) => void;
  onNext: () => void;
  isCompleted?: boolean;
  isAdmin?: boolean;
}

export function ExamPartWriting({
  writingList,
  writingAnswers,
  onChangeAnswer,
  onNext,
  isCompleted = false,
  isAdmin = false,
}: ExamPartWritingProps) {
  const answeredCount = writingList.filter((_, idx) => (writingAnswers[idx] || "").trim().length > 0).length;
  const canProceed = isCompleted || isAdmin;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Part 3 of 4
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Written Production & Syntax Construction
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {answeredCount} / {writingList.length} Completed
        </span>
      </div>

      <div className="space-y-4">
        {writingList.map((item, qIdx) => {
          const ans = writingAnswers[qIdx] || "";
          return (
            <Card
              key={item.id || qIdx}
              className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {qIdx + 1}
                </span>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {item.typeLabel || item.type || "Sentence Transformation"}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {item.instruction || "Complete or construct the sentence according to the instructions below:"}
                  </div>
                  {(() => {
                    const rawPrompt = item.promptText || item.sentence || item.prompt;
                    if (!rawPrompt) return null;
                    const promptStr = typeof rawPrompt === "string" ? rawPrompt : rawPrompt?.text || rawPrompt?.prompt || rawPrompt?.sentence || String(rawPrompt ?? "");
                    return (
                      <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-sm font-bold text-slate-900 dark:text-white font-mono leading-relaxed shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-rose-700 dark:text-rose-400 block mb-1">
                          Target Sentence / Prompt:
                        </span>
                        {promptStr}
                      </div>
                    );
                  })()}
                  {item.hint && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Hint: {item.hint}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                rows={2}
                value={ans}
                onChange={(e) => onChangeAnswer(qIdx, e.target.value)}
                placeholder="Type your revised sentence construction or answer here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 leading-relaxed"
              />
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-xs">
          {!canProceed ? (
            <span className="font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 inline-block">
              Selesaikan seluruh {writingList.length} soal writing ({writingList.length - answeredCount} soal belum dijawab).
            </span>
          ) : (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-block">
              ✓ Seluruh {writingList.length} soal writing telah selesai ditulis!
            </span>
          )}
        </div>
        <Button
          disabled={!canProceed}
          onClick={onNext}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-xs inline-flex items-center justify-center gap-2 ${
            !canProceed
              ? "opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-700 text-slate-500"
              : "bg-rose-600 hover:bg-rose-700 cursor-pointer"
          }`}
        >
          <span>Continue to Part 4 (Speaking)</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
