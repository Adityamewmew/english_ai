"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./fade-in";

export function AboutCta() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-[#F4F6FF]/40 to-white border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <FadeIn delay={0} duration={600}>
          <div
            className="rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-b from-[#184A78] via-[#10375C] to-[#0A243D] text-white relative overflow-hidden border border-[#1e588f] border-b-6 border-b-[#061726] shadow-[0_20px_40px_-12px_rgba(16,55,92,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.25)] hover:shadow-2xl transition-all duration-300"
          >
            {/* Subtle Topographic Ambient Accent */}
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
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-amber-300 font-heading text-xs font-bold uppercase tracking-wider border border-white/15">
                Langkah Selanjutnya
              </span>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
                Pengalaman 40+ Tahun Kini Hadir di Genggaman Anda
              </h2>

              <p className="font-body text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">
                Mulai latihan percakapan bahasa Inggris bersama AI tutor yang mengadopsi
                pedagogi teruji. Bicara lebih percaya diri, kapan saja dan di mana saja.
              </p>

              {/* Buttons Group */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/#biaya"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-extrabold text-xs sm:text-sm text-[#10375C] bg-gradient-to-b from-white to-slate-100 hover:to-slate-200 border border-slate-200 border-b-3 border-b-slate-400 active:translate-y-0.5 transition-all cursor-pointer shadow-md"
                >
                  <span>Lihat Pilihan Paket Belajar</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/#keunggulan"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>Jelajahi Fitur Platform</span>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
