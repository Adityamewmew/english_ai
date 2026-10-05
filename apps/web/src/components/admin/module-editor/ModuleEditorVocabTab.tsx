"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface VocabItem {
  word: string;
  translation: string;
  example: string;
  context?: string;
}

export interface ModuleEditorVocabTabProps {
  vocabItems: VocabItem[];
  setVocabItems: React.Dispatch<React.SetStateAction<VocabItem[]>>;
}

export function ModuleEditorVocabTab({
  vocabItems,
  setVocabItems,
}: ModuleEditorVocabTabProps) {
  const addVocab = () =>
    setVocabItems((prev) => [...prev, { word: "", translation: "", example: "", context: "" }]);
  const removeVocab = (idx: number) =>
    setVocabItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Daftar Kosakata Inti ({vocabItems.length})
          </h3>
          <p className="text-[11px] text-slate-500">Kosakata target yang akan dipelajari dan dilatih siswa.</p>
        </div>
        <button
          type="button"
          onClick={addVocab}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Kosakata
        </button>
      </div>

      <div className="space-y-2.5">
        {vocabItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Kata (English)"
              value={item.word}
              onChange={(e) => {
                const u = [...vocabItems];
                u[idx].word = e.target.value;
                setVocabItems(u);
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
            <input
              type="text"
              placeholder="Terjemahan (Indonesia)"
              value={item.translation}
              onChange={(e) => {
                const u = [...vocabItems];
                u[idx].translation = e.target.value;
                setVocabItems(u);
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <input
              type="text"
              placeholder="Contoh Kalimat"
              value={item.example}
              onChange={(e) => {
                const u = [...vocabItems];
                u[idx].example = e.target.value;
                setVocabItems(u);
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Konteks (Opsional)"
                value={item.context || ""}
                onChange={(e) => {
                  const u = [...vocabItems];
                  u[idx].context = e.target.value;
                  setVocabItems(u);
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => removeVocab(idx)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
