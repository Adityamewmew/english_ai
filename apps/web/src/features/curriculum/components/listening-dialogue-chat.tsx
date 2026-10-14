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
          <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Langkah 2 · Percakapan Multi-Speaker ({dialogueLines.length} Baris)
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Percakapan Jamie &amp; Marta
          </h3>
        </div>

        <button
          type="button"
          onClick={handlePlayAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#F4B41A]" />
          <span>Putar Seluruh Percakapan</span>
        </button>
      </div>

      {/* Chat Bubbles Feed (Jamie Left, Marta Right) */}
      <div className="space-y-4 max-w-2xl mx-auto py-2">
        {dialogueLines.map((line, idx) => {
          const speakerName = (line.speaker || "").trim();
          const isJamie = speakerName.toLowerCase() === "jamie";
          const isPlaying = activeLineIdx === idx;
          const lineText = line.text || line.en || "";

          return (
            <div
              key={idx}
              className={`flex flex-col ${isJamie ? "items-start" : "items-end"}`}
            >
              {/* Speaker Label */}
              <div
                className={`flex items-center gap-1.5 mb-1 px-1 text-xs font-bold ${
                  isJamie
                    ? "text-[#0D3B66] dark:text-sky-300"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isJamie ? "bg-[#0D3B66]" : "bg-amber-500"
                  }`}
                />
                <span>{speakerName}</span>
              </div>

              {/* Chat Bubble with Audio Action */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] p-4 rounded-2xl shadow-xs transition-all border ${
                  isJamie
                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-tl-xs"
                    : "bg-[#0D3B66]/10 dark:bg-[#0D3B66]/30 border-[#0D3B66]/20 dark:border-[#0D3B66]/40 rounded-tr-xs"
                } ${
                  isPlaying
                    ? "ring-2 ring-[#0D3B66] dark:ring-[#F4B41A] shadow-md"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      &ldquo;{lineText}&rdquo;
                    </p>
                    {line.translation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        {line.translation}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handlePlayLine(line, idx, e)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      isPlaying
                        ? "bg-[#0D3B66] text-[#F4B41A]"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    }`}
                    title="Dengarkan baris ini"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
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
