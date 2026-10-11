"use client";

import React, { useState } from "react";
import { CheckCircle2, Sparkles, Volume2, RotateCcw, AlertCircle, HelpCircle } from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";

export interface SpotSentence {
  id: string;
  originalTokens: Array<{
    text: string;
    needsFix: boolean;
    fixedText: string;
    ruleLabel: string;
    trailingPunctuation?: string;
  }>;
  translation: string;
}

const DEFAULT_SENTENCES: SpotSentence[] = [
  {
    id: "sent-1",
    translation: "Dia orang Italia dan dia berasal dari Italia.",
    originalTokens: [
      { text: "she", needsFix: true, fixedText: "She", ruleLabel: "Awal Kalimat" },
      { text: "is", needsFix: false, fixedText: "is", ruleLabel: "" },
      { text: "italian", needsFix: true, fixedText: "Italian", ruleLabel: "Kewarganegaraan", trailingPunctuation: "." },
      { text: "she", needsFix: true, fixedText: "She", ruleLabel: "Awal Kalimat" },
      { text: "is", needsFix: false, fixedText: "is", ruleLabel: "" },
      { text: "from", needsFix: false, fixedText: "from", ruleLabel: "" },
      { text: "italy", needsFix: true, fixedText: "Italy", ruleLabel: "Nama Negara", trailingPunctuation: "." },
    ],
  },
  {
    id: "sent-2",
    translation: "Saya berasal dari Tokyo, Jepang.",
    originalTokens: [
      { text: "i", needsFix: true, fixedText: "I", ruleLabel: "Kata Ganti 'I'" },
      { text: "am", needsFix: false, fixedText: "am", ruleLabel: "" },
      { text: "from", needsFix: false, fixedText: "from", ruleLabel: "" },
      { text: "tokyo", needsFix: true, fixedText: "Tokyo", ruleLabel: "Nama Kota", trailingPunctuation: "," },
      { text: "japan", needsFix: true, fixedText: "Japan", ruleLabel: "Nama Negara", trailingPunctuation: "." },
    ],
  },
  {
    id: "sent-3",
    translation: "Marco bukan orang Prancis. Dia orang Spanyol.",
    originalTokens: [
      { text: "marco", needsFix: true, fixedText: "Marco", ruleLabel: "Nama Orang" },
      { text: "isn't", needsFix: false, fixedText: "isn't", ruleLabel: "" },
      { text: "french", needsFix: true, fixedText: "French", ruleLabel: "Kewarganegaraan", trailingPunctuation: "." },
      { text: "he", needsFix: true, fixedText: "He", ruleLabel: "Awal Kalimat" },
      { text: "is", needsFix: false, fixedText: "is", ruleLabel: "" },
      { text: "spanish", needsFix: true, fixedText: "Spanish", ruleLabel: "Kewarganegaraan", trailingPunctuation: "." },
    ],
  },
];

interface SpotAndFixMechanicsProps {
  onRewardXp: (amount: number) => void;
  rules?: Array<{ rule: string; explanation: string; example?: string }>;
}

export function SpotAndFixMechanics({ onRewardXp, rules }: SpotAndFixMechanicsProps) {
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(0);
  const [fixedState, setFixedState] = useState<Record<string, Record<number, boolean>>>({});
  const [completedSentences, setCompletedSentences] = useState<Record<string, boolean>>({});
  const [showRulesModal, setShowRulesModal] = useState(false);

  const sentence = DEFAULT_SENTENCES[activeSentenceIdx];
  const currentFixedMap = fixedState[sentence.id] || {};

  const totalFixesNeeded = sentence.originalTokens.filter((t) => t.needsFix).length;
  const currentFixesDone = sentence.originalTokens.filter(
    (t, idx) => t.needsFix && currentFixedMap[idx]
  ).length;

  const isCurrentSentenceComplete = currentFixesDone === totalFixesNeeded;

  const handleTokenClick = (idx: number) => {
    const token = sentence.originalTokens[idx];
    if (!token.needsFix) {
      playPopSound();
      return;
    }

    if (currentFixedMap[idx]) {
      return; // already fixed
    }

    playSnapSound();
    const nextMap = { ...currentFixedMap, [idx]: true };
    setFixedState((prev) => ({
      ...prev,
      [sentence.id]: nextMap,
    }));

    // Check if that was the last fix for this sentence
    const fixesDoneCount = sentence.originalTokens.filter(
      (t, i) => t.needsFix && nextMap[i]
    ).length;

    if (fixesDoneCount === totalFixesNeeded && !completedSentences[sentence.id]) {
      playMatchSuccessSound();
      setCompletedSentences((prev) => ({ ...prev, [sentence.id]: true }));
      onRewardXp(15);
    }
  };

  const handleReset = () => {
    playPopSound();
    setFixedState((prev) => ({ ...prev, [sentence.id]: {} }));
  };

  const handleSpeakSentence = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const fullText = sentence.originalTokens
        .map((t) => `${t.fixedText}${t.trailingPunctuation || ""}`)
        .join(" ");
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar with tabs and rules helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-fit">
          {DEFAULT_SENTENCES.map((s, idx) => {
            const isDone = completedSentences[s.id];
            const isActive = idx === activeSentenceIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveSentenceIdx(idx);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>Tantangan {idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowRulesModal(!showRulesModal)}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showRulesModal ? "Sembunyikan Aturan" : "Lihat Aturan Penulisan"}</span>
        </button>
      </div>

      {/* Rules cheat-sheet if toggled */}
      {showRulesModal && (
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-3 animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider font-mono">
            Aturan Baku Huruf Kapital (Capitalization Guidelines)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/50 dark:border-amber-900/40">
              <span className="font-bold block text-amber-700 dark:text-amber-400 mb-0.5">1. Awal Kalimat & Kata 'I'</span>
              <p className="text-[11px] text-slate-500 leading-snug">Kata pertama dalam kalimat dan kata ganti tunggal &apos;I&apos; selalu ditulis huruf besar.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/50 dark:border-amber-900/40">
              <span className="font-bold block text-amber-700 dark:text-amber-400 mb-0.5">2. Negara & Warga Negara</span>
              <p className="text-[11px] text-slate-500 leading-snug">Nama negara (Japan) dan kata sifat kebangsaan (Japanese) wajib berawalan kapital.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/50 dark:border-amber-900/40">
              <span className="font-bold block text-amber-700 dark:text-amber-400 mb-0.5">3. Nama Orang & Tempat</span>
              <p className="text-[11px] text-slate-500 leading-snug">Nama orang (Marco, Sarah) dan kota (Tokyo, London) selalu berhuruf besar.</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Spot & Fix Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
        {/* Instruction header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono block">
              Spot & Fix Interaktif
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ketuk kata yang salah (huruf kecil) untuk mengubahnya menjadi huruf kapital yang benar:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {currentFixesDone}/{totalFixesNeeded} Diperbaiki
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="Reset kalimat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Clickable Sentence Words */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-2.5 min-h-[90px]">
          {sentence.originalTokens.map((token, idx) => {
            const isFixed = currentFixedMap[idx];
            const isCorrect = !token.needsFix || isFixed;

            return (
              <div key={idx} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => handleTokenClick(idx)}
                  className={`group relative px-3 py-1.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer select-none ${
                    isFixed
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs"
                      : token.needsFix
                      ? "bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70 hover:scale-105 active:scale-95 animate-pulse"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <span>{isFixed ? token.fixedText : token.text}</span>

                  {/* Micro badge indicator */}
                  {token.needsFix && !isFixed && (
                    <span className="ml-1.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono">
                      Fix?
                    </span>
                  )}

                  {isFixed && token.ruleLabel && (
                    <span className="ml-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ✓ {token.ruleLabel}
                    </span>
                  )}
                </button>
                {token.trailingPunctuation && (
                  <span className="font-mono text-slate-600 dark:text-slate-300 text-sm ml-0.5 mr-1 font-bold">
                    {token.trailingPunctuation}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Translation & Audio */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
            Artinya: &ldquo;{sentence.translation}&rdquo;
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakSentence}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Dengarkan Kalimat</span>
            </button>

            {isCurrentSentenceComplete && activeSentenceIdx < DEFAULT_SENTENCES.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveSentenceIdx((prev) => prev + 1);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all hover:opacity-90 cursor-pointer shadow-xs"
              >
                <span>Tantangan Berikutnya</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
