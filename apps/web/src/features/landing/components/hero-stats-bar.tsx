"use client";

import React from "react";
import { HERO_STATS } from "../data/landing-data";

export function HeroStatsBar() {
  return (
    <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-200/70 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-2 text-center items-center">
        {HERO_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="hero-stat-anim-item relative px-2 sm:px-4 md:border-r md:last:border-r-0 md:border-slate-200/80"
          >
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium leading-snug max-w-[180px] mx-auto">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

