"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface StudentHeroBannerProps {
  studentName?: string;
  currentCefr?: string;
  activeModuleCode?: string;
}

export function StudentHeroBanner({
  studentName = "Student",
  currentCefr = "A1.1",
  activeModuleCode = "A1.1-M01",
}: StudentHeroBannerProps) {
  return (
    <div
      style={{ backgroundColor: "#0D3B66" }}
      className="relative overflow-hidden rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-md border border-[#082542]"
    >
      {/* Organic Brand Wave Accents */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#F4B41A]/25 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-[#9E1B1B]/35 blur-3xl pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10 max-w-lg space-y-3.5 text-center md:text-left w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#F4B41A] text-xs font-black uppercase tracking-wider shadow-2xs backdrop-blur-xs border border-white/10">
          <BookOpen className="w-3.5 h-3.5 text-[#F4B41A]" />
          <span>CEFR Level {currentCefr} · English AI Companion</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          Welcome back, {studentName}! 👋
        </h2>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Ready to advance your English fluency today? Continue your structured curriculum modules or practice real-time speaking with Mr. Khoirul.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3">
          <Link
            href={`/modules/${activeModuleCode}`}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full btn-skeuo-yellow text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation font-bold"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          <Link
            href="/call"
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation font-bold backdrop-blur-xs"
          >
            <span>Speaking Practice</span>
          </Link>
        </div>
      </div>

      {/* Right Illustration Art */}
      <div className="relative z-10 shrink-0 w-36 sm:w-52 md:w-60 h-32 sm:h-40 md:h-48 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/hero-learning.svg"
          alt="Online Learning Illustration"
          className="w-full h-full object-contain drop-shadow-xs"
        />
      </div>
    </div>
  );
}
