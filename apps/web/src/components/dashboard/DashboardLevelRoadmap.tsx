"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, ArrowRight, Play, Layers } from "lucide-react";

export interface DashboardLevelItem {
  id: string;
  cefr: string;
  title: string;
  description: string;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  isUnlocked: boolean;
  lockReason?: string | null;
}

export interface DashboardLevelRoadmapProps {
  levels: DashboardLevelItem[];
}

export function DashboardLevelRoadmap({ levels }: DashboardLevelRoadmapProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Progress Kurikulum</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
            Roadmap Pembelajaran 3 Level
          </h2>
        </div>

        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>Buka Semua Tab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map((lvl) => {
          const isCompleted =
            lvl.totalModules > 0 && lvl.completedModules >= lvl.totalModules;
          const isLocked = !lvl.isUnlocked;

          return (
            <div
              key={lvl.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between gap-5 transition-all shadow-sm ${
                isCompleted
                  ? "bg-white dark:bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60"
                  : !isLocked
                  ? "bg-white dark:bg-slate-900 border-blue-500/30 hover:border-blue-500/60"
                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
              }`}
            >
              <div className="space-y-3">
                {/* Header: CEFR & Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    Level {lvl.cefr}
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Selesai</span>
                    </span>
                  ) : !isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-300/40">
                      <Play className="w-3 h-3 text-blue-600 fill-current" />
                      <span>Aktif</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      <Lock className="w-3 h-3" />
                      <span>Terkunci</span>
                    </span>
                  )}
                </div>

                {/* Level Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {lvl.description || "Tingkatkan keterampilan speaking dan pemahaman kontekstual."}
                  </p>
                </div>

                {/* Progress Bar & Counter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>
                      {lvl.completedModules} dari {lvl.totalModules} Modul
                    </span>
                    <span>{lvl.progressPercent}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500"
                          : !isLocked
                          ? "bg-blue-600"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      style={{ width: `${lvl.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/modules?level=${lvl.id}`}
                  className={`w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isCompleted
                      ? "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300"
                      : !isLocked
                      ? "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-700 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <span>{isCompleted ? "Ulangi Latihan Level" : !isLocked ? "Buka Tab Modul" : "Lihat Syarat Buka"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
