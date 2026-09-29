"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, CheckCircle, Volume2, FileText } from "lucide-react";

interface QuestionItem {
  id: string;
  skill: string;
  cefr: string;
  type: string;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  audioScript?: string;
}

interface QuestionListTableProps {
  questions: QuestionItem[];
}

const skillColorMap: Record<string, string> = {
  grammar: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300",
  listening: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  reading: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  writing: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  speaking: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
};

export function QuestionListTable({ questions }: QuestionListTableProps) {
  if (questions.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tidak Ada Soal Ditemukan</h4>
        <p className="text-xs text-slate-500 mt-1">Sesuaikan kata kunci atau filter di atas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">ID & Klasifikasi</th>
              <th className="py-3 px-4">Pertanyaan / Instruksi</th>
              <th className="py-3 px-4">Pilihan Jawaban</th>
              <th className="py-3 px-4">Kunci & Penjelasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {questions.map((q) => {
              const skillClass =
                skillColorMap[q.skill.toLowerCase()] ||
                "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors align-top">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                      {q.id}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {q.cefr}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${skillClass} capitalize`}>
                        {q.skill}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-md">
                    <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </p>
                    {q.audioScript && (
                      <div className="mt-2 p-2 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg text-[11px] text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/40 flex items-start gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Audio Script: </span>
                          <span>&ldquo;{q.audioScript}&rdquo;</span>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-1">
                        {q.options.map((opt, i) => {
                          const isCorrect = opt.trim() === q.answer.trim();
                          return (
                            <div
                              key={i}
                              className={`px-2.5 py-1 rounded-lg text-[11px] border ${
                                isCorrect
                                  ? "bg-emerald-50 text-emerald-800 font-bold border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <span>{String.fromCharCode(65 + i)}. {opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Bentuk Isian Bebas</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{q.answer}</span>
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-3">
                        {q.explanation}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
