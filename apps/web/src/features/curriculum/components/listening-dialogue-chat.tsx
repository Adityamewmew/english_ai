"use client";

import React, { useState } from "react";
import { Volume2, Play } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound } from "@/lib/sound-fx";

interface DialogueLine {
  speaker: string;
  text?: string;
  en?: string;
  translation?: string;
}

interface ListeningDialogueChatProps {
  dialogueLines: DialogueLine[];
  tutor: any;
}

export function ListeningDialogueChat({
  dialogueLines = [],
  tutor,
}: ListeningDialogueChatProps) {
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);

  const handlePlayLine = (line: DialogueLine, idx: number, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setActiveLineIdx(idx);
    const textToSpeak = line.text || line.en || "";
    tutor.playTutorAudio(textToSpeak);
    setTimeout(() => setActiveLineIdx(null), 4000);
  };

  const handlePlayAll = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const fullConversation = dialogueLines
      .map((l) => `${l.speaker}: ${l.text || l.en || ""}`)
      .join(". ");
    tutor.playTutorAudio(fullConversation);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Play Full Dialogue Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-heading font-bold text-[#10375C] dark:text-[#F4B41A] uppercase tracking-wider block">
            Step 2 · Multi-Speaker Dialogue ({dialogueLines.length} Lines)
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Interactive Dialogue Feed
          </h3>
          <p className="text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-400 mt-0.5">
            Tap any bubble to listen to that speaker, or play the entire dialogue below:
          </p>
        </div>

        <button
          type="button"
          onClick={handlePlayAll}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full btn-skeuo-navy text-white font-heading font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 min-h-[44px] touch-manipulation"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#F4B41A]" />
          <span>Play Full Dialogue</span>
        </button>
      </div>

      {/* Chat Bubbles Feed (Speaker 1 Left, Speaker 2 Right) */}
      <div className="space-y-5 max-w-2xl mx-auto py-2">
        {dialogueLines.map((line, idx) => {
          const speakerName = (line.speaker || "").trim();
          const firstSpeaker = (dialogueLines[0]?.speaker || "").trim();
          const isFirstSpeaker = speakerName === firstSpeaker || !speakerName;
          const isPlaying = activeLineIdx === idx;
          const lineText = line.text || line.en || "";

          return (
            <div
              key={idx}
              className={`flex flex-col ${isFirstSpeaker ? "items-start" : "items-end"}`}
            >
              {/* Speaker Label with Live Motion Soundwave */}
              <div
                className={`flex items-center gap-2 mb-1.5 px-2 text-xs font-heading font-bold ${
                  isFirstSpeaker
                    ? "text-[#10375C] dark:text-sky-300"
                    : "text-amber-800 dark:text-amber-400"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isFirstSpeaker ? "bg-[#10375C]" : "bg-amber-500"
                  }`}
                />
                <span>{speakerName || "Speaker"}</span>

                {/* Animated Equalizer Wave when playing */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3.5 px-1 animate-in fade-in duration-200" title="Speaking">
                    <span className="w-1 h-3 bg-amber-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
                    <span className="w-1 h-2 bg-amber-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.15s]" />
                    <span className="w-1 h-3.5 bg-amber-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.3s]" />
                  </div>
                )}
              </div>

              {/* Chat Bubble with Audio Action */}
              <div
                onClick={(e) => handlePlayLine(line, idx, e)}
                className={`max-w-[88%] sm:max-w-[80%] p-4 sm:p-5 rounded-3xl shadow-xs transition-all border cursor-pointer select-none touch-manipulation ${
                  isFirstSpeaker
                    ? "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 rounded-tl-sm hover:border-[#10375C]/40"
                    : "bg-slate-50/90 dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 rounded-tr-sm hover:border-amber-400/50"
                } ${
                  isPlaying
                    ? "ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20 shadow-md"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-sans text-base sm:text-[17px] font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      &ldquo;{lineText}&rdquo;
                    </p>
                    {line.translation && (
                      <p className="font-sans text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                        {line.translation}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayLine(line, idx, e);
                    }}
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 min-w-[40px] min-h-[40px] ${
                      isPlaying
                        ? "bg-[#10375C] text-[#F4B41A] shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    }`}
                    title="Listen to this line"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
