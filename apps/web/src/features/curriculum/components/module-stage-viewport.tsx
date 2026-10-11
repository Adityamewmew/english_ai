"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { StageReadingView } from "./stage-reading-view";
import { StageListeningView } from "./stage-listening-view";
import { StageWritingView } from "./stage-writing-view";
import { StageSpeakingView } from "./stage-speaking-view";

interface ModuleStageViewportProps {
  skillType?: string;
  activeStepId: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onRewardXp: (amount: number) => void;
  onIncrementCombo: () => void;
  onResetCombo: () => void;
  theorySec: any;
  vocabSec: any;
  dialogueSec: any;
  practiceSec: any;
  quizSec: any;
  tutor: any;
  cefr?: string;
  isFinishing?: boolean;
}

export function ModuleStageViewport({
  skillType = "reading",
  activeStepId,
  totalSteps,
  onPrevStep,
  onNextStep,
  onRewardXp,
  onIncrementCombo,
  onResetCombo,
  theorySec,
  vocabSec,
  dialogueSec,
  practiceSec,
  quizSec,
  tutor,
  cefr = "A1.1",
  isFinishing = false,
}: ModuleStageViewportProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[28px] overflow-hidden shadow-sm flex flex-col justify-between">
      {/* 1. Specialized Stage Activity Canvas based on skillType */}
      <div className="p-6 sm:p-8 space-y-6">
        {skillType === "listening" ? (
          <StageListeningView
            activeStepId={activeStepId}
            dialogueSec={dialogueSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            cefr={cefr}
          />
        ) : skillType === "writing" ? (
          <StageWritingView
            activeStepId={activeStepId}
            theorySec={theorySec}
            practiceSec={practiceSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            cefr={cefr}
          />
        ) : skillType === "speaking" ? (
          <StageSpeakingView
            activeStepId={activeStepId}
            theorySec={theorySec}
            practiceSec={practiceSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            cefr={cefr}
          />
        ) : (
          <StageReadingView
            activeStepId={activeStepId}
            theorySec={theorySec}
            vocabSec={vocabSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            onIncrementCombo={onIncrementCombo}
            onResetCombo={onResetCombo}
            cefr={cefr}
          />
        )}
      </div>

      {/* 2. Interactive Step Navigation Bar (Clean Demia Player Style) */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Left: Step indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/60 dark:border-blue-900 font-mono">
            {activeStepId}
          </div>
          <div className="leading-tight">
            <span className="text-xs font-semibold text-slate-800 dark:text-white block">
              Step {activeStepId} of {totalSteps}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Interactive Activity
            </span>
          </div>
        </div>

        {/* Center: Stage Progress Segments */}
        <div className="flex-1 max-w-xs mx-auto hidden md:flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === activeStepId
                  ? "flex-1 bg-blue-600 dark:bg-blue-500"
                  : s < activeStepId
                  ? "w-4 bg-emerald-500"
                  : "w-4 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Right: Step Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onPrevStep();
            }}
            disabled={activeStepId === 1}
            className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeStepId === 1
                ? "opacity-30 cursor-not-allowed text-slate-400"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            disabled={isFinishing}
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onNextStep();
            }}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer ${
              isFinishing
                ? "bg-slate-400 cursor-wait"
                : activeStepId === totalSteps
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isFinishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Completing...</span>
              </>
            ) : activeStepId === totalSteps ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Finish Mission</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
