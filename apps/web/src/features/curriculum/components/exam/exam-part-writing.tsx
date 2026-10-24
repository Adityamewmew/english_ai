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
}

export function ExamPartWriting({
  writingList,
  writingAnswers,
  onChangeAnswer,
  onNext,
}: ExamPartWritingProps) {
  const answeredCount = Object.keys(writingAnswers).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Bagian 3 dari 4
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Written Production & Syntax Construction
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {answeredCount} / {writingList.length} Terisi
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
                    {item.instruction || "Lengkapi atau susun kalimat sesuai instruksi di bawah ini:"}
                  </div>
                  {(item.promptText || item.prompt || item.sentence) && (
                    <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-sm font-bold text-slate-900 dark:text-white font-mono leading-relaxed shadow-2xs">
                      <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-rose-700 dark:text-rose-400 block mb-1">
                        Kalimat Target / Bahan:
                      </span>
                      {item.promptText || item.sentence || item.prompt}
                    </div>
                  )}
                  {item.hint && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Petunjuk: {item.hint}
                    </div>
                  )}
                </div>
              </div>

              <textarea
                rows={2}
                value={ans}
                onChange={(e) => onChangeAnswer(qIdx, e.target.value)}
                placeholder="Tuliskan konstruksi kalimat perbaikan atau jawabanmu di sini..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 leading-relaxed"
              />
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Tuntaskan 10 soal penulisan sebelum masuk ke ujian speaking lisan.
        </span>
        <Button
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Lanjut ke Part 4 (Speaking)</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
