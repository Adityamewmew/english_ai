"use client";

import React from "react";
import Image from "next/image";
import { Play, ShieldCheck, QrCode } from "lucide-react";

interface HowItWorksMockupProps {
  activeStep: number;
}

export function HowItWorksMockup({ activeStep }: HowItWorksMockupProps) {
  return (
    <div
      className="w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/90 min-h-[460px] flex flex-col justify-between"
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #edf1fa 100%)",
        boxShadow:
          "-10px 20px 50px -10px rgba(16, 55, 92, 0.18), 0 8px 20px rgba(16, 55, 92, 0.08), inset 0 2px 2px #ffffff, inset -2px -3px 5px rgba(16, 55, 92, 0.06)",
      }}
    >
      {/* Top Window Bevel & Controls (Consistent with Hero Dashboard Frame) */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EB8317]/80 inline-block shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F3C623] inline-block shadow-2xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10375C]/40 inline-block shadow-2xs" />
          <span className="ml-2 text-[11px] font-heading font-black tracking-wider uppercase text-primary/60">
            {activeStep === 0 && "CEFR Placement Test Simulator"}
            {activeStep === 1 && "Live Intercom • Mr. Khoirul AI"}
            {activeStep === 2 && "Official Cambridge Certificate"}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-400">
          Step 0{activeStep + 1}
        </span>
      </div>

      {/* Dynamic Content Based on Active Step */}
      <div className="my-auto">
        {/* ================= STEP 0: PLACEMENT TEST SIMULATOR ================= */}
        {activeStep === 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Audio Prompt Player */}
            <div
              className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-4"
              style={{
                boxShadow:
                  "0 4px 12px rgba(16, 55, 92, 0.06), 0 2px 0 #e2e8f0, inset 0 1px 0 #ffffff",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center shrink-0 shadow-2xs">
                  <Play className="w-4 h-4 fill-accent ml-0.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary">
                    Audio Soal Percakapan
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Skenario: Diskusi Rapat Kerja
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-secondary">
                00:14 / 00:32
              </span>
            </div>

            {/* Question Text */}
            <div className="text-xs sm:text-sm font-body text-slate-700 bg-surface p-3.5 rounded-xl border border-slate-200/80">
              Pertanyaan: <em>&ldquo;Manakah respon klarifikasi yang paling tepat untuk situasi formal tersebut?&rdquo;</em>
            </div>

            {/* 3 Radio Options */}
            <div className="space-y-2">
              <div
                className="p-3.5 rounded-xl border-2 border-primary bg-white flex items-center justify-between"
                style={{
                  boxShadow: "0 2px 0 #081d33, inset 0 1px 1px rgba(255,255,255,0.8)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-primary">
                    &ldquo;Could you elaborate further on that projection?&rdquo;
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Tepat
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white/70 flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
                <span>&ldquo;What are you even talking about?&rdquo;</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 1: SPEAKING LIVE SESSION ================= */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* Live Call Bar */}
            <div
              className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between"
              style={{
                boxShadow:
                  "0 4px 12px rgba(16, 55, 92, 0.06), 0 2px 0 #e2e8f0, inset 0 1px 0 #ffffff",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl bg-surface border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <Image
                    src="/illustrations/tutor/khoirul-waving.webp"
                    alt="Mr. Khoirul AI"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary flex items-center gap-2">
                    <span>Mr. Khoirul AI</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Live Call Active &bull; 04:18
                  </div>
                </div>
              </div>

              {/* Waveform Bars */}
              <div className="flex items-center gap-1 h-6 px-3 bg-slate-900 rounded-lg">
                <span className="w-1 h-3 bg-accent rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-secondary rounded-full animate-bounce" />
                <span className="w-1 h-4 bg-accent rounded-full animate-pulse" />
                <span className="w-1 h-2 bg-slate-600 rounded-full" />
                <span className="w-1 h-5 bg-secondary rounded-full animate-bounce" />
              </div>
            </div>

            {/* Dialogue Transcript */}
            <div className="space-y-2.5 text-xs sm:text-sm font-body">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="font-bold text-primary text-[11px] uppercase tracking-wider mb-1">
                  Anda Berbicara:
                </div>
                <p className="text-slate-800">
                  &ldquo;I think expanding to regional market require careful planning.&rdquo;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-slate-200 shadow-2xs">
                <div className="font-bold text-secondary text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Mr. Khoirul AI:</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Koreksi Ramah</span>
                </div>
                <p className="text-slate-800">
                  &ldquo;Spot on! Minor touch: say <strong>&lsquo;requires&rsquo;</strong> with an &lsquo;s&rsquo;. How would you prioritize the team resources?&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: OFFICIAL CERTIFICATE ================= */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            {/* Certificate Parchment Frame */}
            <div
              className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF8] border-2 border-amber-300 relative text-center space-y-3"
              style={{
                boxShadow:
                  "0 8px 24px rgba(217, 119, 6, 0.12), 0 2px 0 #fde68a, inset 0 1px 1px #ffffff",
              }}
            >
              <div className="text-[10px] font-heading font-black tracking-widest uppercase text-amber-800/80">
                Yayasan Eddys Edukasi Mandiri &bull; BAN PAUD &amp; PNF
              </div>

              <h4 className="font-heading font-extrabold text-lg text-primary leading-tight">
                Certificate of Spoken English Proficiency
              </h4>

              <div className="py-2 border-y border-amber-200/80 my-2">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Tingkat Kemahiran Teruji
                </div>
                <div className="font-heading font-black text-2xl text-secondary mt-0.5">
                  CEFR B2 &bull; Upper Intermediate
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Standar Cambridge English Framework
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-left text-xs">
                <div>
                  <div className="font-bold text-slate-700">QR Code Verifikasi:</div>
                  <div className="text-[11px] font-mono text-slate-500">ID: EDD-2026-B2-089</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white border border-amber-300 flex items-center justify-center text-primary shadow-2xs">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Info Row */}
      <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Terakreditasi Resmi BAN PAUD &amp; PNF</span>
        </div>
        <span className="font-bold text-primary">EDDY&apos;S AI</span>
      </div>
    </div>
  );
}
