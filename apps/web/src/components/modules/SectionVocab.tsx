import React from "react";
import { Volume2, BookOpen } from "lucide-react";

export interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  collocation?: string;
}

interface SectionVocabProps {
  title: string;
  items: VocabItem[];
  onSpeak?: (text: string) => void;
}

export function SectionVocab({ title, items, onSpeak }: SectionVocabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold uppercase tracking-wider">{title}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((v, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white">
                    {v.word}
                  </span>
                  {v.ipa && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {v.ipa}
                    </span>
                  )}
                </div>

                {onSpeak && (
                  <button
                    type="button"
                    onClick={() => onSpeak(v.word)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Dengarkan Pengucapan"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium mb-2">
                {v.meaning}
              </p>
            </div>

            {v.collocation && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Contoh: </span>
                <span className="italic">{v.collocation}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
