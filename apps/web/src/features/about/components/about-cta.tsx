"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutCta() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-[#F4F6FF]/40 to-white border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto px-6">
        <div
          className="rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-br from-primary to-[#0d2a46] text-white relative overflow-hidden shadow-xl"
          style={{
            boxShadow: "0 6px 0 #081d33, 0 20px 40px rgba(16, 55, 92, 0.25)",
          }}
        >
          {/* Subtle Topographic Accent */}
          <svg
            className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none opacity-10"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="100" cy="100" r="60" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4" />
            <circle cx="100" cy="100" r="40" stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-white/90 font-heading text-xs font-bold uppercase tracking-wider">
              Langkah Selanjutnya
            </span>

            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Pengalaman 40+ Tahun Kini Hadir di Genggaman Anda
            </h2>

            <p className="font-body text-slate-200 text-sm sm:text-base leading-relaxed">
              Mulai latihan percakapan bahasa Inggris bersama AI tutor yang mengadopsi
              pedagogi teruji. Bicara lebih percaya diri, kapan saja dan di mana saja.
            </p>

            {/* Buttons Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/modules"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm text-primary bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-md active:translate-y-0.5"
                style={{
                  boxShadow: "0 3px 0 #cbd5e1, 0 8px 16px rgba(0,0,0,0.15)",
                }}
              >
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer active:translate-y-0.5"
              >
                <span>Jelajahi Fitur SaaS</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
