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
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 rounded-[22px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-[#0D3B66] dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <PieChart className="w-4 h-4 text-[#0D3B66]" />
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
              {/* A1 Segment (Deep Navy) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#0D3B66"
                strokeWidth="4"
                strokeDasharray="25 75"
                strokeDashoffset="0"
              />
              {/* A2 Segment (Petrol Navy) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#1B4965"
                strokeWidth="4"
                strokeDasharray="22 78"
                strokeDashoffset="-25"
              />
              {/* B1 Segment (Golden Yellow) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#F4B41A"
                strokeWidth="4"
                strokeDasharray="22 78"
                strokeDashoffset="-47"
              />
              {/* B2/C Segment (Crimson Red) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#9E1B1B"
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
                <span className="w-2 h-2 rounded-full bg-[#0D3B66]" />
                <span>A1 Starter</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">39 Mods</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#1B4965]" />
                <span>A2 Elementary</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">39 Mods</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#F4B41A]" />
                <span>B1 Intermediate</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">40 Mods</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#9E1B1B]" />
                <span>B2/C Advanced</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white">62 Mods</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Skills Mastery Bar Chart (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 rounded-[22px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-sm text-[#0D3B66] dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <BarChart2 className="w-4 h-4 text-[#9E1B1B]" />
            <span>4-Skills Curriculum Ratio</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Balance
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {[
            { skill: "Reading Lab", percent: 92, color: "bg-[#0D3B66]", light: "bg-[#0D3B66]/10" },
            { skill: "Listening Practice", percent: 88, color: "bg-[#F4B41A]", light: "bg-[#F4B41A]/20" },
            { skill: "Speaking Lab", percent: 85, color: "bg-[#1B4965]", light: "bg-[#1B4965]/15" },
            { skill: "Grammar & Writing", percent: 78, color: "bg-[#9E1B1B]", light: "bg-[#9E1B1B]/15" },
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
        style={{ backgroundColor: "#0D3B66" }}
        className="lg:col-span-4 border border-[#082542] border-b-2 rounded-[22px] p-5 shadow-md flex flex-col justify-between gap-4 text-white relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#F4B41A]/15 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#9E1B1B]/20 blur-xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#F4B41A] text-[10px] font-black uppercase tracking-wider shadow-2xs font-mono border border-white/10">
            <Sparkles className="w-3 h-3 text-[#F4B41A]" />
            <span>Active Track · CEFR {activeModule.cefr}</span>
          </div>

          <h4 className="font-black text-sm sm:text-base leading-snug line-clamp-2 text-white">
            {activeModule.title}
          </h4>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Continue learning vocabulary, reading passages, and interactive grammar exercises.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/15 relative z-10">
          <span className="text-xs font-mono font-extrabold text-[#F4B41A]">
            {activeModule.id}
          </span>

          <Link
            href={`/modules/${activeModule.id}`}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="px-4 py-2 rounded-full btn-skeuo-yellow text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
