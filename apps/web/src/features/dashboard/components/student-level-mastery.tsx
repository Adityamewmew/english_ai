"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, PhoneCall, ArrowRight, Award, Sparkles } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface StudentLevelMasteryProps {
  currentCefr?: string;
  levelModules?: any[];
  activeModule?: any;
}

export function StudentLevelMasteryCard({
  currentCefr = "A1.1",
  levelModules = [],
  activeModule,
}: StudentLevelMasteryProps) {
  const totalInLevel = levelModules.length || 10;
  const completedInLevel = levelModules.filter((m) => m.status === "completed").length;
  const progressPercent = totalInLevel > 0 ? Math.round((completedInLevel / totalInLevel) * 100) : 0;

  const nextModule =
    activeModule ||
    levelModules.find((m) => m.status === "unlocked") ||
    levelModules[0] || {
      id: "A1.1-M01",
      title: "Unit 1: One World: Countries, Nationalities & To Be",
      cefr: currentCefr,
    };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg sm:text-xl font-black text-[#0D3B66] dark:text-white uppercase tracking-tight">
          Active CEFR Target
        </h3>
      </div>

      <div className="space-y-4">
        {/* Main Mastery Progress Card */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#0D3B66] text-white shadow-2xs font-mono">
                CEFR {currentCefr}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Cambridge Track
              </span>
            </div>
            <Award className="w-5 h-5 text-[#F4B41A]" />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
              Core Daily Communication Track
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Focus on core sentence construction, essential vocabulary, and spontaneous spoken interaction.
            </p>
          </div>

          {/* Progress Bar & Counter */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">
                {completedInLevel} of {totalInLevel} Units Completed
              </span>
              <span className="font-mono text-[#0D3B66] dark:text-[#F4B41A]">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-[#0D3B66] dark:bg-[#F4B41A] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Target Unit Spotlight */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4B41A]/20 text-[#854D0E] border border-[#F4B41A]/40">
              Next Target Unit
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {nextModule.id}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
              {nextModule.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
              {nextModule.objective || "Interactive coursework covering grammar, reading comprehension, and oral fluency drills."}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <Link
              href={`/modules/${nextModule.id}`}
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="w-full py-2.5 px-4 rounded-full btn-skeuo-navy text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] touch-manipulation"
            >
              <span>Continue Course</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Speaking Lab Mini Callout */}
        <div className="p-4 rounded-[22px] bg-amber-50/60 dark:bg-slate-900/60 border border-[#F4B41A]/30 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F4B41A] text-[#0F172A] flex items-center justify-center shrink-0 shadow-2xs">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A]">
                Open Speaking Session
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Have 5 minutes? Practice spontaneous conversation with Mr. Khoirul.
              </p>
            </div>
          </div>
          <Link
            href="/call"
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F4B41A]/20 border border-[#F4B41A]/40 text-[#854D0E] dark:text-[#F4B41A] text-xs font-bold transition-all text-center block cursor-pointer"
          >
            Start Voice Call Now
          </Link>
        </div>
      </div>
    </div>
  );
}
