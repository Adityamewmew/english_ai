"use client";

import React from "react";
import Link from "next/link";
import { HighlightData } from "../data/landing-data";
import { DashboardMockupFrame } from "./dashboard-mockup-frame";
import { PhoneMockupFrame } from "./phone-mockup-frame";

interface HeroStageProps {
  highlightData: HighlightData;
  onSwitchHighlight: (section: string) => void;
  currentPrompt: string;
  onTriggerVoiceDemo: () => void;
  isFlatMode: boolean;
}

export function HeroStage({
  highlightData,
  onSwitchHighlight,
  currentPrompt,
  onTriggerVoiceDemo,
  isFlatMode,
}: HeroStageProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 relative z-10">
      {/* 1. HERO HEADLINE & SINGLE CTA ROW */}
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="hero-headline-anim font-heading font-extrabold text-primary text-4xl sm:text-5xl lg:text-[56px] xl:text-[58px] tracking-tight leading-[1.14] mb-5 sm:mb-6">
          Kuasai{" "}
          <span className="font-heading font-extrabold text-secondary">
            bahasa Inggris
          </span>{" "}
          dalam satu portal
        </h1>

        {/* CTA Bar: 1 Tombol Utama + Deskripsi Singkat */}
        <div className="hero-cta-anim flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-3 sm:mt-4">
          <Link
            href="/placement"
            className="btn-skeuo-primary py-3.5 px-7 font-heading font-bold text-sm sm:text-base flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0 shadow-md transition-all active:translate-y-0.5"
          >
            <span>Tes Level Gratis</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              →
            </span>
          </Link>
          <p className="text-slate-600 text-xs sm:text-sm text-center sm:text-left max-w-xs sm:max-w-sm leading-relaxed font-normal">
            Evaluasi posisi CEFR kamu dan latih refleks bicara aktif bersama tutor AI 24/7.
          </p>
        </div>
      </div>

      {/* 2. STAGE SHOWCASE: SMARTPHONE + DASHBOARD 3D (Leaner scale for 100% desktop) */}
      <div className="hero-stage-anim stage-perspective relative mt-8 sm:mt-12 lg:mt-14 max-w-5xl mx-auto pb-4 sm:pb-6">
        <div className="relative flex flex-col lg:block items-center justify-center">
          {/* STUDENT PORTAL DASHBOARD */}
          <DashboardMockupFrame
            highlightData={highlightData}
            onSwitchHighlight={onSwitchHighlight}
            onTriggerVoiceDemo={onTriggerVoiceDemo}
            isFlatMode={isFlatMode}
          />

          {/* SMARTPHONE AI VOICE CALL */}
          <div className="hero-phone-float-wrapper mt-8 lg:mt-0 lg:absolute lg:-left-5 lg:-bottom-6 z-20">
            <PhoneMockupFrame
              currentPrompt={currentPrompt}
              onTriggerVoiceDemo={onTriggerVoiceDemo}
              isFlatMode={isFlatMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
