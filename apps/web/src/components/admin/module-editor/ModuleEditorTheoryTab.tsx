"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface RuleItem {
  pattern: string;
  meaning: string;
  example: string;
}

export interface CommonTrapState {
  trapTitle: string;
  explanation: string;
  wrong: string;
  correct: string;
}

export interface ModuleEditorTheoryTabProps {
  summary: string;
  setSummary: (v: string) => void;
  rules: RuleItem[];
  setRules: React.Dispatch<React.SetStateAction<RuleItem[]>>;
  commonTrap: CommonTrapState;
  setCommonTrap: React.Dispatch<React.SetStateAction<CommonTrapState>>;
}

export function ModuleEditorTheoryTab({
  summary,
  setSummary,
  rules,
  setRules,
  commonTrap,
  setCommonTrap,
}: ModuleEditorTheoryTabProps) {
  const addRule = () => setRules((prev) => [...prev, { pattern: "", meaning: "", example: "" }]);
  const removeRule = (idx: number) => setRules((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Ringkasan Konsep Teori (Summary)
        </label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Penjelasan ringkas mengenai konsep tata bahasa atau formula utama materi ini."
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Kaidah / Pola Pembentukan Kalimat (Rules)
          </label>
          <button
            type="button"
            onClick={addRule}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Aturan
          </button>
        </div>

        {rules.map((rule, idx) => (
          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Kaidah #{idx + 1}</span>
              <button type="button" onClick={() => removeRule(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Pola/Formula (e.g. Subject + must + V1)"
                value={rule.pattern}
                onChange={(e) => {
                  const updated = [...rules];
                  updated[idx].pattern = e.target.value;
                  setRules(updated);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Arti/Konteks (e.g. Menyatakan keharusan mutlak)"
                value={rule.meaning}
                onChange={(e) => {
                  const updated = [...rules];
                  updated[idx].meaning = e.target.value;
                  setRules(updated);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Contoh Kalimat (e.g. You must wear a helmet.)"
                value={rule.example}
                onChange={(e) => {
                  const updated = [...rules];
                  updated[idx].example = e.target.value;
                  setRules(updated);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Common Trap */}
      <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Peringatan Kesalahan Umum (Common Trap)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Judul Kesalahan (e.g. Salah meletakkan kata kerja)"
            value={commonTrap.trapTitle}
            onChange={(e) => setCommonTrap((prev) => ({ ...prev, trapTitle: e.target.value }))}
            className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900"
          />
          <input
            type="text"
            placeholder="Penjelasan Jebakan"
            value={commonTrap.explanation}
            onChange={(e) => setCommonTrap((prev) => ({ ...prev, explanation: e.target.value }))}
            className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900"
          />
          <input
            type="text"
            placeholder="Contoh SALAH (Wrong)"
            value={commonTrap.wrong}
            onChange={(e) => setCommonTrap((prev) => ({ ...prev, wrong: e.target.value }))}
            className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-rose-600 font-medium"
          />
          <input
            type="text"
            placeholder="Contoh BENAR (Correct)"
            value={commonTrap.correct}
            onChange={(e) => setCommonTrap((prev) => ({ ...prev, correct: e.target.value }))}
            className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-emerald-600 font-medium"
          />
        </div>
      </div>
    </div>
  );
}
