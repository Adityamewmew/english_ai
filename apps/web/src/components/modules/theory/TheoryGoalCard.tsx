"use client";

import React, { useEffect } from "react";
import { Target, ArrowRight, CheckCircle2, Sparkles, Volume2, GraduationCap, UserCheck } from "lucide-react";
import { animeCardStagger, animeCardHover, animeButtonPop } from "@/lib/anime-effects";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TheoryGoalCardProps {
  title: string;
  summary: string;
  objective?: string;
  cefr?: string;
  orderIndex?: number;
  unlockedStep?: number;
  isPracticeUnlocked?: boolean;
  onScrollToStep?: (step: number) => void;
  onNext: () => void;
  onPlayAudio?: (text: string) => void;
  rules?: any[];
  targetSentence?: string;
  targetSentenceMeaning?: string;
}

export function TheoryGoalCard({
  title,
  summary,
  objective,
  cefr,
  orderIndex = 1,
  unlockedStep = 1,
  isPracticeUnlocked = false,
  onScrollToStep,
  onNext,
  onPlayAudio,
  rules = [],
  targetSentence = "She is from Japan.",
  targetSentenceMeaning,
}: TheoryGoalCardProps) {
  // Stagger entry of cards using Anime.js
  useEffect(() => {
    animeCardStagger(".goal-card-item", 70);
  }, [title]);

  const objectives = objective
    ? objective.split(/[.;,]\s+/).filter((s) => s.trim().length > 4)
    : [
        "Memahami pola tata bahasa inti dan penggunaannya dalam situasi nyata",
        "Mengenal kosakata kunci dan pelafalan yang tepat",
        "Mempersiapkan diri untuk berinteraksi langsung di Speaking Lab",
      ];

  // 5 variasi opener dialog Maya & Mr. Khoirul agar tidak monoton
  const safeSummary = (summary || "berkomunikasi").toLowerCase();
  const dialogVariants = [
    {
      maya: `Mr. Khoirul, kapan sih kita sebenarnya wajib menggunakan pola materi ${title} ini dalam percakapan sehari-hari?`,
      khoirul: `Pertanyaan mantap, Maya! Pola ini kita pakai untuk ${safeSummary}. Bayangkan kamu sedang mengobrol dengan rekan internasional. Kunci utamanya ada pada contoh kalimat target ini:`,
    },
    {
      maya: `Mr. Khoirul, banyak yang bilang pola ${title} terdengar mirip dengan kalimat biasa. Apa ciri khas utamanya?`,
      khoirul: `Bagus sekali perhatianmu, Maya! Ciri khasnya ada pada ketepatan konteks: ${safeSummary}. Coba dengarkan dan rasakan alur contoh kalimat target kita ini:`,
    },
    {
      maya: `Kalau di lingkungan kerja atau saat traveling, apakah pola ${title} ini sering dipakai penutur asli?`,
      khoirul: `Sangat sering! Penutur asli memakainya secara spontan saat ${safeSummary}. Mulailah membiasakan diri dengan kalimat target berikut:`,
    },
    {
      maya: `Supaya terdengar percaya diri dan natural saat berbicara, fokus utama apa yang harus saya latih di modul ${title} ini?`,
      khoirul: `Fokus pada ritme dan intonasi intinya, Maya. Modul ini melatihmu untuk ${safeSummary}. Dengarkan kalimat target ini sebagai patokan awalmu:`,
    },
    {
      maya: `Mr. Khoirul, bagaimana cara tercepat agar tidak ragu-ragu saat mengucapkan pola ${title} saat berbicara langsung?`,
      khoirul: `Kuncinya adalah muscle memory lewat repetisi alami! Modul ini dirancang agar kamu terbiasa ${safeSummary}. Dengarkan contoh kalimat target ini:`,
    },
  ];

  const currentDialog = dialogVariants[(Math.max(1, orderIndex) - 1) % dialogVariants.length];

  return (
    <div className="space-y-8">
      {/* 01. Story Dialogue Briefing & Target Callout */}
      <Card className="bg-gradient-to-br from-indigo-50/70 via-blue-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/60 p-6 sm:p-8 md:p-10 shadow-xs overflow-hidden">
        <CardHeader className="p-0 space-y-4 pb-6 sm:pb-8">
          {/* Header Tag & CEFR Badge */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Orientasi &amp; Konteks Nyata</span>
            </div>
            {cefr && (
              <Badge variant="primary" className="font-mono text-xs px-3 py-1 font-semibold">
                CEFR {cefr}
              </Badge>
            )}
          </div>

          {/* Title & Summary */}
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {summary}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-8">
          {/* Story Dialogue Briefing Card (Mr. Khoirul & Maya) */}
          <div
            onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
            onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
            className="goal-card-item p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-850 border border-indigo-100/90 dark:border-indigo-900/40 shadow-xs space-y-5 will-change-transform"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Obrolan Pengantar: Situasi Nyata &amp; Mengapa Ini Penting</span>
            </div>

            <div className="space-y-4">
              {/* Turn 1: Maya asks question */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 shadow-xs">
                  <GraduationCap className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs sm:text-sm text-amber-950 dark:text-amber-100 space-y-1.5 leading-relaxed">
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs block">
                    Maya (Siswa)
                  </span>
                  <p>&ldquo;{currentDialog.maya}&rdquo;</p>
                </div>
              </div>

              {/* Turn 2: Mr. Khoirul explains warmly */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 border border-blue-300 dark:border-blue-700 shadow-xs">
                  <UserCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1 p-4 rounded-2xl rounded-tl-none bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs sm:text-sm text-blue-950 dark:text-blue-100 space-y-2 leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-700 dark:text-blue-400 text-xs">
                      Mr. Khoirul (Guru AI)
                    </span>
                    {onPlayAudio && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          animeButtonPop(e.currentTarget);
                          onPlayAudio(targetSentence);
                        }}
                        className="h-7 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-700 font-semibold px-2"
                      >
                        <Volume2 className="w-3.5 h-3.5 mr-1" />
                        <span>Dengar Contoh</span>
                      </Button>
                    )}
                  </div>
                  <p>
                    &ldquo;{currentDialog.khoirul} <em>&ldquo;{targetSentence}&rdquo;</em>.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Target Example Callout with Audio */}
          <div className="goal-card-item p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-sm flex items-center justify-between gap-6 flex-wrap will-change-transform">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Contoh Kalimat Target Modul:</span>
              </span>
              <p className="text-xl sm:text-2xl font-black font-sans tracking-wide">
                &ldquo;{targetSentence}&rdquo;
              </p>
              {targetSentenceMeaning && (
                <p className="text-xs sm:text-sm text-blue-100 italic">
                  Artinya: {targetSentenceMeaning}
                </p>
              )}
            </div>

            {onPlayAudio && (
              <Button
                variant="secondary"
                size="default"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onPlayAudio(targetSentence);
                }}
                className="bg-white text-blue-700 font-bold hover:bg-blue-50 shadow-sm shrink-0 px-4 py-2 min-h-[44px]"
              >
                <Volume2 className="w-4 h-4 mr-1.5" />
                <span>Dengar Pelafalan</span>
              </Button>
            )}
          </div>

          <Separator className="bg-indigo-100/70 dark:bg-indigo-900/40 my-2" />

          {/* Actionable Learning Targets */}
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Target Keberhasilan Kamu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {objectives.slice(0, 3).map((obj, i) => (
                <div
                  key={i}
                  onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
                  onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
                  className="goal-card-item p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 will-change-transform"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-md hover:brightness-105 will-change-transform px-6 py-3 min-h-[48px] text-sm font-bold gap-2"
        >
          <span>Masuk ke Arena Aksi Interaktif (Sandbox)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const Phase1GoalCard = TheoryGoalCard;
