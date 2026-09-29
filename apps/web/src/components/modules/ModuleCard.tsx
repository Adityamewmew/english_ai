"use client";

import React from "react";
import { Lock, CheckCircle2, Award, Clock, ArrowRight, BookOpen } from "lucide-react";

export interface ModuleItemProps {
  id: string;
  title: string;
  cefr: string;
  group: string;
  objective: string;
  complexity: string;
  estimatedMinutes: number;
  isExam: boolean;
  passingScore: number;
  status: "locked" | "unlocked" | "completed";
  score?: number | null;
  orderIndex: number;
}

interface ModuleCardProps {
  module: ModuleItemProps;
  onSelect?: (moduleId: string) => void;
}

export function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const isLocked = module.status === "locked";
  const isCompleted = module.status === "completed";

  const getComplexityBadge = (c: string) => {
    switch (c) {
      case "short":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "deep":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
        isLocked
          ? "border-slate-200 bg-slate-50/75 opacity-70 dark:border-slate-800 dark:bg-slate-900/30"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-800/40 dark:bg-emerald-950/10"
          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div>
        {/* Header row: CEFR / Exam badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Modul {module.orderIndex}
            </span>

            {module.isExam ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-700/50">
                <Award className="w-3 h-3" />
                Ujian Kelulusan
              </span>
            ) : (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${getComplexityBadge(
                  module.complexity
                )}`}
              >
                {module.complexity}
              </span>
            )}
          </div>

          <div>
            {isCompleted ? (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lulus {module.score ? `(${module.score}%)` : ""}</span>
              </div>
            ) : isLocked ? (
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span>Terkunci</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                <span>Terbuka</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-base mb-1.5 ${
            isLocked
              ? "text-slate-600 dark:text-slate-400"
              : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
          }`}
        >
          {module.title}
        </h3>

        {/* Objective */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {module.objective}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {module.estimatedMinutes} menit
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {module.group}
          </span>
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={onSelect ? () => onSelect(module.id) : undefined}
          className={`inline-flex items-center gap-1 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors ${
            isLocked
              ? "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
              : isCompleted
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          }`}
        >
          <span>{isCompleted ? "Ulangi" : "Mulai"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
