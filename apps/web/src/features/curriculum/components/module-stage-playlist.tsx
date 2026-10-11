"use client";

import React from "react";
import { CheckCircle2, Play } from "lucide-react";

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
}

export function ModuleStagePlaylist({
  steps,
  activeStepId,
  onSelectStep,
  xpPoints,
  completedCount,
  totalCount,
}: ModuleStagePlaylistProps) {
  const progressPercent = Math.min(100, Math.round((completedCount / Math.max(1, totalCount)) * 100));

  return (
    <div className="space-y-6">
      {/* 1. Study Progress with Circular Ring (Gambar 1 style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          {/* Circular SVG Progress Ring */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800 dark:text-white">
              {progressPercent}%
            </span>
          </div>

          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Study Progress
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Track your learning milestones and where you left off.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Course Content Playlist (Gambar 1 style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Course Content
          </h4>
          <span className="text-xs font-semibold text-slate-400">
            {steps.length} Steps
          </span>
        </div>

        {/* Step List matching Gambar 1 */}
        <div className="space-y-2.5">
          {steps.map((s, idx) => {
            const isActive = s.id === activeStepId;
            const isDone = s.isCompleted;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectStep(s.id)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer border ${
                  isActive
                    ? "bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 ring-1 ring-blue-500/20 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Step Number Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : isDone
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Title & Duration */}
                  <div className="min-w-0 leading-tight">
                    <h5
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isActive
                          ? "text-blue-950 dark:text-white font-bold"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </h5>
                    <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                      {s.duration}
                    </span>
                  </div>
                </div>

                {/* Status Percentage / Check Pill (Gambar 1 style) */}
                <div className="shrink-0">
                  {isDone ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200/60 dark:border-blue-900">
                      100%
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      75%
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700">
                      0%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
