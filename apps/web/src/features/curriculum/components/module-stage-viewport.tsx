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
            theorySec={theorySec}
            dialogueSec={dialogueSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            onNextStep={onNextStep}
            cefr={cefr}
          />
        ) : skillType === "writing" ? (
          <StageWritingView
            activeStepId={activeStepId}
            theorySec={theorySec}
            practiceSec={practiceSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            onNextStep={onNextStep}
            cefr={cefr}
          />
        ) : skillType === "speaking" ? (
          <StageSpeakingView
            activeStepId={activeStepId}
            theorySec={theorySec}
            practiceSec={practiceSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            onNextStep={onNextStep}
            cefr={cefr}
          />
        ) : (
          <StageReadingView
            activeStepId={activeStepId}
            theorySec={theorySec}
            vocabSec={vocabSec}
            dialogueSec={dialogueSec}
            practiceSec={practiceSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            onIncrementCombo={onIncrementCombo}
            onResetCombo={onResetCombo}
            cefr={cefr}
            onNextStep={onNextStep}
          />
        )}
      </div>

      {/* 2. Interactive Step Navigation Bar (EDDY'S English Skeuomorphic Style) */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Left: Step indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0D3B66] text-white flex items-center justify-center font-bold text-xs shrink-0 border-b-2 border-[#082542] shadow-2xs">
            {activeStepId}
          </div>
          <div className="leading-tight">
            <span className="text-xs font-semibold text-slate-800 dark:text-white block">
              Langkah {activeStepId} dari {totalSteps}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Aktivitas Interaktif
            </span>
          </div>
        </div>

        {/* Center: Continuous Progress Bar */}
        <div className="flex-1 max-w-xs mx-auto hidden md:flex items-center gap-2.5">
          <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-[#0D3B66] transition-all duration-300 rounded-full"
              style={{ width: `${Math.round((activeStepId / Math.max(1, totalSteps)) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A] shrink-0 font-mono">
            {Math.round((activeStepId / Math.max(1, totalSteps)) * 100)}%
          </span>
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
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer ${
              isFinishing
                ? "bg-slate-400 text-white cursor-wait"
                : activeStepId === totalSteps
                ? "btn-skeuo-yellow text-[#0F172A]"
                : "btn-skeuo-navy text-white"
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
