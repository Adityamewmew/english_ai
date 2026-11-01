"use client";

import React from "react";
import { ABOUT_METRICS } from "../data/about-data";
import { FadeIn } from "./fade-in";

export function AboutHero() {
  return (
    <section className="relative hero-aura pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      {/* Background Topographic Wave lines */}
      <svg
        className="absolute inset-x-0 top-12 w-full h-[400px] pointer-events-none opacity-20 -z-0"
        viewBox="0 0 1440 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 200 C 240 100, 520 320, 840 160 C 1120 40, 1340 240, 1540 160"
          stroke="#10375C"
          strokeOpacity="0.08"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-100 250 C 280 150, 560 360, 880 200 C 1160 80, 1360 280, 1540 200"
          stroke="#10375C"
          strokeOpacity="0.05"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Header Eyebrow & Title with Fade */}
        <FadeIn delay={0} duration={600} className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-heading font-bold uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" />
            <span>Yayasan Eddys Edukasi Mandiri &bull; Sejak 1980</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight leading-[1.18]">
            Empat Dekade Membina Kemahiran Bahasa Inggris Berstandar Dunia
          </h1>

          <p className="font-body text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Dari bimbingan belajar di Jember tahun 1980 yang dirintis mendiang Bapak Eddy Wartana,
            bertransformasi menjadi lembaga resmi berakreditasi BAN PAUD &amp; PNF, hingga kini
            mengadopsi kecerdasan buatan untuk menghadirkan tutor speaking interaktif 24/7.
          </p>
        </FadeIn>

        {/* Tactile Metrics Cards with Staggered Fade */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ABOUT_METRICS.map((metric, idx) => (
            <FadeIn
              key={metric.label}
              delay={80 + idx * 70}
              duration={500}
              className="h-full"
            >
              <div className="group h-full bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 border-b-4 border-b-slate-300/80 shadow-[0_4px_16px_rgba(16,55,92,0.04)] hover:shadow-xl hover:shadow-slate-300/40 hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-primary tracking-tight group-hover:text-secondary transition-colors duration-200">
                    {metric.value}
                  </div>
                  <div className="text-xs sm:text-sm font-heading font-bold text-slate-800 mt-1.5">
                    {metric.label}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2 leading-relaxed font-body">
                  {metric.sublabel}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
