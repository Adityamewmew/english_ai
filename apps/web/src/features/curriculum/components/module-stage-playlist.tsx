"use client";

import React from "react";
import { CheckCircle2, Circle, Lock } from "lucide-react";

export interface PlaylistStepItem {
  id: number;
  title: string;
  type: string;
  duration: string;
  isCompleted: boolean;
}

interface ModuleStagePlaylistProps {
  steps: PlaylistStepItem[];
  activeStepId: number;
  onSelectStep: (stepId: number) => void;
  xpPoints: number;
  completedCount: number;
  totalCount: number;
  maxAccessibleStepId?: number;
  isAdmin?: boolean;
  children?: React.ReactNode;
}

export function ModuleStagePlaylist({
  steps,
  activeStepId,
  onSelectStep,
  completedCount,
  totalCount,
  maxAccessibleStepId,
  isAdmin = false,
  children,
}: ModuleStagePlaylistProps) {
  const progressPercent = Math.min(100, Math.round((completedCount / Math.max(1, totalCount)) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4 select-none">
      {/* 1. Header with Circular Progress Ring */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Circular SVG Progress Ring */}
          <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-500 ease-out text-[#0D3B66] dark:text-[#F4B41A]"
                stroke="currentColor"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-[#0D3B66] dark:text-[#F4B41A] font-mono">
              {progressPercent}%
            </span>
          </div>

          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Learning Flow
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {steps.length} Steps
        </span>
      </div>

      {/* 2. Step Items List (Scrolls smoothly with generous room, pb-16 for floating companion) */}
      <div className="space-y-1.5 max-h-[340px] lg:max-h-[calc(100vh-210px)] overflow-y-auto pr-0.5 pb-8 lg:pb-16">
        {steps.map((s, idx) => {
          const isActive = s.id === activeStepId;
          const isDone = s.isCompleted;
          const isLocked = !isAdmin && (maxAccessibleStepId ? s.id > maxAccessibleStepId && !isDone : false);

          return (
            <button
              key={s.id}
              type="button"
              disabled={isLocked}
              onClick={() => onSelectStep(s.id)}
              className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all duration-150 flex items-center justify-between gap-2.5 border min-h-[44px] touch-manipulation ${
                isLocked
                  ? "opacity-50 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 text-slate-400"
                  : isActive
                  ? "bg-[#0D3B66] text-white border-[#0D3B66] shadow-sm cursor-pointer"
                  : isDone
                  ? "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                  : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 text-slate-700 dark:text-slate-300 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Step Number Circle */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isDone
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Title & Duration */}
                <div className="min-w-0 leading-snug">
                  <h5
                    className={`text-xs truncate ${
                      isActive
                        ? "text-white font-bold"
                        : "text-slate-800 dark:text-slate-200 font-semibold"
                    }`}
                  >
                    {s.title.replace(/^\d+\.\s*/, "")}
                  </h5>
                  <span
                    className={`text-[10px] block font-mono mt-0.5 ${
                      isActive ? "text-blue-100/80" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {s.duration}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0 flex items-center">
                {isDone ? (
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isActive ? "text-emerald-300" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  />
                ) : isActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-white/25 text-white">
                    Aktif
                  </span>
                ) : isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Optional children */}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
