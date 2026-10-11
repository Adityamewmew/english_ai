"use client";

import React, { useState } from "react";
import { Volume2, RotateCw } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  collocation?: string;
}

interface InteractiveVocabCardProps {
  item: VocabItem;
  onPlayAudio?: (text: string) => void;
}

export function InteractiveVocabCard({ item, onPlayAudio }: InteractiveVocabCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setIsFlipped((prev) => !prev);
  };

  const handleAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    animeButtonPop(e.currentTarget as HTMLElement);
    onPlayAudio?.(text);
  };

  return (
    <div
      onClick={handleFlip}
      style={{ perspective: "1000px" }}
      className="group relative h-48 sm:h-52 w-full cursor-pointer select-none"
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="relative h-full w-full rounded-2xl shadow-xs hover:shadow-md"
      >
        {/* Front Face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="absolute inset-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Target Word
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {item.word}
              </h4>
              {item.ipa && (
                <span className="inline-block mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {item.ipa}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => handleAudio(e, item.word)}
              className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 transition-colors shrink-0 cursor-pointer shadow-xs"
              title={`Listen to pronunciation of "${item.word}"`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-500">Tap to see meaning</span>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Flip</span>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 rounded-2xl bg-indigo-50/80 dark:bg-slate-900 border border-indigo-200/90 dark:border-indigo-900/60 p-5 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300 tracking-wider">
                Definition & Meaning
              </span>
              <button
                type="button"
                onClick={(e) => handleAudio(e, item.collocation || item.meaning)}
                className="p-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                title="Listen to example sentence"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
              {item.meaning}
            </p>
            {item.collocation && (
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700 text-[11px] text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                <span className="font-bold block text-indigo-600 dark:text-indigo-400 text-[10px] uppercase">
                  Example:
                </span>
                &ldquo;{item.collocation}&rdquo;
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-indigo-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {item.word}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Tap to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}
