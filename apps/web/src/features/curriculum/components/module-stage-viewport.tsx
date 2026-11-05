"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { StageReadingView } from "./stage-reading-view";
import { StageListeningView } from "./stage-listening-view";
import { StageWritingView } from "./stage-writing-view";
import { StageSpeakingView } from "./stage-speaking-view";
import { StageGraduationExamView } from "./stage-graduation-exam-view";

interface ModuleStageViewportProps {
  skillType?: string;
  activeStepId: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onStepComplete?: () => void;
  canProceed?: boolean;
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
  moduleData?: any;
  studentName?: string;
  isAdmin?: boolean;
  onSubmitExam?: (finalScore: number, examAnswers?: Record<string, any>) => Promise<void>;
  initialAnswers?: Record<string, any>;
  onAnswersChange?: (answers: Record<string, any>, speakingScore?: number) => void;
}

export function ModuleStageViewport({
  skillType = "reading",
  activeStepId,
  totalSteps,
  onPrevStep,
  onNextStep,
  onStepComplete,
  canProceed = true,
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
  moduleData,
  studentName,
  isAdmin = false,
  onSubmitExam,
  initialAnswers,
  onAnswersChange,
}: ModuleStageViewportProps) {
  const effectiveCanProceed = isAdmin || canProceed;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
      {/* 1. Specialized Stage Activity Canvas based on skillType */}
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {skillType === "assessment" || skillType === "exam" ? (
          <StageGraduationExamView
            activeStepId={activeStepId}
            theorySec={theorySec}
            quizSec={quizSec}
            moduleData={moduleData}
            onNextStep={onNextStep}
            onStepComplete={onStepComplete}
            onRewardXp={onRewardXp}
            studentName={studentName}
            onSubmitExam={onSubmitExam}
          />
        ) : skillType === "listening" ? (
          <StageListeningView
            activeStepId={activeStepId}
            theorySec={theorySec}
            dialogueSec={dialogueSec}
            practiceSec={practiceSec}
            quizSec={quizSec}
            tutor={tutor}
            onRewardXp={onRewardXp}
            onNextStep={onNextStep}
            onStepComplete={onStepComplete}
            initialAnswers={initialAnswers}
            onAnswersChange={onAnswersChange}
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
            onStepComplete={onStepComplete}
            initialAnswers={initialAnswers}
            onAnswersChange={onAnswersChange}
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
            onStepComplete={onStepComplete}
            initialAnswers={initialAnswers}
            onAnswersChange={onAnswersChange}
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
            onStepComplete={onStepComplete}
            initialAnswers={initialAnswers}
            onAnswersChange={onAnswersChange}
          />
        )}
      </div>

      {/* 2. Interactive Step Navigation Bar for Laptop / Desktop (Hidden on Mobile) */}
      <div className="hidden lg:flex p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 items-center justify-between gap-3 select-none">
        {/* Left: Step indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0D3B66] text-white flex items-center justify-center font-heading font-black text-xs shrink-0 border-b-2 border-[#082542] shadow-2xs">
            {activeStepId}
          </div>
          <div className="leading-tight">
            <span className="text-xs font-bold font-heading text-slate-800 dark:text-white block">
              Step {activeStepId} of {totalSteps}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Interactive Learning Stage
            </span>
          </div>
        </div>

        {/* Center: Continuous Progress Bar */}
        <div className="flex-1 max-w-xs mx-auto flex items-center gap-2.5">
          <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-[#0D3B66] dark:bg-[#F4B41A] transition-all duration-300 rounded-full"
              style={{ width: `${Math.round((activeStepId / Math.max(1, totalSteps)) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] shrink-0 font-mono">
            {Math.round((activeStepId / Math.max(1, totalSteps)) * 100)}%
          </span>
        </div>

        {/* Right: Step Navigation Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onPrevStep();
            }}
            disabled={activeStepId === 1}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] min-w-[44px] touch-manipulation border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 ${
              activeStepId === 1
                ? "opacity-30 cursor-not-allowed text-slate-400 border-transparent bg-transparent"
                : "text-slate-700 hover:text-slate-900 dark:text-slate-200 active:scale-95 shadow-2xs"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            disabled={!effectiveCanProceed || isFinishing}
            onClick={(e) => {
              if (!effectiveCanProceed || isFinishing) return;
              animeButtonPop(e.currentTarget);
              onNextStep();
            }}
            className={`flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl font-heading font-black text-xs shadow-sm transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation ${
              isFinishing
                ? "bg-slate-400 text-white cursor-wait"
                : !effectiveCanProceed
                ? "opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                : activeStepId === totalSteps
                ? "btn-skeuo-yellow text-[#0F172A]"
                : "btn-skeuo-navy text-white"
            }`}
          >
            {isFinishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : !effectiveCanProceed ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {activeStepId === totalSteps ? "Lengkapi Latihan di Atas" : "Selesaikan Tahap Ini"}
                </span>
              </>
            ) : activeStepId === totalSteps ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Finish Mission</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Mobile Sticky Bottom Navigation Dock (Fixed to bottom on phones, with safe-area padding) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 select-none animate-in slide-in-from-bottom-2 duration-200">
        {/* Mobile Left: Previous Button (44px target) */}
        <button
          type="button"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onPrevStep();
          }}
          disabled={activeStepId === 1}
          className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] min-w-[44px] touch-manipulation border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
            activeStepId === 1
              ? "opacity-25 cursor-not-allowed text-slate-400 border-transparent bg-transparent"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-200 active:scale-95 shadow-2xs cursor-pointer"
          }`}
          aria-label="Previous step"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Mobile Center: Step Counter & Progress Pill */}
        <div className="flex flex-col items-center justify-center leading-tight px-1">
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
            Langkah <span className="text-[#0D3B66] dark:text-[#F4B41A] font-black font-heading">{activeStepId}</span>/{totalSteps}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">
            {Math.round((activeStepId / Math.max(1, totalSteps)) * 100)}%
          </span>
        </div>

        {/* Mobile Right: Primary Action Button (>= 48px target, btn-skeuo-yellow) */}
        <button
          type="button"
          disabled={!effectiveCanProceed || isFinishing}
          onClick={(e) => {
            if (!effectiveCanProceed || isFinishing) return;
            animeButtonPop(e.currentTarget);
            onNextStep();
          }}
          className={`flex-1 max-w-[210px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-heading font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer min-h-[48px] touch-manipulation ${
            isFinishing
              ? "bg-slate-400 text-white cursor-wait"
              : !effectiveCanProceed
              ? "opacity-60 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 text-[11px]"
              : activeStepId === totalSteps
              ? "btn-skeuo-yellow text-[#0F172A]"
              : "btn-skeuo-yellow text-[#0F172A]"
          }`}
        >
          {isFinishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : !effectiveCanProceed ? (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Selesaikan Soal</span>
            </>
          ) : activeStepId === totalSteps ? (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Selesai</span>
            </>
          ) : (
            <>
              <span>Lanjut</span>
              <ChevronRight className="w-4 h-4 text-[#0D3B66]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
