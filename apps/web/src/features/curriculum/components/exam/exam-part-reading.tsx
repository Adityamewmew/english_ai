"use client";

import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamPartReadingProps {
  readingList: any[];
  readingAnswers: Record<number, string>;
  onSelectAnswer: (qIdx: number, option: string) => void;
  onNext: () => void;
}

export function ExamPartReading({
  readingList,
  readingAnswers,
  onSelectAnswer,
  onNext,
}: ExamPartReadingProps) {
  const answeredCount = Object.keys(readingAnswers).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-[#0D3B66] dark:text-blue-400 uppercase tracking-wider">
            Bagian 1 dari 4
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Reading Comprehension & Lexicogrammar
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {answeredCount} / {readingList.length} Terjawab
        </span>
      </div>

      <div className="space-y-4">
        {readingList.map((q, qIdx) => {
          const selected = readingAnswers[qIdx];
          return (
            <Card
              key={q.id || qIdx}
              className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {qIdx + 1}
                </span>
                <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.question}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {(q.options || []).map((opt: string, optIdx: number) => {
                  const isSelected = selected === opt;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => onSelectAnswer(qIdx, opt)}
                      className={`min-h-[44px] p-3 rounded-xl text-left text-xs font-medium border transition-colors cursor-pointer flex items-center gap-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#0D3B66] ${
                        isSelected
                          ? "bg-[#0D3B66] text-white border-[#0D3B66] font-semibold"
                          : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                          isSelected
                            ? "bg-white text-[#0D3B66] border-white"
                            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Pastikan semua 15 butir soal reading telah dijawab.
        </span>
        <Button
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#082542] text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Lanjut ke Part 2 (Listening)</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
