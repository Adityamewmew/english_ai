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

  return (
    <footer className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Previous Step Button */}
      <div>
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
            <span>Sebelumnya: {prevStepDef?.title || "Langkah Sebelumnya"}</span>
          </Button>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Langkah pertama dari {totalSteps}
          </div>
        )}
      </div>

      {/* Step Counter Indicator */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        Langkah {currentStep} dari {totalSteps}
      </div>

      {/* Next Step Button */}
      <div>
        {!isLast ? (
          <div className="flex flex-col items-end gap-1">
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
                  : `Lanjut: ${nextStepDef?.title || "Langkah Berikutnya"}`}
              </span>
              {!canAdvance ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            {advanceTooltip && !canAdvance && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                {advanceTooltip}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
