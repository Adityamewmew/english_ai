import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";

export interface LevelTabItem {
  id: string;
  cefr: string;
  title: string;
  isUnlocked: boolean;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
}

interface LevelTabSelectorProps {
  levels: LevelTabItem[];
  activeLevelId: string;
}

export function LevelTabSelector({ levels, activeLevelId }: LevelTabSelectorProps) {
  const activeLevel = levels.find((l) => l.id === activeLevelId) || levels[0];
  const activeCefr = activeLevel?.cefr || "A1";

  // Group levels by CEFR
  const cefrList = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const cefrGroups = cefrList
    .map((cefr) => {
      const subLevels = levels.filter((l) => l.cefr.toUpperCase().startsWith(cefr));
      if (subLevels.length === 0) return null;
      const completed = subLevels.reduce((acc, curr) => acc + curr.completedModules, 0);
      const total = subLevels.reduce((acc, curr) => acc + curr.totalModules, 0);
      const isUnlocked = subLevels.some((l) => l.isUnlocked);
      const firstTarget = subLevels.find((l) => l.isUnlocked && l.completedModules < l.totalModules) || subLevels[0];

      return {
        cefr,
        isUnlocked,
        completed,
        total,
        isCompleted: total > 0 && completed === total,
        firstTargetId: firstTarget.id,
        subLevels,
      };
    })
    .filter(Boolean) as Array<{
    cefr: string;
    isUnlocked: boolean;
    completed: number;
    total: number;
    isCompleted: boolean;
    firstTargetId: string;
    subLevels: LevelTabItem[];
  }>;

  // Active CEFR's sub-levels
  const currentSubLevels = levels.filter(
    (l) => l.cefr.toUpperCase().startsWith(activeCefr)
  );

  return (
    <div className="space-y-3">
      {/* Tier 1: CEFR Level Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {cefrGroups.map((grp) => {
          const isCefrActive = grp.cefr === activeCefr;

          if (!grp.isUnlocked) {
            return (
              <div
                key={grp.cefr}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs font-semibold select-none shrink-0"
                title="Selesaikan level sebelumnya untuk membuka"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Level {grp.cefr}</span>
              </div>
            );
          }

          return (
            <Link
              key={grp.cefr}
              href={`/modules?level=${grp.firstTargetId}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                isCefrActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {grp.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${isCefrActive ? "bg-blue-400" : "bg-slate-300 dark:bg-slate-700"}`} />
              )}
              <span>Level {grp.cefr}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isCefrActive
                    ? "bg-white/20 text-white dark:bg-black/10 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {grp.completed}/{grp.total}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tier 2: Sub-Level Pills for Active CEFR */}
      {currentSubLevels.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          {currentSubLevels.map((subLvl) => {
            const isSubActive = subLvl.id === activeLevelId;
            const isCompleted = subLvl.completedModules === subLvl.totalModules && subLvl.totalModules > 0;

            if (!subLvl.isUnlocked) {
              return (
                <div
                  key={subLvl.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-400 dark:text-slate-600 cursor-not-allowed text-xs font-medium select-none shrink-0"
                  title="Selesaikan sub-level sebelumnya untuk membuka"
                >
                  <Lock className="w-3 h-3 text-amber-500/70" />
                  <span>{subLvl.title}</span>
                </div>
              );
            }

            return (
              <Link
                key={subLvl.id}
                href={`/modules?level=${subLvl.id}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isSubActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isSubActive ? "text-emerald-300" : "text-emerald-500"
                    }`}
                  />
                ) : (
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isSubActive ? "text-blue-200" : "text-blue-500"
                    }`}
                  />
                )}
                <span>{subLvl.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isSubActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {subLvl.completedModules}/{subLvl.totalModules}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
