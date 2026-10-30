"use client";

import React from "react";
import { ArrowLeft, PhoneCall } from "lucide-react";

interface PhoneMockupFrameProps {
  currentPrompt: string;
  onTriggerVoiceDemo: () => void;
  isFlatMode: boolean;
}

export function PhoneMockupFrame({
  currentPrompt,
  onTriggerVoiceDemo,
  isFlatMode,
}: PhoneMockupFrameProps) {
  return (
    <div
      id="phoneMockup"
      style={{
        transform: isFlatMode
          ? "rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(40px)"
          : undefined,
      }}
      className="phone-3d-frame w-[280px] sm:w-[295px] lg:w-[276px] rounded-[40px] p-2.5"
    >
      {/* Top Dynamic Island / Speaker Pill */}
      <div className="w-20 h-3.5 bg-[#090D16] rounded-full mx-auto mb-1.5 flex items-center justify-end px-2.5 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-[#162447] border border-white/15" />
      </div>

      <div className="bg-white rounded-[31px] overflow-hidden flex flex-col justify-between min-h-[465px] sm:min-h-[480px] relative border border-gray-100 shadow-inner">
        {/* Top bar inside phone */}
        <div className="px-4 pt-4 flex items-center justify-between relative">
          <button
            type="button"
            onClick={onTriggerVoiceDemo}
            className="w-9 h-9 rounded-full bg-white border border-gray-200/90 shadow-2xs flex items-center justify-center text-[#334155] hover:bg-surface transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4 text-[#334155]" />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-2xs text-xs font-heading font-extrabold text-[#1E293B] flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-[#475569] tracking-tight">GB</span>
            <span>EN</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Center: AI Tutor Mascot & Prompt */}
        <div className="flex flex-col items-center justify-center px-3 my-auto py-2">
          {/* Mr. Khoirul Official Tutor Mascot */}
          <div
            onClick={onTriggerVoiceDemo}
            className="cursor-pointer group relative flex flex-col items-center"
          >
            <div
              id="avatarGlow"
              className="w-40 h-44 sm:w-44 sm:h-48 flex items-center justify-center animate-float transition-transform group-hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/tutor/khoirul-waving.webp"
                alt="AI Tutor Mr. Khoirul"
                width={176}
                height={192}
                decoding="async"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_22px_rgba(13,59,102,0.22)] select-none pointer-events-none"
                draggable={false}
              />
            </div>

            <div className="mt-2 text-center px-3.5 py-1.5 rounded-full bg-surface/95 text-[10px] font-medium text-primary/80 border border-[#E5E9F5] whitespace-nowrap transition-all shadow-2xs">
              {currentPrompt}
            </div>
          </div>
        </div>

        {/* Bottom Action Dock */}
        <div className="bg-gradient-to-t from-[#E5E7EB] via-[#F3F4F6] to-white pt-3 pb-3.5 px-4 border-t border-gray-100 flex items-center justify-center">
          <button
            type="button"
            onClick={onTriggerVoiceDemo}
            className="w-full py-2.5 px-4 rounded-2xl btn-skeuo-secondary flex items-center justify-center gap-2 font-heading font-bold text-xs sm:text-sm text-white shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4 text-white shrink-0" />
            <span>Mulai Bicara</span>
          </button>
        </div>
      </div>
    </div>
  );
}

