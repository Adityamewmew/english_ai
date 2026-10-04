"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles, Volume2, ArrowRight, TrendingUp, Layers } from "lucide-react";
import { TheorySentenceAnatomy } from "./TheorySentenceAnatomy";
import { TheorySentenceBuilder } from "./TheorySentenceBuilder";
import { animeCardStagger, animeCardHover, animeButtonPop } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ThreeTierExample {
  level: "simple" | "contextual" | "applied";
  levelLabel: string;
  badgeVariant: "primary" | "secondary" | "success" | "accent";
  sentence: string;
  meaning: string;
  note?: string;
}

interface TheoryThreeTierExamplesProps {
  rules: any[];
  onPlayAudio?: (text: string) => void;
  onNext: () => void;
  onCompleteStep?: () => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onPenalizeWrong?: () => void;
  onPlaySnap?: () => void;
  targetSentence?: string;
  targetSentenceMeaning?: string;
}

export function TheoryThreeTierExamples({
  rules,
  onPlayAudio,
  onNext,
  onCompleteStep,
  onAwardXp,
  onPenalizeWrong,
  onPlaySnap,
  targetSentence,
  targetSentenceMeaning,
}: TheoryThreeTierExamplesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const targetExampleSentence =
    targetSentence ||
    (typeof rules[0] === "string" ? rules[0].replace(/[0-9.:]/g, "").trim() : "She is from Japan.");

  const threeTierExamples: ThreeTierExample[] = React.useMemo(() => {
    return [
      {
        level: "simple",
        levelLabel: "Tingkat Dasar (Core Pattern)",
        badgeVariant: "primary",
        sentence: targetExampleSentence,
        meaning: targetSentenceMeaning || "Pola dasar kalimat utama modul ini.",
        note: "Pola dasar: Struktur inti subjek, kata kerja bantu/utama, dan pelengkap.",
      },
      {
        level: "contextual",
        levelLabel: "Tingkat Menengah (In Context)",
        badgeVariant: "secondary",
        sentence: `In fact, ${targetExampleSentence.toLowerCase().replace(/\.$/, "")} every single day.`,
        meaning: `Sebenarnya, ${targetSentenceMeaning ? targetSentenceMeaning.toLowerCase().replace(/\.$/, "") : "dia/saya melakukannya"} setiap hari.`,
        note: "Menambahkan keterangan penguat konteks percakapan nyata.",
      },
      {
        level: "applied",
        levelLabel: "Tingkat Mahir (Real Application)",
        badgeVariant: "success",
        sentence: `Hello! ${targetExampleSentence} Nice to meet you!`,
        meaning: `Halo! ${targetSentenceMeaning || ""} Senang berkenalan denganmu!`,
        note: "Digunakan langsung dalam sapaan ramah percakapan sehari-hari.",
      },
    ];
  }, [targetExampleSentence, targetSentenceMeaning]);

  // Anime.js Stagger for tier cards
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>(".three-tier-card");
    if (cards.length > 0) {
      animeCardStagger(cards, 70);
    }
  }, [threeTierExamples]);

  const handleAudioClick = (e: React.MouseEvent<HTMLButtonElement>, text: string) => {
    animeButtonPop(e.currentTarget);
    onPlayAudio?.(text);
  };

  return (
    <div ref={containerRef} className="space-y-12 sm:space-y-16">
      {/* 1. Formula & Mekanisme Penggunaan Card using shadcn Card */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="overflow-hidden shadow-xs border-slate-200/90 dark:border-slate-800 rounded-2xl will-change-transform"
      >
        <div className="px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:to-blue-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Rumus &amp; Struktur Kalimat (How Does It Work?)</span>
          </div>
          <Badge variant="secondary" size="sm" className="font-semibold text-xs px-3 py-1">
            Formula Dasar
          </Badge>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-3">
          {rules.map((rule: any, idx: number) => {
            if (typeof rule === "string") {
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors rounded-xl"
                >
                  <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base">
                    {rule}
                  </span>
                </div>
              );
            }

            const keys = Object.keys(rule);
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs sm:text-sm hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors rounded-xl"
              >
                {keys.map((k) => (
                  <div key={k} className="flex flex-col p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {k}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      {rule[k]}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Anatomi Kalimat Interaktif (Sentence Breakdown) */}
      <TheorySentenceAnatomy
        sentence={targetExampleSentence}
        onPlayAudio={onPlayAudio}
      />

      {/* 3. Tangga Contoh Bertingkat 3-Tier Card using shadcn Card */}
      <Card className="border-blue-200/80 dark:border-blue-900/50 p-6 sm:p-8 md:p-10 shadow-xs space-y-6 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Tangga Contoh Bertingkat (3-Tier Progression)</span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Dari pola sederhana menuju kalimat terapan nyata
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-1">
          {threeTierExamples.map((ex, idx) => (
            <Card
              key={idx}
              onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
              onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
              className="three-tier-card p-5 sm:p-6 border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3 rounded-2xl will-change-transform"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant={ex.badgeVariant} size="sm" className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5">
                  {ex.levelLabel}
                </Badge>

                {onPlayAudio && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleAudioClick(e, ex.sentence)}
                    className="min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                    title="Dengarkan pelafalan kalimat ini"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono leading-relaxed">
                &ldquo;{ex.sentence}&rdquo;
              </p>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic font-normal">
                {ex.meaning}
              </div>

              {ex.note && (
                <div className="text-xs text-slate-600 dark:text-slate-400 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{ex.note}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>

      {/* 4. Balok Kata Interaktif (Section 16 & 24 Interactive Sentence Builder) */}
      <TheorySentenceBuilder
        targetSentence={targetExampleSentence}
        onPlayAudio={onPlayAudio}
        onComplete={onCompleteStep}
        onAwardXp={onAwardXp}
        onPenalizeWrong={onPenalizeWrong}
        onPlaySnap={onPlaySnap}
      />

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-end">
        <Button
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="gap-2 px-6 py-3 min-h-[48px] text-sm font-bold shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
        >
          <span>Pelajari Kosakata &amp; Analisis Dialog</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const Phase1ThreeTierExamples = TheoryThreeTierExamples;
