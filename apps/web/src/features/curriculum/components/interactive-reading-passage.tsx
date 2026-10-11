"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Volume2, Play, Pause, Sparkles } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface ReadingPassage {
  title: string;
  paragraphs: string[];
  audioText?: string;
}

interface InteractiveReadingPassageProps {
  passage: ReadingPassage;
  onPlayAudio?: (text: string) => void;
  embedded?: boolean;
}

export function InteractiveReadingPassage({
  passage,
  onPlayAudio,
  embedded = false,
}: InteractiveReadingPassageProps) {
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);

  // Split all paragraphs into individual sentences
  const sentences = passage.paragraphs
    .flatMap((p) => p.match(/[^.!?]+[.!?]+(\s+|$)/g) || [p])
    .map((s) => s.trim())
    .filter(Boolean);

  const handlePlaySentence = (idx: number, text: string, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    setActiveSentenceIndex(idx);
    onPlayAudio?.(text);
  };

  const handlePlayFull = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setIsPlayingFull(true);
    setActiveSentenceIndex(0);
    onPlayAudio?.(passage.audioText || passage.paragraphs.join(" "));

    // Auto advance highlight through sentences based on average speech speed
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < sentences.length) {
        setActiveSentenceIndex(currentIdx);
      } else {
        clearInterval(interval);
        setIsPlayingFull(false);
      }
    }, 3800);
  };

  return (
    <div
      className={
        embedded
          ? "space-y-5"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
      }
    >
      {/* Header with Title and Full Audio Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                Step 4 · Guided Interactive Reading
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                Karaoke Audio
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {passage.title}
            </h3>
          </div>
        </div>

        {passage.audioText && (
          <button
            type="button"
            onClick={handlePlayFull}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer ${
              isPlayingFull
                ? "bg-blue-600 text-white animate-pulse"
                : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
            }`}
          >
            {isPlayingFull ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingFull ? "Playing Full Audio..." : "Play Full Passage Audio"}</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>💡 Tap any sentence below to listen to its pronunciation individually:</span>
        {activeSentenceIndex !== null && (
          <span className="font-bold text-blue-600 dark:text-blue-400">
            Sentence {activeSentenceIndex + 1} of {sentences.length}
          </span>
        )}
      </div>

      {/* Interactive Sentence-by-Sentence Board */}
      <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        {sentences.map((sentence, sIdx) => {
          const isActive = activeSentenceIndex === sIdx;

          return (
            <div
              key={sIdx}
              onClick={(e) => handlePlaySentence(sIdx, sentence, e)}
              className={`p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer select-none ${
                isActive
                  ? "bg-blue-100/90 dark:bg-blue-950/80 border-2 border-blue-500 shadow-xs ring-2 ring-blue-400/20"
                  : "bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-colors shrink-0 mt-0.5 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              <span
                className={`text-sm leading-relaxed font-medium ${
                  isActive
                    ? "text-blue-950 dark:text-blue-100 font-bold"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {sentence}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
