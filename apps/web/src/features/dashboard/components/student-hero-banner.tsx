"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface StudentHeroBannerProps {
  activeModuleCode?: string;
  activeModuleTitle?: string;
  currentCefr?: string;
}

export function StudentHeroBanner({
  activeModuleCode = "A1.1-M01",
  activeModuleTitle = "Unit 1: One World: Countries, Nationalities & To Be",
  currentCefr = "A1.1",
}: StudentHeroBannerProps) {
  return (
    <div
      style={{ backgroundColor: "#d9dbfc" }}
      className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs border border-indigo-200/70"
    >
      {/* Decorative blurred circles */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-48 h-48 rounded-full bg-pink-300/30 blur-3xl pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10 max-w-md space-y-3.5 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-indigo-800 text-xs font-black uppercase tracking-wider shadow-2xs backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active Module · CEFR {currentCefr}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          {activeModuleTitle}
        </h2>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          Master target vocabulary, reading passages, contraction morphing, and interactive sentence building.
        </p>

        <div className="pt-1.5">
          <Link
            href={`/modules/${activeModuleCode}`}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Resume Module</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Right Illustration Art from Internet */}
      <div className="relative z-10 shrink-0 w-48 sm:w-60 h-40 sm:h-48 flex items-center justify-center">
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
