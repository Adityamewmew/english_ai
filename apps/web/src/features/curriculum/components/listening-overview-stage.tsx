"use client";

import React from "react";
import { Volume2, BookOpen } from "lucide-react";
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
    "Listen to the conversation carefully to understand the dialogue and key expressions.";
  const keyPhrases = theorySec?.content?.keyPhrases || [];

  const handlePlayPhrase = (phrase: string, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    tutor.playTutorAudio(phrase);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Mission Context Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10375C] text-white space-y-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-white/80">
          <BookOpen className="w-4 h-4 text-[#F3C623]" />
          <span className="uppercase tracking-wider">
            Listening Mission · Conversation Context
          </span>
        </div>
        <p className="font-sans text-base sm:text-lg font-medium text-white/95 leading-relaxed">
          {context}
        </p>
        <p className="font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
          Listen to how the speakers interact, express ideas, and chat at a natural rhythm.
        </p>
      </div>

      {/* 2. Key Phrases Ear Prep */}
      <div className="space-y-4 pt-1">
        <div>
          <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Step 1 · Ear Preparation
          </span>
          <h4 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Key Phrases to Listen For
          </h4>
          <p className="text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-400 mt-0.5">
            Tap each phrase to preview its native English pronunciation before playing the full conversation:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {keyPhrases.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs hover:border-[#10375C]/40 transition-all"
            >
              <div className="space-y-1">
                <span className="font-heading text-base font-bold text-[#10375C] dark:text-[#F3C623] block">
                  &ldquo;{item.phrase}&rdquo;
                </span>
                <span className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-400 block leading-normal">
                  {item.meaning}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handlePlayPhrase(item.phrase, e)}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#10375C] dark:text-[#F3C623] transition-colors cursor-pointer shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] touch-manipulation shadow-2xs"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
