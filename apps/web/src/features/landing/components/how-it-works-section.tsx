"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { HowItWorksRoadmap } from "./how-it-works-roadmap";

export function HowItWorksSection() {
  return (
    <section id="alur" className="py-14 md:py-20 px-5 sm:px-6 md:px-10 lg:px-12 relative overflow-hidden bg-gradient-to-b from-white via-[#F4F6FF]/35 to-white">
      {/* Topographic Wave Lines */}
      <svg
        className="wave-lines absolute inset-x-0 top-0 w-full h-[450px] pointer-events-none opacity-20 -z-0"
        viewBox="0 0 1440 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-80 180 C 240 60, 520 320, 840 160 C 1120 40, 1340 240, 1540 160"
          stroke="#10375C"
          strokeOpacity="0.08"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-80 240 C 280 100, 560 360, 880 200 C 1160 80, 1360 280, 1540 200"
          stroke="#10375C"
          strokeOpacity="0.05"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 md:space-y-8">
        {/* Header & Typography Area */}
        <div className="max-w-xl mx-auto text-center space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10 mb-1">
            Alur Belajar
          </span>
          <h2 className="font-heading font-extrabold text-primary text-2xl sm:text-3xl md:text-[32px] tracking-tight leading-snug">
            Dari pemula hingga <span className="text-secondary">percaya diri bicara</span>
          </h2>

          <p className="font-body text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Tahapan belajar santai langkah demi langkah untuk melatih kebiasaan ngobrol sampai lancar tanpa rasa takut salah.
          </p>

          {/* Two Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/placement"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary/95 transition-all shadow-md active:translate-y-0.5 cursor-pointer"
              style={{
                boxShadow: "0 3px 0 #081d33, 0 6px 14px rgba(16, 55, 92, 0.22)",
              }}
            >
              <span>Tes Level Gratis</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
            </Link>

            <Link
              href="/modules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-primary bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-xs active:translate-y-0.5 cursor-pointer"
              style={{ boxShadow: "0 2px 0 #e2e8f0" }}
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Lihat Silabus</span>
            </Link>
          </div>
        </div>

        {/* Core Visual: The 3-Phase Interactive Roadmap */}
        <div>
          <HowItWorksRoadmap />
        </div>
      </div>
    </section>
  );
}
