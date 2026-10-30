"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Volume2, Award, Check, TrendingUp, CheckCircle2 } from "lucide-react";
import { createTimeline, stagger } from "animejs";
import { BENTO_CAMBRIDGE_LEVELS } from "../data/feature-data";

export function FeatureSolutionBento() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          const tl = createTimeline({
            autoplay: true,
            defaults: { ease: "outCubic" },
          });

          // 1. Header reveal
          const headerEl = sectionEl.querySelector(".bento-header-anim");
          if (headerEl) {
            tl.add(headerEl, {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 500,
            }, 0);
          }

          // 2. Row 1 Cards subtle entrance
          const cardItems = sectionEl.querySelectorAll(".bento-card-item");
          if (cardItems.length > 0) {
            tl.add(Array.from(cardItems), {
              opacity: [0, 1],
              translateY: [24, 0],
              delay: stagger(100),
              duration: 550,
            }, 80);
          }

          // 3. Fluency bars filling up (0% -> target)
          const fluencyBars = sectionEl.querySelectorAll<HTMLElement>(".bento-fluency-bar");
          if (fluencyBars.length > 0) {
            fluencyBars.forEach((bar, idx) => {
              const target = bar.dataset.target || "80%";
              tl.add(bar, {
                width: ["0%", target],
                duration: 900,
                ease: "outQuart",
              }, 250 + idx * 80);
            });
          }

          // 4. Correction memo subtle pop
          const memoEl = sectionEl.querySelector(".bento-memo-anim");
          if (memoEl) {
            tl.add(memoEl, {
              opacity: [0, 1],
              scale: [0.96, 1],
              duration: 450,
              ease: "outCubic",
            }, 400);
          }

          // 5. Row 2 Wide Card entrance
          const wideCard = sectionEl.querySelector(".bento-card-wide");
          if (wideCard) {
            tl.add(wideCard, {
              opacity: [0, 1],
              translateY: [24, 0],
              duration: 600,
            }, 300);
          }

          // 6. Vertical monthly chart columns rising from bottom up
          const chartBars = sectionEl.querySelectorAll<HTMLElement>(".bento-chart-bar");
          if (chartBars.length > 0) {
            tl.add(Array.from(chartBars), {
              scaleY: [0, 1],
              delay: stagger(65),
              duration: 650,
              ease: "outCubic",
            }, 450);
          }

          // 7. Streak daily habit bar fill
          const streakBar = sectionEl.querySelector(".bento-streak-bar");
          if (streakBar) {
            tl.add(streakBar, {
              width: ["0%", "85%"],
              duration: 800,
              ease: "outQuart",
            }, 600);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-10 md:py-14 relative overflow-hidden scroll-mt-24"
    >
      {/* Topographic Wave Lines (Consistent with Hero Section) */}
      <svg
        className="wave-lines absolute inset-x-0 bottom-8 w-full h-[360px] pointer-events-none opacity-15 -z-0"
        viewBox="0 0 1440 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 240 C 220 120, 500 360, 840 200 C 1140 80, 1340 290, 1540 200"
          stroke="#10375C"
          strokeOpacity="0.08"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-100 300 C 260 160, 540 400, 880 240 C 1180 120, 1360 330, 1540 250"
          stroke="#10375C"
          strokeOpacity="0.05"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header: Centered & Calm (Matching Trust Section Style) */}
        <div className="bento-header-anim text-center max-w-xl mx-auto mb-8 sm:mb-9 space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10 mb-1">
            Metode Belajar EDDY&apos;S AI
          </span>
          <h2 className="font-heading font-semibold text-primary text-xl sm:text-2xl md:text-[26px] tracking-tight leading-snug">
            Tinggalkan cara lama yang kaku, mulai bicara <span className="font-bold">fasih &amp; percaya diri</span>
          </h2>
          <p className="font-body text-slate-500 text-xs sm:text-[13px] leading-relaxed max-w-md mx-auto">
            Pendekatan terpadu bimbingan AI personal, kurikulum Cambridge, dan pembentukan kebiasaan harian.
          </p>
        </div>

        {/* Feature Grid: UI Floating Visual on Top + Clean Caption Below */}
        <div className="space-y-8 sm:space-y-9">
          {/* ================= ROW 1: 2 COLUMNS (VOICE AI & INSTANT FEEDBACK) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
            {/* FEATURE 1: VOICE INTERCOM WITH GRADIENT BARS */}
            <div className="bento-card-item space-y-3">
              {/* Floating UI Mockup */}
              <div
                className="rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200/90 relative transition-transform hover:-translate-y-0.5 duration-200"
                style={{
                  boxShadow:
                    "0 12px 28px -8px rgba(16, 55, 92, 0.08), 0 2px 6px rgba(16, 55, 92, 0.03), inset 0 1px 1px #ffffff",
                }}
              >
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-heading font-bold text-xs text-primary">
                      Analisis Kelancaran Bicara
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold text-white transition-all active:translate-y-0.5 shadow-sm"
                    style={{
                      background: "linear-gradient(180deg, #1b5285 0%, #10375C 100%)",
                      boxShadow: "0 1.5px 0 #081d33, 0 3px 8px rgba(16, 55, 92, 0.2)",
                    }}
                  >
                    <Volume2 className="w-3 h-3 text-accent" />
                    <span>{isPlayingAudio ? "Memutar..." : "Dengar Suara"}</span>
                  </button>
                </div>

                {/* Gradient Progress Bars */}
                <div className="mt-3 space-y-2.5">
                  {/* Bar 1: Fluency Rate (Navy-to-Sky Gradient) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Kelancaran Bicara</span>
                      <span className="font-bold text-primary">88%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="bento-fluency-bar h-full rounded-full bg-gradient-to-r from-[#10375C] via-[#1E5F9E] to-[#38BDF8]"
                        data-target="88%"
                        style={{ width: "88%" }}
                      />
                    </div>
                  </div>

                  {/* Bar 2: Pelafalan (Emerald-to-Teal Gradient) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Akurasi Pelafalan</span>
                      <span className="font-bold text-emerald-600">94%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="bento-fluency-bar h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        data-target="94%"
                        style={{ width: "94%" }}
                      />
                    </div>
                  </div>

                  {/* Bar 3: Kosakata Aktif (Clean Primary Tonal Bar) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Refleks Kosakata</span>
                      <span className="font-bold text-primary">82%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="bento-fluency-bar h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                        data-target="82%"
                        style={{ width: "82%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Dialogue Snippet */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2.5">
                  <div className="relative w-7 h-7 rounded-lg bg-surface border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <Image
                      src="/illustrations/tutor/khoirul-waving.webp"
                      alt="Mr. Khoirul AI"
                      width={26}
                      height={26}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">
                    <strong className="text-primary font-bold">Mr. Khoirul:</strong> &ldquo;Minor touch: say &lsquo;spend&rsquo; for habits!&rdquo;
                  </div>
                </div>
              </div>

              {/* Caption Below Visual */}
              <div className="text-center space-y-1 px-1">
                <h3 className="font-heading font-bold text-sm sm:text-[15px] text-primary">
                  Latihan Bicara Suara Bebas Dihakimi
                </h3>
                <p className="font-body text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Bicara langsung seperti panggilan telepon nyata. AI merespons instan untuk mengasah spontanitas tanpa takut salah.
                </p>
              </div>
            </div>

            {/* FEATURE 2: INSTANT GRAMMAR FEEDBACK WITH GLOW BUTTON */}
            <div className="bento-card-item space-y-3">
              {/* Floating UI Mockup */}
              <div
                className="rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200/90 relative transition-transform hover:-translate-y-0.5 duration-200"
                style={{
                  boxShadow:
                    "0 12px 28px -8px rgba(16, 55, 92, 0.08), 0 2px 6px rgba(16, 55, 92, 0.03), inset 0 1px 1px #ffffff",
                }}
              >
                {/* Mockup Header with Floating Emerald Pill Button */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="text-xs font-heading font-bold text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Catatan Evaluasi</span>
                  </div>

                  {/* Compact Pill Badge */}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold text-white shadow-sm"
                    style={{
                      background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-100" />
                    <span>Koreksi Real-Time</span>
                  </span>
                </div>

                {/* Table-style Log Rows */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-700 text-[11px]">Tenses Kebiasaan</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                      Tepat
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-700 text-[11px]">Intonasi Kalimat Tanya</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                      Natural
                    </span>
                  </div>
                </div>

                {/* Correction Memo */}
                <div
                  className="bento-memo-anim mt-2.5 p-2.5 sm:p-3 rounded-xl bg-[#FFFDF0] border border-amber-200/90 relative text-xs"
                  style={{
                    boxShadow: "0 1px 4px rgba(217, 119, 6, 0.05)",
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="text-rose-700 line-through text-[11px]">
                      <span className="font-bold">Sebelum: </span>
                      <span>&ldquo;I am agree with your opinion.&rdquo;</span>
                    </div>
                    <div className="text-emerald-700 font-semibold text-[11px]">
                      <span className="font-bold">Sesudah: </span>
                      <span>&ldquo;I agree with your opinion.&rdquo;</span>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-amber-200/70 text-[10.5px] text-amber-950 leading-relaxed font-medium">
                    <strong>Catatan Mr. Khoirul:</strong> Kata &lsquo;agree&rsquo; adalah kata kerja murni, tidak perlu to be (&lsquo;am&rsquo;).
                  </div>
                </div>
              </div>

              {/* Caption Below Visual */}
              <div className="text-center space-y-1 px-1">
                <h3 className="font-heading font-bold text-sm sm:text-[15px] text-primary">
                  Koreksi Tata Bahasa &amp; Aksen Seketika
                </h3>
                <p className="font-body text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Bukan cuma diberi tahu salah, tapi dipandu cara penyampaian alami seperti penutur asli tanpa rasa cemas.
                </p>
              </div>
            </div>
          </div>

          {/* ================= ROW 2: 1 WIDE SHOWCASE (VERTICAL GRADIENT BAR CHART) ================= */}
          <div className="bento-card-wide space-y-3">
            {/* Floating Wide UI Mockup with Centered Floating Pill on Top Border */}
            <div
              className="rounded-2xl p-4 sm:p-5 pt-6 sm:pt-6 bg-white border border-slate-200/90 relative transition-transform hover:-translate-y-0.5 duration-200"
              style={{
                boxShadow:
                  "0 14px 32px -10px rgba(16, 55, 92, 0.08), 0 2px 8px rgba(16, 55, 92, 0.03), inset 0 1px 1px #ffffff",
              }}
            >
              {/* Floating Centered Pill Button Right Over the Top Edge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-bold text-white shadow-md cursor-default whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #10375C 0%, #1E5F9E 50%, #38BDF8 100%)",
                    boxShadow: "0 3px 12px rgba(16, 55, 92, 0.25)",
                  }}
                >
                  <Award className="w-3.5 h-3.5 text-accent" />
                  <span>Kurikulum Cambridge Terakreditasi &bull; A1 s.d. C2</span>
                </span>
              </div>

              {/* 2 Sub-panels inside the Wide Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                {/* Left 7 cols: Vertical Gradient Bar Chart */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-primary flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span>Pertumbuhan Durasi Bicara Aktif</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      +42% Refleks Naik
                    </span>
                  </div>

                  {/* Vertical Bar Chart with Blue Gradients */}
                  <div className="h-28 pt-2 flex items-end justify-between gap-2 sm:gap-3 px-1 border-b border-slate-100">
                    {[
                      { month: "Bln 1", h: "35%", active: false },
                      { month: "Bln 2", h: "48%", active: false },
                      { month: "Bln 3", h: "62%", active: false },
                      { month: "Bln 4", h: "55%", active: false },
                      { month: "Bln 5", h: "82%", active: true },
                      { month: "Bln 6", h: "96%", active: true },
                    ].map((bar) => (
                      <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          className={`bento-chart-bar origin-bottom w-full max-w-[28px] sm:max-w-[32px] rounded-t-md transition-colors duration-300 ${
                            bar.active
                              ? "bg-gradient-to-t from-[#10375C]/20 via-[#1E5F9E] to-[#38BDF8]"
                              : "bg-gradient-to-t from-slate-100 via-slate-200 to-[#10375C]/40"
                          }`}
                          style={{ height: bar.h }}
                        />
                        <span className="text-[10px] font-medium text-slate-400">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 5 cols: 15-Minute Daily Habit with Clean Navy Gradient Bars */}
                <div className="md:col-span-5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-primary">
                      Ritme Harian 15 Menit
                    </span>
                    <span className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                      14 Hari Streak
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading font-black text-xl text-primary">
                      15 Menit
                    </span>
                    <span className="text-[11px] text-slate-500">/ hari konsisten</span>
                  </div>

                  {/* Mini Navy Gradient Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className="bento-streak-bar h-full rounded-full bg-gradient-to-r from-primary to-primary/75"
                      style={{ width: "85%" }}
                    />
                  </div>

                  <div className="text-[10.5px] text-slate-500 leading-snug">
                    Didukung kurikulum bertahap A1 s.d. C2 tanpa beban kelas fisik.
                  </div>
                </div>
              </div>
            </div>

            {/* Caption Below Visual */}
            <div className="text-center space-y-1 px-2">
              <h3 className="font-heading font-bold text-sm sm:text-[15px] text-primary">
                Kurikulum Terarah Cambridge &amp; Refleks Harian
              </h3>
              <p className="font-body text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Silabus bertahap dari yayasan berpengalaman 40+ tahun. Cukup 15 menit sehari untuk hasil nyata tanpa beban kelas fisik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
