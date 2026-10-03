"use client";

import React, { useEffect, useRef } from "react";
import { MessageSquare, Volume2, ArrowRight, UserCircle2, Search, CheckCircle2, Sparkles } from "lucide-react";
import { DialogueTurn } from "../SectionDialogue";
import { animeCardStagger, animeCardHover, animeButtonPop } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ContextualAnalysis {
  keySentence: string;
  breakdown: string[];
  takeaway: string;
}

export interface TheoryDialogueStepProps {
  context?: string;
  lines: DialogueTurn[];
  analysis?: ContextualAnalysis;
  onPlayAudio?: (text: string) => void;
  onNext: () => void;
}

export function TheoryDialogueStep({
  context,
  lines = [],
  analysis,
  onPlayAudio,
  onNext,
}: TheoryDialogueStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smart derivation of Contextual Analysis if not provided explicitly
  const targetLine = lines.find((l) => l.text && l.text.split(" ").length >= 3) || lines[0];
  const effectiveAnalysis: ContextualAnalysis = analysis || {
    keySentence: targetLine?.text || "I'm from Spain.",
    breakdown: [
      "Perhatikan bagaimana subjek dan predikat berpadu secara ringkas dan alami dalam percakapan cepat.",
      "Kosakata dan tenses diterapkan langsung untuk merespons lawan bicara tanpa jeda canggung.",
    ],
    takeaway: "Gunakan pola dan ungkapan ini saat kamu berbicara langsung dengan AI Tutor di Speaking Lab.",
  };

  // Anime.js Staggered Entrance for dialogue cards on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>(".dialogue-turn-card");
    if (cards.length > 0) {
      animeCardStagger(cards, 60);
    }
  }, [lines]);

  const handleAudioClick = (e: React.MouseEvent<HTMLButtonElement>, text: string) => {
    animeButtonPop(e.currentTarget);
    onPlayAudio?.(text);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner Card using shadcn Card */}
      <Card className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border-blue-200/80 dark:border-blue-900/40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
              Aplikasi Konsep dalam Percakapan Nyata
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Dengarkan & pelajari bagaimana penutur asli bertukar kalimat secara alami
            </p>
          </div>
        </div>
      </Card>

      {/* Skenario Konteks Card using shadcn Card */}
      {context && (
        <Card
          onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
          className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md will-change-transform"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
              Skenario Dialog:
            </span>
          </div>
          <p className="leading-relaxed text-xs sm:text-sm font-normal text-slate-700 dark:text-slate-300">
            {context}
          </p>
        </Card>
      )}

      {/* Dialogue Thread Cards */}
      <div className="space-y-3.5">
        {lines.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-500 italic">
            Tidak ada transkrip dialog untuk modul ini.
          </Card>
        ) : (
          lines.map((turn, idx) => {
            const isFirstSpeaker = idx % 2 === 0;

            return (
              <div
                key={idx}
                className={`flex gap-3 text-xs sm:text-sm ${
                  isFirstSpeaker ? "justify-start" : "justify-start sm:justify-end"
                }`}
              >
                <Card
                  onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
                  onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
                  className={`dialogue-turn-card max-w-xl w-full sm:w-auto p-4 sm:p-4.5 rounded-2xl shadow-sm transition-all will-change-transform ${
                    isFirstSpeaker
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-tl-sm text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700"
                      : "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60 rounded-tr-sm text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <Badge
                      variant={isFirstSpeaker ? "secondary" : "primary"}
                      className="font-bold text-xs flex items-center gap-1.5"
                    >
                      <UserCircle2 className="w-3.5 h-3.5" />
                      {turn.speaker}
                    </Badge>

                    {onPlayAudio && turn.text && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleAudioClick(e, turn.text)}
                        className="h-11 w-11 sm:h-9 sm:w-9 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg shrink-0"
                        title={`Dengarkan ucapan ${turn.speaker}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <p className="font-semibold text-sm leading-relaxed mb-1.5 text-slate-900 dark:text-slate-100">
                    {turn.text}
                  </p>

                  {turn.translation && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-1.5 mt-1.5 font-normal italic flex items-center gap-1">
                      <span>&ldquo;{turn.translation}&rdquo;</span>
                    </div>
                  )}
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Contextual Analysis (Section 11 Framework v2) */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="bg-white dark:bg-slate-900 border-indigo-200/90 dark:border-indigo-900/50 p-5 sm:p-6 shadow-sm space-y-4 will-change-transform"
      >
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Bedah Kalimat Kontekstual (Let&apos;s Analyze)</span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center justify-between">
          <span>&ldquo;{effectiveAnalysis.keySentence}&rdquo;</span>
          {onPlayAudio && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleAudioClick(e, effectiveAnalysis.keySentence)}
              className="h-11 w-11 sm:h-9 sm:w-9 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg shrink-0"
              title="Dengarkan kalimat fokus ini"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2 pt-1">
          {effectiveAnalysis.breakdown.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span><strong>Intisari Pembelajaran:</strong> {effectiveAnalysis.takeaway}</span>
        </div>
      </Card>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-end">
        <Button
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="gap-2 px-5 py-2.5 shadow-sm"
        >
          <span>Lanjut ke Cek Kesiapan Belajar</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const Phase1DialogueStep = TheoryDialogueStep;
export type { TheoryDialogueStepProps as Phase1DialogueStepProps };
