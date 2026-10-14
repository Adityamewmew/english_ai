"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Volume2,
  RotateCcw,
  ArrowRight,
  Puzzle,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import {
  playPopSound,
  playSnapSound,
  playMatchSuccessSound,
} from "@/lib/sound-fx";

export interface SentenceBuilderTarget {
  id: string;
  category: string;
  meaning: string;
  tokens: string[];
  fullSentence: string;
}

interface WritingSentenceBuilderProps {
  practiceSec?: any;
  onRewardXp: (amount: number) => void;
  tutor: any;
  onGoToNext?: () => void;
}

export function WritingSentenceBuilder({
  practiceSec,
  onRewardXp,
  tutor,
  onGoToNext,
}: WritingSentenceBuilderProps) {
  const targets: SentenceBuilderTarget[] =
    practiceSec?.content?.sentenceBuilderTargets || [];

  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const currentTarget = targets[currentTargetIdx] || {
    id: "empty",
    category: "Writing",
    meaning: "Pilih kata untuk menyusun kalimat.",
    tokens: [],
    fullSentence: "",
  };

  // Helper to shuffle
  const shuffleWords = (arr: string[]) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const [availableWords, setAvailableWords] = useState<string[]>(() =>
    shuffleWords(currentTarget.tokens)
  );
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [builderStatus, setBuilderStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [completedTargets, setCompletedTargets] = useState<Record<string, boolean>>({});

  const handleWordClick = (word: string, fromSelected: boolean, index: number) => {
    playSnapSound();
    if (fromSelected) {
      setSelectedWords((prev) => prev.filter((_, i) => i !== index));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      setAvailableWords((prev) => prev.filter((_, i) => i !== index));
      setSelectedWords((prev) => [...prev, word]);
    }
    setBuilderStatus("idle");
  };

  const handleCheckSentence = () => {
    const built = selectedWords.join(" ").toLowerCase();
    const target = currentTarget.tokens.join(" ").toLowerCase();

    if (built === target) {
      playMatchSuccessSound();
      setBuilderStatus("correct");
      if (!completedTargets[currentTarget.id]) {
        setCompletedTargets((prev) => ({ ...prev, [currentTarget.id]: true }));
        onRewardXp(20);
      }
    } else {
      playPopSound();
      setBuilderStatus("wrong");
    }
  };

  const handleNextTarget = () => {
    playSnapSound();
    if (currentTargetIdx + 1 < targets.length) {
      const nextIdx = currentTargetIdx + 1;
      setCurrentTargetIdx(nextIdx);
      const nextTarget = targets[nextIdx];
      setAvailableWords(shuffleWords(nextTarget.tokens));
      setSelectedWords([]);
      setBuilderStatus("idle");
    } else if (onGoToNext) {
      onGoToNext();
    }
  };

  const handleResetCurrent = () => {
    playPopSound();
    setAvailableWords(shuffleWords(currentTarget.tokens));
    setSelectedWords([]);
    setBuilderStatus("idle");
  };

  const handleListenTarget = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    tutor?.playTutorAudio?.(currentTarget.fullSentence);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 3 · Word Chip Sentence Builder ({currentTargetIdx + 1}/{targets.length})
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            Kategori: {currentTarget.category}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Susun Balok Kata Menjadi Kalimat Utuh
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Ketuk balok kata di bawah untuk memindahkannya ke kanvas kalimat sesuai urutan sintaksis yang tepat.
        </p>
      </div>

      {/* Target Navigation Badges */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-fit">
        {targets.map((t: SentenceBuilderTarget, idx: number) => {
          const isDone = completedTargets[t.id];
          const isActive = idx === currentTargetIdx;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playPopSound();
                setCurrentTargetIdx(idx);
                setAvailableWords(shuffleWords(t.tokens));
                setSelectedWords([]);
                setBuilderStatus("idle");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>Kalimat {idx + 1}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#F4B41A]" />}
            </button>
          );
        })}
      </div>

      {/* Main Builder Box */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
        {/* Meaning Prompt */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
              Arti Kalimat Sasaran:
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              &ldquo;{currentTarget.meaning}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={handleListenTarget}
            className="p-2.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 text-[#0D3B66] dark:text-[#F4B41A] transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Dengarkan pengucapan kalimat sasaran"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Words Canvas */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300">
              Kanvas Kalimat:
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              Klik balok untuk mengembalikan ke bank kata
            </span>
          </div>
          <div className="min-h-[80px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-[#0D3B66]/30 dark:border-[#F4B41A]/30 flex flex-wrap items-center gap-2">
            {selectedWords.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                Ketuk kata dari bank kata di bawah untuk mulai menyusun kalimat...
              </span>
            ) : (
              selectedWords.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  onClick={() => handleWordClick(word, true, idx)}
                  className="px-3.5 py-2 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {word}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Word Bank */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
            Bank Kata:
          </span>
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, idx) => (
              <button
                key={`${word}-${idx}`}
                type="button"
                onClick={() => handleWordClick(word, false, idx)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 hover:border-[#0D3B66] dark:hover:border-[#F4B41A] transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {word}
              </button>
            ))}
            {availableWords.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                Semua kata telah dimasukkan ke kanvas kalimat.
              </span>
            )}
          </div>
        </div>

        {/* Feedback & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Susunan</span>
          </button>

          <div className="flex items-center gap-3">
            {builderStatus === "correct" && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Susunan Tepat (+20 XP)!</span>
              </span>
            )}
            {builderStatus === "wrong" && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Susunan belum sesuai, coba atur kembali.
              </span>
            )}

            {builderStatus === "correct" &&
            currentTargetIdx + 1 < targets.length ? (
              <button
                type="button"
                onClick={handleNextTarget}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Kalimat Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCheckSentence}
                disabled={selectedWords.length === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs"
              >
                <span>Periksa Susunan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
