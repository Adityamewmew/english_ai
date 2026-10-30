"use client";

import React from "react";
import { CheckCircle2, Headphones, Award } from "lucide-react";
import { HowItWorksStep } from "../data/how-it-works-data";

interface HowItWorksTabsProps {
  steps: HowItWorksStep[];
  activeStep: number;
  onSelectStep: (index: number) => void;
  progressPercent: number;
}

export function HowItWorksTabs({
  steps,
  activeStep,
  onSelectStep,
  progressPercent,
}: HowItWorksTabsProps) {
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return CheckCircle2;
      case 1:
        return Headphones;
      default:
        return Award;
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const isActive = activeStep === idx;
        const Icon = getStepIcon(idx);

        return (
          <div
            key={step.id}
            onClick={() => onSelectStep(idx)}
            className={`cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden border ${
              isActive
                ? "bg-white border-amber-300/80 shadow-md"
                : "bg-white/60 hover:bg-white/90 border-slate-200/70 hover:border-slate-300 shadow-2xs"
            }`}
            style={
              isActive
                ? {
                    boxShadow:
                      "0 12px 28px -6px rgba(16, 55, 92, 0.1), 0 2px 0 #fde68a, inset 0 1px 0 #ffffff",
                  }
                : {
                    boxShadow: "0 2px 0 #e2e8f0",
                  }
            }
          >
            {/* Active Auto-play Progress Bar Indicator */}
            {isActive && (
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-amber-100 overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-secondary transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Step Badge / Number Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all font-heading font-black text-sm ${
                  isActive
                    ? "bg-primary text-accent shadow-xs"
                    : "bg-surface text-slate-400 border border-slate-200"
                }`}
                style={
                  isActive
                    ? {
                        boxShadow: "0 2px 0 #081d33, inset 0 1px 1px rgba(255,255,255,0.3)",
                      }
                    : {}
                }
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-accent" : "text-slate-400"}`} />
              </div>

              {/* Step Content */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-heading font-black tracking-wider uppercase ${
                      isActive ? "text-secondary" : "text-slate-400"
                    }`}
                  >
                    {step.stepLabel} &bull; {step.subtitle}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isActive ? "text-primary" : "text-slate-300"
                    }`}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-primary leading-snug">
                  {step.title}
                </h3>

                <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
