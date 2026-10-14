"use client";

import React from "react";
import { Volume2, ArrowRight, BookOpen } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound } from "@/lib/sound-fx";

interface ListeningOverviewStageProps {
  dialogueSec: any;
  theorySec?: any;
  tutor: any;
  onGoToDialogue: () => void;
}

export function ListeningOverviewStage({
  dialogueSec,
  theorySec,
  tutor,
  onGoToDialogue,
}: ListeningOverviewStageProps) {
  const context =
    dialogueSec?.content?.context ||
    "Dua siswa, Jamie dan Marta, bertemu di depan gerbang sekolah dan saling menyapa.";
  const keyPhrases = theorySec?.content?.keyPhrases || [
    { phrase: "Nice to meet you", meaning: "Senang berkenalan denganmu" },
    { phrase: "Where are you from?", meaning: "Dari mana kamu berasal?" },
    { phrase: "I'm from...", meaning: "Saya berasal dari..." },
    { phrase: "What's your name?", meaning: "Siapa namamu?" },
  ];

  const handlePlayPhrase = (phrase: string, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    tutor.playTutorAudio(phrase);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Mission Context Card */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A]">
          <BookOpen className="w-4 h-4" />
          <span className="uppercase tracking-wider font-mono">
            Konteks Percakapan
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {context}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dengarkan bagaimana Jamie dan Marta berkenalan, menanyakan asal negara, dan bercakap-cakap dengan tempo santai.
        </p>
      </div>

      {/* 2. Key Phrases Ear Prep */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Frasa Kunci yang Perlu Didengar
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dengarkan pelafalan frasa-frasa penting ini sebelum menyimak percakapan utuh:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {keyPhrases.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-[#0D3B66] dark:text-[#F4B41A] block">
                  &ldquo;{item.phrase}&rdquo;
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {item.meaning}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handlePlayPhrase(item.phrase, e)}
                className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0D3B66] dark:text-[#F4B41A] transition-colors cursor-pointer shrink-0"
                title="Dengarkan pengucapan"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Direct Clear Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onGoToDialogue}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <span>Mulai Dengarkan Percakapan (Langkah 2)</span>
          <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
        </button>
      </div>
    </div>
  );
}
