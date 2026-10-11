"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight, BarChart2, PieChart, CheckCircle2 } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface ModulesAnalyticsBentoProps {
  totalModules: number;
  completedModules: number;
  activeModule?: { id: string; title: string; cefr: string };
}

export function ModulesAnalyticsBento({
  totalModules = 180,
  completedModules = 1,
  activeModule = {
    id: "A1.1-M01",
    title: "Unit 1: One World: Countries, Nationalities & To Be",
    cefr: "A1.1",
  },
}: ModulesAnalyticsBentoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
      {/* 1. Courses by Category Donut Chart (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <span>Modules by Level</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            CEFR Standard
          </span>
        </div>

        <div className="flex items-center gap-4 py-1">
          {/* SVG Donut Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              {/* A1 Segment (cyan) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeDasharray="25 75"
                strokeDashoffset="0"
              />
              {/* A2 Segment (pink) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#ec4899"
                strokeWidth="4"
                strokeDasharray="22 78"
                strokeDashoffset="-25"
              />
              {/* B1 Segment (amber) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="22 78"
                strokeDashoffset="-47"
              />
              {/* B2/C Segment (teal) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="31 69"
                strokeDashoffset="-69"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                {totalModules}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Modules
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 space-y-1.5 text-[11px] font-bold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>A1 Starter</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">39 Mods</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>A2 Elementary</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">39 Mods</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>B1 Intermediate</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">40 Mods</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>B2/C Advanced</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">62 Mods</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Skills Mastery Bar Chart (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-pink-600" />
            <span>4-Skills Curriculum Ratio</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Balance
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {[
            { skill: "Reading Lab", percent: 92, color: "bg-indigo-600", light: "bg-indigo-100" },
            { skill: "Listening Practice", percent: 88, color: "bg-pink-600", light: "bg-pink-100" },
            { skill: "AI Speaking Tutor", percent: 85, color: "bg-amber-500", light: "bg-amber-100" },
            { skill: "Grammar & Writing", percent: 78, color: "bg-emerald-600", light: "bg-emerald-100" },
          ].map((item) => (
            <div key={item.skill} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                <span>{item.skill}</span>
                <span className="font-mono">{item.percent}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${item.light} dark:bg-slate-800`}>
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Module Quick Resume (lg:col-span-4) */}
      <div
        style={{ backgroundColor: "#d9dbfc" }}
        className="lg:col-span-4 border border-indigo-200/80 rounded-[28px] p-5 shadow-2xs flex flex-col justify-between gap-4 text-slate-900"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 text-indigo-800 text-[10px] font-black uppercase tracking-wider shadow-2xs font-mono">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Active Track · CEFR {activeModule.cefr}</span>
          </div>

          <h4 className="font-black text-sm sm:text-base leading-snug line-clamp-2">
            {activeModule.title}
          </h4>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Continue learning vocabulary, reading passages, and interactive grammar exercises.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between gap-2 border-t border-indigo-200/60">
          <span className="text-xs font-mono font-extrabold text-indigo-900">
            {activeModule.id}
          </span>

          <Link
            href={`/modules/${activeModule.id}`}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
