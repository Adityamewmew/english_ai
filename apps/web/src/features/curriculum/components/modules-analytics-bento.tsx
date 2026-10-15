"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, BarChart2, PieChart } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface ModulesAnalyticsBentoProps {
  categoryLabel: string;
  categoryName: string;
  subLevelId: string;
  subLevelTitle: string;
  totalInSubLevel: number;
  completedInSubLevel: number;
  activeModule?: { id: string; title: string; cefr: string };
}

export function ModulesAnalyticsBento({
  categoryLabel = "A1",
  categoryName = "Starter",
  subLevelId = "A1.1",
  subLevelTitle = "Starter Foundations",
  totalInSubLevel = 13,
  completedInSubLevel = 0,
  activeModule = {
    id: "A1.1-M01",
    title: "Unit 1: One World: Countries, Nationalities & To Be",
    cefr: "A1.1",
  },
}: ModulesAnalyticsBentoProps) {
  const percentCompleted =
    totalInSubLevel > 0
      ? Math.round((completedInSubLevel / totalInSubLevel) * 100)
      : 0;

  // Circumference for r=14 is 2 * Math.PI * 14 = ~88
  const strokeDashoffset = 88 - (88 * percentCompleted) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      {/* 1. Sub-level Progress & Overview (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 rounded-2xl p-4 sm:p-4.5 shadow-2xs flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-xs sm:text-sm text-[#0D3B66] dark:text-white flex items-center gap-1.5 uppercase tracking-tight">
            <PieChart className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A]" />
            <span>{subLevelId} Progress</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {categoryLabel} {categoryName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* SVG Progress Ring - Fixed width/height so it never blows out */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#0D3B66"
                strokeWidth="4"
                strokeDasharray="88"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out dark:stroke-[#F4B41A]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none font-mono">
                {percentCompleted}%
              </span>
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                Done
              </span>
            </div>
          </div>

          {/* Details - min-w-0 ensures text never pushes out */}
          <div className="flex-1 min-w-0 space-y-1.5 text-[11px] font-bold">
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">Status</span>
              <span className="font-mono text-slate-900 dark:text-white truncate">
                {completedInSubLevel} of {totalInSubLevel} Units
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">Track</span>
              <span className="font-mono text-slate-900 dark:text-white truncate" title={subLevelTitle}>
                {subLevelTitle}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">Pace</span>
              <span className="font-mono text-[#0D3B66] dark:text-[#F4B41A] truncate">
                ~15 min / unit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Skills Curriculum Standard (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 rounded-2xl p-4 sm:p-4.5 shadow-2xs flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-xs sm:text-sm text-[#0D3B66] dark:text-white flex items-center gap-1.5 uppercase tracking-tight">
            <BarChart2 className="w-3.5 h-3.5 text-[#9E1B1B] dark:text-[#F4B41A]" />
            <span>4-Skills Curriculum Ratio</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            CEFR Standard
          </span>
        </div>

        <div className="space-y-1.5">
          {[
            { skill: "Reading Lab", percent: 25, color: "bg-[#0D3B66] dark:bg-sky-500", light: "bg-[#0D3B66]/10" },
            { skill: "Listening Practice", percent: 25, color: "bg-[#F4B41A]", light: "bg-[#F4B41A]/20" },
            { skill: "AI Speaking Lab", percent: 25, color: "bg-[#1B4965] dark:bg-teal-500", light: "bg-[#1B4965]/15" },
            { skill: "Grammar & Writing", percent: 25, color: "bg-[#9E1B1B] dark:bg-rose-500", light: "bg-[#9E1B1B]/15" },
          ].map((item) => (
            <div key={item.skill} className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                <span>{item.skill}</span>
                <span className="font-mono text-[9px] text-slate-400">{item.percent}%</span>
              </div>
              <div className={`w-full h-1 rounded-full overflow-hidden ${item.light} dark:bg-slate-800`}>
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Module Quick Resume (md:col-span-2 lg:col-span-4) */}
      <div
        style={{ backgroundColor: "#0D3B66" }}
        className="md:col-span-2 lg:col-span-4 border border-[#082542] border-b-2 rounded-2xl p-4 sm:p-4.5 shadow-xs flex flex-col justify-between gap-3 text-white relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#F4B41A]/15 blur-lg pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#9E1B1B]/20 blur-lg pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[#F4B41A] text-[9px] font-black uppercase tracking-wider font-mono border border-white/10">
            <BookOpen className="w-2.5 h-2.5 text-[#F4B41A]" />
            <span>Active Track · CEFR {activeModule.cefr}</span>
          </div>

          <h4 className="font-black text-xs sm:text-sm leading-snug line-clamp-2 text-white">
            {activeModule.title}
          </h4>
        </div>

        <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/15 relative z-10">
          <span className="text-[11px] font-mono font-extrabold text-[#F4B41A]">
            {activeModule.id}
          </span>

          <Link
            href={`/modules/${activeModule.id}`}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="px-4 py-2 sm:py-1.5 rounded-full btn-skeuo-yellow text-xs sm:text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 min-h-[40px] sm:min-h-[36px] touch-manipulation"
          >
            <span>Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
