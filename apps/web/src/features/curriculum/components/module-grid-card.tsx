"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, Clock, BookOpen, Sparkles } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

export interface CurriculumModuleItem {
  id: string;
  title: string;
  cefr: string;
  description?: string;
  status: "unlocked" | "completed" | "locked";
  score?: number | null;
  skillFocus?: string;
  orderIndex?: number;
}

interface ModuleGridCardProps {
  module: CurriculumModuleItem;
  index: number;
}

const THUMBNAIL_STYLES = [
  { bg: "#d9dbfc", border: "#c5cafc", img: "/illustrations/hero-learning.svg", badge: "bg-indigo-100 text-indigo-700" },
  { bg: "#fce7f3", border: "#fbcfe8", img: "/illustrations/article-vocab.svg", badge: "bg-pink-100 text-pink-700" },
  { bg: "#fef3c7", border: "#fde68a", img: "/illustrations/student-books.svg", badge: "bg-amber-100 text-amber-700" },
  { bg: "#e0e7ff", border: "#c7d2fe", img: "/illustrations/article-guide.svg", badge: "bg-cyan-100 text-cyan-700" },
];

export function ModuleGridCard({ module, index }: ModuleGridCardProps) {
  const isLocked = module.status === "locked";
  const isCompleted = module.status === "completed";
  const style = THUMBNAIL_STYLES[index % THUMBNAIL_STYLES.length];

  return (
    <div
      className={`group bg-white dark:bg-slate-900 border rounded-[26px] overflow-hidden p-3.5 shadow-2xs transition-all duration-200 flex flex-col justify-between gap-3.5 ${
        isLocked
          ? "border-slate-200/60 dark:border-slate-800/60 opacity-75"
          : "border-slate-200/90 dark:border-slate-800 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700"
      }`}
    >
      {/* Top Illustration Thumbnail Frame */}
      <div
        style={{ backgroundColor: style.bg }}
        className="w-full h-36 rounded-2xl flex items-center justify-center relative overflow-hidden border border-black/5 p-2 group-hover:scale-[1.01] transition-transform"
      >
        {/* Level Pill Badge in corner */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs font-mono ${style.badge}`}
          >
            CEFR {module.cefr}
          </span>
        </div>

        {/* Status Indicator */}
        {isCompleted && (
          <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
        {isLocked && (
          <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-slate-900/60 backdrop-blur-xs text-white flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Real Internet SVG illustration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={style.img}
          alt={module.title}
          className="w-full h-full object-contain drop-shadow-2xs"
        />
      </div>

      {/* Meta row: Category & exercise count */}
      <div className="px-1 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
            <span className="uppercase tracking-wider font-mono text-indigo-600 dark:text-indigo-400">
              {module.id}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <BookOpen className="w-3 h-3" />
              <span>10 Exercises</span>
            </span>
          </div>

          {/* Module Title */}
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {module.title}
          </h4>

          {/* Module Description */}
          {module.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {module.description}
            </p>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Avatar Stack representation of students */}
          <div className="flex items-center -space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-500 border border-white dark:border-slate-900 text-white font-black text-[8px] flex items-center justify-center">
              M
            </div>
            <div className="w-6 h-6 rounded-full bg-pink-500 border border-white dark:border-slate-900 text-white font-black text-[8px] flex items-center justify-center">
              L
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-500 border border-white dark:border-slate-900 text-white font-black text-[8px] flex items-center justify-center">
              K
            </div>
          </div>

          {/* CTA Action Pill */}
          {isLocked ? (
            <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1 cursor-not-allowed">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
          ) : (
            <Link
              href={`/modules/${module.id}`}
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white"
              }`}
            >
              <span>{isCompleted ? "Review" : "Start"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
