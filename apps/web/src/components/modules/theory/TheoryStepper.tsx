"use client";

import React, { useEffect, useRef } from "react";
import { Check, BookOpen, Eye, Sparkles, Volume2, MessageSquare, PenTool, Flame, Zap, VolumeX } from "lucide-react";
import { FloatingXpNotice } from "@/hooks/use-gamification";
import { animeButtonPop, animeCountUp, animeCardHover } from "@/lib/anime-effects";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface TheoryStepDef {
  id: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const THEORY_STEPS: TheoryStepDef[] = [
  { id: 1, label: "Tujuan & Konteks", shortLabel: "Konteks", icon: BookOpen },
  { id: 2, label: "Konsep & Anatomi", shortLabel: "Konsep", icon: Eye },
  { id: 3, label: "Rumus & Balok Kata", shortLabel: "Rumus", icon: Sparkles },
  { id: 4, label: "Kosakata & Dialog", shortLabel: "Kosakata", icon: Volume2 },
  { id: 5, label: "Cek Kesiapan", shortLabel: "Kesiapan", icon: MessageSquare },
  { id: 6, label: "Uji Mandiri (Trial)", shortLabel: "Trial", icon: PenTool },
];

export const PHASE1_STEPS = THEORY_STEPS;
export type Phase1StepDef = TheoryStepDef;

export interface TheoryStepperProps {
  unlockedStep: number;
  onScrollToStep: (step: number) => void;
  isPracticeUnlocked?: boolean;
  xp?: number;
  streak?: number;
  floatingList?: FloatingXpNotice[];
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function TheoryStepper({
  unlockedStep,
  onScrollToStep,
  isPracticeUnlocked = false,
  xp = 0,
  streak = 0,
  floatingList = [],
  isMuted = false,
  onToggleMute,
}: TheoryStepperProps) {
  const maxStep = isPracticeUnlocked ? 6 : unlockedStep;
  const progressPercent = Math.round((Math.min(maxStep, 6) / 6) * 100);
  const xpRef = useRef<HTMLSpanElement>(null);
  const prevXpRef = useRef<number>(0);

  // Smooth Anime.js XP counter
  useEffect(() => {
    if (xpRef.current && xp !== prevXpRef.current) {
      animeCountUp(xpRef.current, prevXpRef.current, xp, "", " XP");
      prevXpRef.current = xp;
    }
  }, [xp]);

  const handleStepClick = (e: React.MouseEvent<HTMLButtonElement>, stepId: number) => {
    animeButtonPop(e.currentTarget);
    onScrollToStep(stepId);
  };

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-xs sticky top-16 z-30 transition-all relative space-y-2">
      {/* Floating XP Animation Bubbles */}
      <div className="absolute -top-3 right-8 pointer-events-none z-50 flex flex-col items-end gap-1">
        {floatingList.map((notice) => (
          <div
            key={notice.id}
            className="animate-out fade-out slide-out-to-top-6 duration-1000 fill-mode-forwards px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1 border border-white"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-900" />
            <span>+{notice.amount} XP</span>
          </div>
        ))}
      </div>

      {/* Gamification Live HUD Header Card */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          {/* XP Badge Card using shadcn Badge */}
          <Badge
            variant="accent"
            onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
            onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
            className="flex items-center gap-1.5 px-3 py-1 cursor-pointer will-change-transform font-bold"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span ref={xpRef}>{xp} XP</span>
          </Badge>

          {/* Streak Flame Badge Card */}
          {streak >= 2 && (
            <Badge
              variant="warning"
              onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
              onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
              className="flex items-center gap-1 px-2.5 py-1 cursor-pointer will-change-transform font-bold"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{streak}x Combo</span>
            </Badge>
          )}
        </div>

        {/* Milestone Counter & Sound Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Langkah {Math.min(maxStep, 6)} dari 6 ({progressPercent}%)
          </span>

          {onToggleMute && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onToggleMute();
              }}
              className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800"
              title={isMuted ? "Aktifkan Efek Suara" : "Matikan Efek Suara"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar from shadcn/ui */}
      <Progress value={progressPercent} className="h-1.5" />

      {/* Stepper Steps Row */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1">
        {THEORY_STEPS.map((s, idx) => {
          const isUnlocked = s.id <= maxStep;
          const isDone = s.id < maxStep || isPracticeUnlocked;

          return (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={(e) => {
                  if (isUnlocked) handleStepClick(e, s.id);
                }}
                disabled={!isUnlocked}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 sm:px-2 rounded-xl transition-all text-xs font-semibold select-none active:scale-95 will-change-transform ${
                  isUnlocked
                    ? isDone
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                      : "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30 cursor-pointer"
                    : "bg-slate-100/60 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
                title={isUnlocked ? `Scroll ke ${s.label}` : `${s.label} (Belum Terbuka)`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isUnlocked
                      ? isDone
                        ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100"
                        : "bg-white/20 text-white font-bold"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.id}
                </span>

                <span className="hidden md:inline truncate max-w-[95px]">{s.label}</span>
                <span className="inline md:hidden text-[10px] truncate max-w-[40px]">
                  {s.shortLabel}
                </span>
              </button>

              {idx < THEORY_STEPS.length - 1 && (
                <div
                  className={`hidden sm:block w-2.5 h-0.5 rounded transition-colors ${
                    s.id < maxStep || isPracticeUnlocked
                      ? "bg-emerald-400 dark:bg-emerald-600"
                      : "bg-slate-200 dark:border-slate-800"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Backward compatibility alias
export const Phase1Stepper = TheoryStepper;
export type { TheoryStepperProps as Phase1StepperProps };
