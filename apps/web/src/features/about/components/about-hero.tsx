"use client";

import React from "react";
import { ABOUT_METRICS } from "../data/about-data";

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

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Eyebrow & Title */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Yayasan Eddys Edukasi Mandiri &bull; Sejak 1980</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight leading-[1.2]">
            Empat Dekade Membina Kemahiran Bahasa Inggris Berstandar Dunia
          </h1>

          <p className="font-body text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Dari bimbingan belajar rumahan di Jember tahun 1980 yang dirintis oleh mendiang
            Bapak Eddy Wartana, bertransformasi menjadi lembaga resmi berakreditasi BAN PAUD &amp; PNF,
            hingga kini mengadopsi kecerdasan buatan untuk menghadirkan tutor speaking interaktif 24/7.
          </p>
        </div>

        {/* Tactile Skeuomorphic Metrics Cards */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ABOUT_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-primary/30 transition-all relative overflow-hidden"
              style={{
                boxShadow: "0 2px 0 #e2e8f0, 0 4px 12px rgba(16, 55, 92, 0.04)",
              }}
            >
              <div className="text-2xl sm:text-3xl font-heading font-black text-primary tracking-tight">
                {metric.value}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {metric.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                {metric.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

