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
  children?: React.ReactNode;
}

export function ModuleStagePlaylist({
  steps,
  activeStepId,
  onSelectStep,
  xpPoints,
  completedCount,
  totalCount,
  children,
}: ModuleStagePlaylistProps) {
  const progressPercent = Math.min(100, Math.round((completedCount / Math.max(1, totalCount)) * 100));

  return (
    <div className="flex flex-col gap-2.5 select-none">
      {/* 1. Study Progress Card with Circular Ring (Gambar 1 style) */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5">
          {/* Circular SVG Progress Ring */}
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-700 ease-out"
                stroke="#0D3B66"
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-[#0D3B66] dark:text-[#F4B41A]">
              {progressPercent}%
            </span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Study Progress
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
              Track milestones & progress.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Course Content Playlist with Internal Scroll (Max 3-4 steps visible) */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-center justify-between pb-1.5 shrink-0 border-b border-slate-100 dark:border-slate-800/80 mb-1.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Course Content
          </h4>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            {steps.length} Steps
          </span>
        </div>

        {/* Scrollable Step List (Max 3-4 steps displayed, rest scroll smoothly) */}
        <div className="max-h-[175px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {steps.map((s, idx) => {
            const isActive = s.id === activeStepId;
            const isDone = s.isCompleted;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectStep(s.id)}
                className={`w-full text-left p-1.5 rounded-xl transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-[#0D3B66]/10 dark:bg-[#0D3B66]/30 border-[#0D3B66] dark:border-[#F4B41A] ring-1 ring-[#0D3B66]/20 shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)]"
                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Step Number Circle */}
                  <div
                    className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isActive
                        ? "bg-[#0D3B66] text-white shadow-2xs"
                        : isDone
                        ? "bg-[#F4B41A]/20 text-[#0F172A] border border-[#F4B41A]/40"
                        : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Title & Duration */}
                  <div className="min-w-0 leading-tight">
                    <h5
                      className={`text-xs font-semibold truncate ${
                        isActive
                          ? "text-[#0D3B66] dark:text-[#F4B41A] font-bold"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                      {s.duration}
                    </span>
                  </div>
                </div>

                {/* Status Percentage / Check Pill */}
                <div className="shrink-0">
                  {isDone ? (
                    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-[#0D3B66] text-white text-[9px] font-bold shadow-2xs">
                      100%
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-[#F4B41A] text-[#0F172A] text-[9px] font-bold shadow-2xs">
                      75%
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-medium border border-slate-200/60 dark:border-slate-700">
                      0%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Docked Arcade Companion inside Sidebar (Always 100% visible) */}
      {children && (
        <div className="shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
