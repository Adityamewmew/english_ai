"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { playPopSound, playMatchSuccessSound } from "@/lib/sound-fx";

export interface KeyConceptItem {
  id: string;
  title: string;
  description?: string;
  example?: string;
}

interface KeyConceptsGridProps {
  concepts: KeyConceptItem[];
  onCheckItem?: (id: string) => void;
}

export function KeyConceptsGrid({ concepts, onCheckItem }: KeyConceptsGridProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
      playPopSound();
    } else {
      next.add(id);
      playMatchSuccessSound();
      onCheckItem?.(id);
    }
    setCheckedIds(next);
  };

  if (!concepts || concepts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Key Concepts
        </h4>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {checkedIds.size}/{concepts.length} Understood
        </span>
      </div>

      {/* 2x2 Clean Grid matching Gambar 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {concepts.map((item) => {
          const isChecked = checkedIds.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-start gap-3.5 ${
                isChecked
                  ? "bg-slate-50/80 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              {/* Minimalist Checkmark Square (Gambar 1 style) */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 border ${
                  isChecked
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent hover:border-slate-300"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold leading-snug transition-colors ${
                    isChecked
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                )}
                {item.example && (
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      Eg: {item.example}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
