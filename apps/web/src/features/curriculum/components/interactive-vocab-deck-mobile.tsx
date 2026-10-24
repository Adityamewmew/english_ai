"use client";

import React, { useState } from "react";
import { Volume2, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  collocation?: string;
}

interface InteractiveVocabDeckMobileProps {
  items: VocabItem[];
  onPlayAudio?: (text: string) => void;
}

export function InteractiveVocabDeckMobile({
  items = [],
  onPlayAudio,
}: InteractiveVocabDeckMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleFlip = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setIsFlipped((prev) => !prev);
  };

  const handleAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    animeButtonPop(e.currentTarget as HTMLElement);
    onPlayAudio?.(text);
  };

  const handlePrev = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleSelectIndex = (idx: number, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setIsFlipped(false);
    setCurrentIndex(idx);
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Header Progress Strip */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Kartu {currentIndex + 1} dari {items.length}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          Ketuk kartu untuk membalik
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "bg-[#0D3B66] dark:bg-[#F4B41A]"
                : idx < currentIndex
                ? "bg-slate-300 dark:bg-slate-700"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* 2. Focused 3D Flashcard */}
      <div
        onClick={handleFlip}
        style={{ perspective: "1000px" }}
        className="relative h-64 w-full cursor-pointer select-none touch-manipulation"
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="relative h-full w-full rounded-2xl shadow-xs"
        >
          {/* Front Face */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className="absolute inset-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 border-b-slate-300 dark:border-b-slate-700 p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-black uppercase text-[#0D3B66] dark:text-[#F4B41A] tracking-wider">
                  Target Vocab
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {currentItem.word}
                </h4>
                {currentItem.ipa && (
                  <span className="inline-block font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {currentItem.ipa}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => handleAudio(e, currentItem.word)}
                className="w-12 h-12 rounded-xl btn-skeuo-navy text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95"
                title={`Listen to pronunciation of "${currentItem.word}"`}
              >
                <Volume2 className="w-5 h-5 text-[#F4B41A]" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500">
                View definition &amp; examples
              </span>
              <div className="flex items-center gap-1.5 text-[#0D3B66] dark:text-[#F4B41A] font-bold text-xs">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Card</span>
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
            className="absolute inset-0 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[#0D3B66]/30 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-700 p-5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-[#0D3B66] dark:text-[#F4B41A] tracking-wider">
                  Meaning &amp; Example
                </span>
                <button
                  type="button"
                  onClick={(e) => handleAudio(e, currentItem.collocation || currentItem.meaning)}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-[#0D3B66] dark:text-[#F4B41A] shrink-0 cursor-pointer"
                  title="Listen to example sentence"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentItem.meaning}
              </p>

              {currentItem.collocation && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <span className="font-bold block text-[#0D3B66] dark:text-[#F4B41A] text-[10px] uppercase mb-0.5">
                    Example Usage:
                  </span>
                  &ldquo;{currentItem.collocation}&rdquo;
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A]">
                {currentItem.word}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Tap to flip back
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Thumb-Friendly Deck Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[44px] touch-manipulation cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl btn-skeuo-navy text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[44px] touch-manipulation cursor-pointer shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Mini Word Jump Pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => handleSelectIndex(idx, e)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all min-h-[32px] touch-manipulation cursor-pointer ${
              idx === currentIndex
                ? "bg-[#0D3B66] text-white dark:bg-[#F4B41A] dark:text-[#0D3B66] shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {item.word}
          </button>
        ))}
      </div>
    </div>
  );
}
