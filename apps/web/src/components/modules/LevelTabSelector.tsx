import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";

interface LevelTabItem {
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
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {levels.map((lvl) => {
        const isActive = lvl.id === activeLevelId;
        const isCompleted = lvl.progressPercent === 100 && lvl.totalModules > 0;

        if (!lvl.isUnlocked) {
          return (
            <div
              key={lvl.id}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs font-semibold select-none shrink-0"
              title="Selesaikan modul prasyarat untuk membuka level ini"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Level {lvl.cefr}: {lvl.title}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold">
                Terkunci
              </span>
            </div>
          );
        }

        return (
          <Link
            key={lvl.id}
            href={`/modules?level=${lvl.id}`}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-emerald-300" : "text-emerald-500"
                }`}
              />
            ) : (
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-blue-200" : "text-blue-500"
                }`}
              />
            )}
            <span>Level {lvl.cefr}: {lvl.title}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {lvl.completedModules}/{lvl.totalModules}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
