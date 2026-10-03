"use client";

import React, { useEffect } from "react";
import { Target, ArrowRight, CheckCircle2, Sparkles, Volume2, Layers, GraduationCap, UserCheck } from "lucide-react";
import { TheoryLearningMap } from "./TheoryLearningMap";
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

  return (
    <div className="space-y-6">
      {/* 01. Story Dialogue Briefing & Deep Grammar Dossier Card */}
      <Card className="bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-white dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/60 shadow-sm overflow-hidden">
        <CardHeader className="space-y-4 pb-4">
          {/* Header Tag & CEFR Badge */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Panggung Pembuka: Story Dialogue &amp; Berkas Tata Bahasa</span>
            </div>
            {cefr && (
              <Badge variant="primary" className="font-mono text-xs">
                CEFR {cefr}
              </Badge>
            )}
          </div>

          {/* Title & Summary */}
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {summary}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Story Dialogue Briefing Card (Mr. Khoirul & Maya) */}
          <Card
            onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
            onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
            className="goal-card-item p-4 sm:p-5 bg-white dark:bg-slate-800/90 border-indigo-100 dark:border-indigo-900/50 shadow-xs space-y-4 will-change-transform"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Obrolan Pengantar: Situasi Nyata &amp; Kenapa Ini Penting</span>
            </div>

            <div className="space-y-3">
              {/* Turn 1: Maya asks question */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 shadow-xs">
                  <GraduationCap className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="flex-1 p-3 rounded-2xl rounded-tl-none bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs sm:text-sm text-amber-950 dark:text-amber-100 space-y-1">
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs block">
                    Maya (Siswa)
                  </span>
                  <p>
                    &ldquo;Mr. Khoirul, kapan sih kita sebenarnya wajib menggunakan pola materi <strong>{title}</strong> ini dalam percakapan sehari-hari?&rdquo;
                  </p>
                </div>
              </div>

              {/* Turn 2: Mr. Khoirul explains warmly */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 border border-blue-300 dark:border-blue-700 shadow-xs">
                  <UserCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1 p-3 rounded-2xl rounded-tl-none bg-blue-50/90 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs sm:text-sm text-blue-950 dark:text-blue-100 space-y-1">
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
                        className="h-7 text-[11px] text-blue-600 dark:text-blue-300 hover:text-blue-700 p-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Dengar Contoh</span>
                      </Button>
                    )}
                  </div>
                  <p>
                    &ldquo;Pertanyaan mantap, Maya! Pola ini kita pakai untuk <strong>{summary.toLowerCase()}</strong>. Bayangkan kamu sedang berkenalan atau bercerita dengan teman internasional. Kunci utamanya ada pada contoh kalimat target ini: <em>&ldquo;{targetSentence}&rdquo;</em>.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Dynamic Target Example Callout with Audio */}
          <div className="goal-card-item p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex items-center justify-between gap-4 flex-wrap will-change-transform">
            <div className="space-y-1 max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Contoh Kalimat Target Utama Modul Ini:</span>
              </span>
              <p className="text-lg sm:text-xl font-black font-mono tracking-wide">
                &ldquo;{targetSentence}&rdquo;
              </p>
              {targetSentenceMeaning && (
                <p className="text-xs text-blue-100 italic">
                  Artinya: {targetSentenceMeaning}
                </p>
              )}
            </div>

            {onPlayAudio && (
              <Button
                variant="secondary"
                size="md"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onPlayAudio(targetSentence);
                }}
                className="bg-white text-blue-700 font-bold hover:bg-blue-50 shadow-sm shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>Dengar Pelafalan</span>
              </Button>
            )}
          </div>

          {/* Deep Grammar Rules Breakdown Table */}
          {rules.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Tabel Pola & Aturan Lengkap Modul Ini:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rules.slice(0, 4).map((rule: any, idx: number) => {
                  const ruleText = typeof rule === "string" ? rule : JSON.stringify(rule);
                  const colonIdx = ruleText.indexOf(":");
                  const heading = colonIdx > -1 ? ruleText.substring(0, colonIdx).trim() : `Pola #${idx + 1}`;
                  const body = colonIdx > -1 ? ruleText.substring(colonIdx + 1).trim() : ruleText;

                  return (
                    <Card
                      key={idx}
                      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
                      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
                      className="goal-card-item p-4 bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors will-change-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm" className="font-bold">
                          {idx + 1}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {heading}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {body}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="bg-indigo-100/70 dark:bg-indigo-900/40" />

          {/* Actionable Learning Targets */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Target Keberhasilan Kamu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {objectives.slice(0, 3).map((obj, i) => (
                <div
                  key={i}
                  onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
                  onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
                  className="goal-card-item p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 will-change-transform cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 02. Learning Map (Peta Mental Pembelajaran) */}
      <TheoryLearningMap
        unlockedStep={unlockedStep}
        onScrollToStep={onScrollToStep || (() => {})}
        isPracticeUnlocked={isPracticeUnlocked}
      />

      {/* Action Footer */}
      <div className="flex justify-end pt-1">
        <Button
          size="lg"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onNext();
          }}
          className="border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 shadow-md hover:brightness-105 will-change-transform"
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
