"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PhoneCall, LayoutDashboard } from "lucide-react";
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
  const [mobileTab, setMobileTab] = useState<"voice" | "portal">("voice");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 relative z-10">
      {/* 1. HERO HEADLINE & SINGLE CTA ROW */}
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="hero-headline-anim font-heading font-extrabold text-primary text-3xl sm:text-5xl lg:text-[56px] xl:text-[58px] tracking-tight leading-[1.15] mb-4 sm:mb-6">
          Kuasai{" "}
          <span className="font-heading font-extrabold text-secondary">
            bahasa Inggris
          </span>{" "}
          dalam satu portal
        </h1>

        {/* CTA Bar: 1 Tombol Utama + Deskripsi Singkat */}
        <div className="hero-cta-anim flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 mt-3 sm:mt-4">
          <Link
            href="/placement"
            className="btn-skeuo-primary py-3.5 px-7 font-heading font-bold text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer whitespace-nowrap shrink-0 shadow-md transition-all active:translate-y-0.5 w-full sm:w-auto"
          >
            <span>Tes Level Gratis</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              →
            </span>
          </Link>
          <p className="font-body text-slate-600 text-xs sm:text-sm text-center sm:text-left max-w-xs sm:max-w-sm leading-relaxed">
            Evaluasi posisi CEFR kamu dan latih refleks bicara aktif bersama tutor AI 24/7.
          </p>
        </div>
      </div>

      {/* 2. MOBILE INTERACTIVE TAB SWITCHER (< lg) */}
      <div className="lg:hidden flex items-center justify-center mt-7 sm:mt-9 mb-4">
        <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileTab("voice")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              mobileTab === "voice"
                ? "bg-primary text-white shadow-2xs"
                : "text-slate-600 hover:text-primary"
            }`}
          >
            <PhoneCall className={`w-3.5 h-3.5 ${mobileTab === "voice" ? "text-accent" : "text-slate-500"}`} />
            <span>Simulasi AI Call</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("portal")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              mobileTab === "portal"
                ? "bg-primary text-white shadow-2xs"
                : "text-slate-600 hover:text-primary"
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 ${mobileTab === "portal" ? "text-accent" : "text-slate-500"}`} />
            <span>Portal Siswa</span>
          </button>
        </div>
      </div>

      {/* 3. MOBILE DISPLAY (< lg) */}
      <div className="lg:hidden flex justify-center w-full pb-4">
        {mobileTab === "voice" ? (
          <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            <PhoneMockupFrame
              currentPrompt={currentPrompt}
              onTriggerVoiceDemo={onTriggerVoiceDemo}
              isFlatMode={true}
            />
          </div>
        ) : (
          <div className="w-full max-w-md sm:max-w-lg overflow-x-auto animate-in fade-in zoom-in-95 duration-200">
            <DashboardMockupFrame
              highlightData={highlightData}
              onSwitchHighlight={onSwitchHighlight}
              onTriggerVoiceDemo={onTriggerVoiceDemo}
              isFlatMode={true}
            />
          </div>
        )}
      </div>

      {/* 4. DESKTOP STAGE SHOWCASE (>= lg) */}
      <div className="hidden lg:block hero-stage-anim stage-perspective relative mt-12 lg:mt-14 max-w-5xl mx-auto pb-6">
        <div className="relative">
          {/* STUDENT PORTAL DASHBOARD */}
          <DashboardMockupFrame
            highlightData={highlightData}
            onSwitchHighlight={onSwitchHighlight}
            onTriggerVoiceDemo={onTriggerVoiceDemo}
            isFlatMode={isFlatMode}
          />

          {/* SMARTPHONE AI VOICE CALL */}
          <div className="hero-phone-float-wrapper absolute -left-5 -bottom-6 z-20">
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
