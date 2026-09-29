"use client";

import React from "react";
import { X, BookOpen, Layers, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    module: any;
    sections: any[];
  } | null;
}

export function ModuleDetailModal({ isOpen, onClose, data }: ModuleDetailModalProps) {
  if (!isOpen || !data) return null;

  const { module: m, sections } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-blue-600">{m.id}</span>
              <Badge variant="outline" size="sm">{m.cefr}</Badge>
              {m.isExam && (
                <span className="text-[10px] font-semibold text-amber-600 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full bg-amber-50">
                  Ujian Kelulusan
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {m.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{m.objective}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Daftar {sections.length} Bagian Materi (Sections)</span>
          </div>

          {sections.map((sec, idx) => (
            <div
              key={sec.id || idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {sec.title}
                  </h5>
                </div>
                <Badge variant="secondary" size="sm" className="capitalize">
                  {sec.sectionType}
                </Badge>
              </div>

              {/* Theory Content Preview */}
              {sec.sectionType === "theory" && sec.content && (
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-7">
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {sec.content.summary}
                  </p>
                  {sec.content.rules && (
                    <div className="text-[11px] text-slate-500">
                      Tersedia {sec.content.rules.length} aturan tata bahasa & contoh kalimat.
                    </div>
                  )}
                </div>
              )}

              {/* Vocab Content Preview */}
              {sec.sectionType === "vocab" && sec.content && (
                <div className="flex flex-wrap gap-1.5 pl-7">
                  {sec.content.items?.map((item: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300"
                    >
                      <strong>{item.word}</strong>: {item.meaning}
                    </span>
                  ))}
                </div>
              )}

              {/* Dialogue Content Preview */}
              {sec.sectionType === "dialogue" && sec.content && (
                <div className="text-xs text-slate-600 dark:text-slate-300 pl-7 space-y-1">
                  <p className="italic text-slate-500 text-[11px]">
                    Konteks: {sec.content.context}
                  </p>
                  <p className="text-[11px] font-semibold text-blue-600">
                    Tersedia {sec.content.lines?.length || sec.content.dialogue?.length || 0} percakapan 2 pembicara.
                  </p>
                </div>
              )}

              {/* Practice Content Preview */}
              {sec.sectionType === "practice" && sec.content && (
                <div className="text-xs text-slate-600 dark:text-slate-300 pl-7 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3 Tahap: Shadowing Drill, Simulasi Peran, & Tantangan Spontan</span>
                  </div>
                  {sec.content.challenge?.scenario && (
                    <p className="text-[11px] text-slate-500">
                      <strong>Tantangan Spontan:</strong> &ldquo;{sec.content.challenge.scenario}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Quiz Content Preview */}
              {sec.sectionType === "quiz" && sec.content && (
                <div className="text-xs text-slate-600 dark:text-slate-300 pl-7">
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{sec.content.questions?.length || 0} Pertanyaan Pilihan Ganda & Penjelasan</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
