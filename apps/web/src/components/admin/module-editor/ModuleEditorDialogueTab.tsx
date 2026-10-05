"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

export interface ModuleEditorDialogueTabProps {
  dialogueContext: string;
  setDialogueContext: (v: string) => void;
  dialogueLines: DialogueLine[];
  setDialogueLines: React.Dispatch<React.SetStateAction<DialogueLine[]>>;
}

export function ModuleEditorDialogueTab({
  dialogueContext,
  setDialogueContext,
  dialogueLines,
  setDialogueLines,
}: ModuleEditorDialogueTabProps) {
  const addDialogueLine = () =>
    setDialogueLines((prev) => [...prev, { speaker: "Speaker A", text: "", translation: "" }]);
  const removeDialogueLine = (idx: number) =>
    setDialogueLines((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Konteks Skenario Percakapan
        </label>
        <input
          type="text"
          value={dialogueContext}
          onChange={(e) => setDialogueContext(e.target.value)}
          placeholder="Contoh: Alex and Jordan are discussing company policy during lunchtime."
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Alur Giliran Dialog ({dialogueLines.length})
        </h3>
        <button
          type="button"
          onClick={addDialogueLine}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Baris Dialog
        </button>
      </div>

      <div className="space-y-3">
        {dialogueLines.map((line, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={line.speaker}
                onChange={(e) => {
                  const u = [...dialogueLines];
                  u[idx].speaker = e.target.value;
                  setDialogueLines(u);
                }}
                placeholder="Nama Tokoh"
                className="w-40 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => removeDialogueLine(idx)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Kalimat Bahasa Inggris"
                value={line.text}
                onChange={(e) => {
                  const u = [...dialogueLines];
                  u[idx].text = e.target.value;
                  setDialogueLines(u);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Terjemahan Bahasa Indonesia"
                value={line.translation}
                onChange={(e) => {
                  const u = [...dialogueLines];
                  u[idx].translation = e.target.value;
                  setDialogueLines(u);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
