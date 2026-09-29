import React from "react";
import { MessageSquare, Volume2 } from "lucide-react";

export interface DialogueTurn {
  speaker: string;
  text: string;
  translation?: string;
}

interface SectionDialogueProps {
  title: string;
  dialogue: DialogueTurn[];
  onSpeak?: (text: string) => void;
}

export function SectionDialogue({ title, dialogue, onSpeak }: SectionDialogueProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold uppercase tracking-wider">{title}</h4>
      </div>

      <div className="space-y-3 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6">
        {dialogue.map((turn, idx) => {
          const isFirstSpeaker = idx % 2 === 0;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                isFirstSpeaker ? "justify-start" : "justify-end"
              }`}
            >
              {isFirstSpeaker && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {turn.speaker.charAt(0)}
                </div>
              )}

              <div
                className={`max-w-md rounded-2xl px-4 py-3 text-xs md:text-sm ${
                  isFirstSpeaker
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60 rounded-tl-none"
                    : "bg-blue-600 text-white rounded-tr-none"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span
                    className={`font-bold text-[11px] uppercase tracking-wider ${
                      isFirstSpeaker
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-blue-100"
                    }`}
                  >
                    {turn.speaker}
                  </span>

                  {onSpeak && (
                    <button
                      type="button"
                      onClick={() => onSpeak(turn.text)}
                      className={`p-1 rounded transition-colors ${
                        isFirstSpeaker
                          ? "text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          : "text-blue-200 hover:text-white hover:bg-blue-700"
                      }`}
                      title="Dengarkan percakapan"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="font-medium leading-relaxed">{turn.text}</p>

                {turn.translation && (
                  <p
                    className={`mt-1 text-[11px] italic pt-1 border-t ${
                      isFirstSpeaker
                        ? "text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700"
                        : "text-blue-100/80 border-blue-500/50"
                    }`}
                  >
                    {turn.translation}
                  </p>
                )}
              </div>

              {!isFirstSpeaker && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {turn.speaker.charAt(0)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
