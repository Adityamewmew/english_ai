"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface QuizQuestionItem {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleEditorQuizTabProps {
  quizQuestions: QuizQuestionItem[];
  setQuizQuestions: React.Dispatch<React.SetStateAction<QuizQuestionItem[]>>;
}

export function ModuleEditorQuizTab({
  quizQuestions,
  setQuizQuestions,
}: ModuleEditorQuizTabProps) {
  const addQuizQuestion = () =>
    setQuizQuestions((prev) => [
      ...prev,
      { prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
    ]);
  const removeQuizQuestion = (idx: number) =>
    setQuizQuestions((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Soal Kuis Evaluasi ({quizQuestions.length})
          </h3>
          <p className="text-[11px] text-slate-500">Soal pilihan ganda yang menguji pemahaman akhir modul siswa.</p>
        </div>
        <button
          type="button"
          onClick={addQuizQuestion}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Soal Kuis
        </button>
      </div>

      <div className="space-y-4">
        {quizQuestions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Soal #{qIdx + 1}</span>
              <button
                type="button"
                onClick={() => removeQuizQuestion(qIdx)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pertanyaan</label>
              <input
                type="text"
                value={q.prompt}
                onChange={(e) => {
                  const u = [...quizQuestions];
                  u[qIdx].prompt = e.target.value;
                  setQuizQuestions(u);
                }}
                placeholder="Tuliskan pertanyaan kuis..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct_q_${qIdx}`}
                    checked={q.correctIndex === optIdx}
                    onChange={() => {
                      const u = [...quizQuestions];
                      u[qIdx].correctIndex = optIdx;
                      setQuizQuestions(u);
                    }}
                    className="w-4 h-4 text-emerald-600"
                    title="Tandai sebagai kunci jawaban"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const u = [...quizQuestions];
                      u[qIdx].options[optIdx] = e.target.value;
                      setQuizQuestions(u);
                    }}
                    placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border ${
                      q.correctIndex === optIdx
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-semibold"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div>
              <input
                type="text"
                value={q.explanation || ""}
                onChange={(e) => {
                  const u = [...quizQuestions];
                  u[qIdx].explanation = e.target.value;
                  setQuizQuestions(u);
                }}
                placeholder="Penjelasan jawaban benar..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
