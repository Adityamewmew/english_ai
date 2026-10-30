"use client";

import React from "react";
import { CHAOS_PROBLEMS } from "../data/feature-data";

export function FeatureProblemChaos() {
  return (
    <section className="relative pt-16 pb-8 md:pt-20 md:pb-10 overflow-hidden">
      {/* Topographic Wave Lines (Same aesthetic as Hero Section) */}
      <svg
        className="wave-lines absolute inset-x-0 top-6 w-full h-[380px] pointer-events-none opacity-35 -z-0"
        viewBox="0 0 1440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-80 180 C 240 70, 520 300, 840 150 C 1120 50, 1340 230, 1540 150"
          stroke="#10375C"
          strokeOpacity="0.14"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-80 230 C 280 110, 560 330, 880 190 C 1160 80, 1360 260, 1540 190"
          stroke="#10375C"
          strokeOpacity="0.05"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header (Left-aligned & Asymmetric Split, NO center-align monotony) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block">
              Keresahan Pembelajar Bahasa Inggris
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight leading-tight">
              Cara Lama Belajar Speaking Sering Kali Bikin Cemas &amp; Kaku
            </h2>
          </div>
          <p className="font-body text-slate-600 text-base sm:text-lg leading-relaxed max-w-md lg:pb-1">
            Buku teori tebal dan les mahal jutaan per bulan, tapi saat harus berbicara langsung di dunia nyata, kenapa lidah masih sering terkunci?
          </p>
        </div>

        {/* 4 Tactile Physical Paper Cards on Desk Metaphor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
          {CHAOS_PROBLEMS.map((problem) => {
            if (problem.type === "sticky") {
              return (
                <div
                  key={problem.id}
                  className="relative p-6 sm:p-7 rounded-2xl bg-[#FFF9D2] border border-[#F6E05E] transition-all duration-300 hover:scale-105 hover:rotate-0 cursor-default flex flex-col justify-between -rotate-2"
                  style={{
                    boxShadow:
                      "0 14px 28px -6px rgba(217, 119, 6, 0.18), 0 6px 12px -4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 0 rgba(217, 119, 6, 0.15)",
                  }}
                >
                  {/* Frosted Translucent Scotch Tape */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-7 bg-white/70 backdrop-blur-xs border-y border-white/90 shadow-xs rotate-1 pointer-events-none"
                    style={{
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      clipPath: "polygon(2% 0%, 98% 2%, 97% 100%, 0% 98%)",
                    }}
                  />

                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-heading font-black tracking-wider uppercase text-amber-900/70">
                      {problem.tag}
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      {problem.title}
                    </h3>
                  </div>

                  <p className="font-body text-xs sm:text-sm text-slate-700 leading-relaxed mt-5 pt-3.5 border-t border-amber-300/60 font-medium">
                    {problem.note}
                  </p>
                </div>
              );
            }

            if (problem.type === "receipt") {
              return (
                <div
                  key={problem.id}
                  className="relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 transition-all duration-300 hover:scale-105 hover:rotate-0 cursor-default flex flex-col justify-between rotate-2"
                  style={{
                    boxShadow:
                      "0 14px 30px -6px rgba(16, 55, 92, 0.14), 0 6px 12px -4px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff, inset 0 -2px 0 #e2e8f0",
                  }}
                >
                  {/* Skeuomorphic Metal Paperclip */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-4 left-6 w-6 h-12 border-[2.5px] border-slate-400 rounded-full rotate-6 pointer-events-none"
                    style={{
                      borderBottom: "none",
                      boxShadow:
                        "1px 2px 4px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)",
                      background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                    }}
                  >
                    <div className="w-3 h-7 border-[2.5px] border-slate-400 rounded-full mx-auto mt-1 border-t-0" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-heading font-black tracking-wider uppercase text-slate-500">
                      {problem.tag}
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      {problem.title}
                    </h3>
                  </div>

                  <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed mt-5 pt-3.5 border-t border-dashed border-slate-200">
                    {problem.note}
                  </p>
                </div>
              );
            }

            if (problem.type === "bubble") {
              return (
                <div
                  key={problem.id}
                  className="relative p-6 sm:p-7 rounded-2xl bg-[#FFF5F5] border border-rose-200 transition-all duration-300 hover:scale-105 hover:rotate-0 cursor-default flex flex-col justify-between -rotate-1"
                  style={{
                    boxShadow:
                      "0 14px 28px -6px rgba(225, 29, 72, 0.12), 0 6px 12px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 #ffffff, inset 0 -2px 0 #fecdd3",
                  }}
                >
                  {/* Subtle Red Push-Pin with Realistic Shadow */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-3 -right-2 w-6 h-6 rounded-full bg-rose-500 border-2 border-white pointer-events-none"
                    style={{
                      boxShadow:
                        "0 3px 6px rgba(225, 29, 72, 0.4), inset 0 1px 2px rgba(255,255,255,0.6)",
                    }}
                  >
                    <span className="block w-1.5 h-1.5 rounded-full bg-white/70 m-1" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-heading font-black tracking-wider uppercase text-rose-700/80">
                      {problem.tag}
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      {problem.title}
                    </h3>
                  </div>

                  <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed mt-5 pt-3.5 border-t border-rose-200/80">
                    {problem.note}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={problem.id}
                className="relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 transition-all duration-300 hover:scale-105 hover:rotate-0 cursor-default flex flex-col justify-between rotate-2"
                style={{
                  boxShadow:
                    "0 14px 30px -6px rgba(16, 55, 92, 0.14), 0 6px 12px -4px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff, inset 0 -2px 0 #e2e8f0",
                }}
              >
                {/* Brass Thumbtack with Depth */}
                <div
                  aria-hidden="true"
                  className="absolute -top-2.5 left-8 w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-xs pointer-events-none"
                  style={{
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.6)",
                  }}
                />

                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-heading font-black tracking-wider uppercase text-secondary">
                    {problem.tag}
                  </span>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug">
                    {problem.title}
                  </h3>
                </div>

                <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed mt-5 pt-3.5 border-t border-slate-100">
                  {problem.note}
                </p>
              </div>
            );
          })}
        </div>

        {/* Compact, Sleek Transition Divider (No dead space) */}
        <div className="mt-12 pt-6 border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-primary tracking-wide">
            <span>Kini, Bandingkan dengan Pendekatan Terintegrasi EDDY&apos;S AI</span>
            <span className="text-secondary font-black">&rarr;</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Metode Belajar
          </span>
        </div>
      </div>
    </section>
  );
}
