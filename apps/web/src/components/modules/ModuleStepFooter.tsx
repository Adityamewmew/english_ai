"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animeButtonPop } from "@/lib/anime-effects";
import { MODULE_STEPS } from "./ModuleLessonSidebar";

interface ModuleStepFooterProps {
  currentStep: number;
  totalSteps?: number;
  canAdvance?: boolean;
  advanceTooltip?: string;
  onPrev: () => void;
  onNext: () => void;
}

export function ModuleStepFooter({
  currentStep,
  totalSteps = MODULE_STEPS.length,
  canAdvance = true,
  advanceTooltip,
  onPrev,
  onNext,
}: ModuleStepFooterProps) {
  const currentStepDef = MODULE_STEPS.find((s) => s.stepNumber === currentStep);
  const nextStepDef = MODULE_STEPS.find((s) => s.stepNumber === currentStep + 1);
  const prevStepDef = MODULE_STEPS.find((s) => s.stepNumber === currentStep - 1);

  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  // Hitung sisa estimasi waktu belajar
  const remainingMinutes = MODULE_STEPS.slice(currentStep - 1).reduce(
    (acc, s) => acc + (s.estimatedMinutes || 3),
    0
  );

  return (
    <footer className="mt-14 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 sm:static z-30 bg-white/95 dark:bg-slate-900/95 sm:bg-transparent backdrop-blur-md -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:py-0 shadow-lg sm:shadow-none transition-all">
      {/* Previous Step Button */}
      <div className="w-full sm:w-auto">
        {!isFirst ? (
          <Button
            variant="outline"
            size="md"
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onPrev();
            }}
            className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-bold shadow-xs min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya: {prevStepDef?.title || "Sebelumnya"}</span>
          </Button>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
            Langkah pertama dari {totalSteps}
          </div>
        )}
      </div>

      {/* Step Counter Indicator with Remaining Time */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 flex-wrap">
        <span>Langkah {currentStep} dari {totalSteps}</span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="text-indigo-600 dark:text-indigo-400 normal-case font-semibold">~{remainingMinutes} menit tersisa</span>
      </div>

      {/* Next Step Button */}
      <div className="w-full sm:w-auto">
        {!isLast ? (
          <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-auto">
            <Button
              size="md"
              disabled={!canAdvance}
              onClick={(e) => {
                if (canAdvance) {
                  animeButtonPop(e.currentTarget);
                  onNext();
                }
              }}
              title={advanceTooltip}
              className={`w-full sm:w-auto gap-2 text-xs sm:text-sm font-bold shadow-sm min-h-[44px] active:translate-y-0.5 will-change-transform ${
                !canAdvance
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : currentStep === 6
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <span>
                {currentStep === 6
                  ? "Lanjut ke Speaking Lab"
                  : currentStep === 7
                  ? "Lanjut ke Kuis Evaluasi"
                  : `Lanjut: ${nextStepDef?.title || "Berikutnya"}`}
              </span>
              {!canAdvance ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            {advanceTooltip && !canAdvance && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium text-center sm:text-right">
                {advanceTooltip}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
