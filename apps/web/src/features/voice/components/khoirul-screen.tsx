"use client";

import React from "react";
import { Mic, Volume2, Sparkles, PhoneCall } from "lucide-react";

export interface KhoirulScreenProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  aiSpeechState: "idle" | "speaking" | "listening" | "thinking";
  isMuted: boolean;
  onScreenClick: () => void;
}

export function KhoirulScreen({
  callStatus,
  aiSpeechState,
  isMuted,
  onScreenClick,
}: KhoirulScreenProps) {
  // Determine character pose based on state
  const getImageSource = () => {
    if (callStatus === "idle") {
      return "/illustrations/tutor/khoirul-waving.png";
    }
    if (callStatus === "connecting") {
      return "/illustrations/tutor/khoirul-waving.png";
    }
    if (aiSpeechState === "speaking") {
      return "/illustrations/tutor/khoirul-talking.png";
    }
    if (aiSpeechState === "thinking") {
      return "/illustrations/tutor/khoirul-idle.png";
    }
    // listening or idle active
    return "/illustrations/tutor/khoirul-idle.png";
  };

  const currentImage = getImageSource();

  // Status message text
  const getStatusLabel = () => {
    if (callStatus === "idle") return "Siap Mulai";
    if (callStatus === "connecting") return "Menghubungkan...";
    if (aiSpeechState === "speaking") return "Mr. Khoirul Berbicara";
    if (aiSpeechState === "thinking") return "Mr. Khoirul Berpikir...";
    if (aiSpeechState === "listening") return isMuted ? "Mikrofon Dibisukan" : "Mendengarkan Anda...";
    return "Terhubung";
  };

  // Status LED color
  const getLedClass = () => {
    if (callStatus === "idle") return "bg-slate-500/70";
    if (callStatus === "connecting" || aiSpeechState === "thinking") {
      return "bg-amber-400 animate-ping";
    }
    if (aiSpeechState === "speaking" || aiSpeechState === "listening") {
      return "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]";
    }
    return "bg-emerald-500";
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[400px] flex flex-col items-center">
      {/* Skeuomorphic Video Device Bezel */}
      <div
        onClick={onScreenClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onScreenClick();
          }
        }}
        className="group relative w-full rounded-[32px] p-3.5 sm:p-4 cursor-pointer select-none transition-all duration-300 transform active:scale-[0.99] focus:outline-none"
        style={{
          background: "linear-gradient(145deg, #163E63 0%, #0D3B66 40%, #082542 100%)",
          boxShadow:
            "0 20px 40px -10px rgba(8, 37, 66, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.4)",
          border: "2px solid #1B4965",
        }}
      >
        {/* Hardware Corner Screws (Skeuomorphic Detail) */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-slate-600/50 border border-slate-400/30 shadow-inner" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-slate-600/50 border border-slate-400/30 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-slate-600/50 border border-slate-400/30 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-slate-600/50 border border-slate-400/30 shadow-inner" />

        {/* Top Bezel Bar: Webcam Lens, LED, & Speaker Grille */}
        <div className="w-full flex items-center justify-between px-3 py-1 mb-2">
          {/* Speaker grill micro-dots */}
          <div className="flex items-center gap-1 opacity-40">
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="w-1 h-1 rounded-full bg-slate-400" />
          </div>

          {/* Central Camera & Live LED Indicator */}
          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/40 border border-white/10 shadow-inner">
            {/* Camera lens */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80" />
            </div>
            {/* Live Status LED */}
            <span className={`w-2 h-2 rounded-full ${getLedClass()} transition-all duration-300`} />
            <span className="text-[10px] font-mono tracking-wider font-bold text-slate-300 uppercase">
              {getStatusLabel()}
            </span>
          </div>

          {/* Brand Logo / Model badge */}
          <div className="flex items-center gap-1 opacity-70">
            <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase">
              EDDY&apos;S
            </span>
          </div>
        </div>

        {/* Inner Glass Screen Container */}
        <div
          className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden flex flex-col items-center justify-between p-3"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, #1a4f78 0%, #0D3B66 50%, #061e36 100%)",
            boxShadow:
              "inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 0 1px 1px rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* Glass Glare Highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-25"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 100%)",
              clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 40%)",
            }}
          />

          {/* Top Overlay Badge inside screen: Teacher identity */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#F4B41A]" />
              <div className="text-left">
                <p className="text-xs font-black text-white leading-none">Mr. Khoirul</p>
                <p className="text-[9px] text-slate-300 font-medium">Native English Coach</p>
              </div>
            </div>

            {/* Audio Wave state icon */}
            <div className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              {aiSpeechState === "speaking" ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#F4B41A] animate-bounce" />
                  <span className="text-[10px] font-bold text-amber-300">Speaking</span>
                </>
              ) : aiSpeechState === "listening" ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-300">Listening</span>
                </>
              ) : aiSpeechState === "thinking" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-[10px] font-bold text-amber-300">Thinking</span>
                </>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">Standby</span>
              )}
            </div>
          </div>

          {/* Main Character Display */}
          <div className="relative flex-1 w-full flex items-end justify-center overflow-hidden z-0">
            {/* Ambient Character Glow */}
            <div
              className={`absolute bottom-4 w-44 h-44 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
                aiSpeechState === "speaking"
                  ? "bg-[#F4B41A]/30 scale-110"
                  : aiSpeechState === "listening"
                  ? "bg-emerald-500/25 scale-100"
                  : "bg-blue-400/15 scale-95"
              }`}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="Mr. Khoirul AI English Coach"
              className={`relative z-10 max-h-[220px] sm:max-h-[250px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                aiSpeechState === "speaking"
                  ? "animate-[orb-breathe_3s_ease-in-out_infinite] scale-[1.03]"
                  : "scale-100"
              }`}
            />

            {/* Idle Call-to-Action Prompt Overlay */}
            {callStatus === "idle" && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 z-20 rounded-[20px]">
                <div className="px-5 py-3 rounded-2xl btn-skeuo-yellow text-slate-950 text-xs font-black shadow-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>Ketuk untuk Memulai Sesi</span>
                </div>
                <p className="text-[11px] text-white/90 font-medium mt-2 drop-shadow">
                  Praktik percakapan bebas tanpa batasan giliran
                </p>
              </div>
            )}
          </div>

          {/* Bottom In-Screen Tactile Intercom / Audio Equalizer Level Meter */}
          <div className="w-full flex items-center justify-between px-2 pt-2 z-10 border-t border-white/10">
            {/* Skeuomorphic VU Equalizer Bars */}
            <div className="flex items-end gap-1 h-4">
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  aiSpeechState === "speaking"
                    ? "h-3.5 bg-[#F4B41A] animate-pulse"
                    : aiSpeechState === "listening"
                    ? "h-2.5 bg-emerald-400 animate-pulse"
                    : "h-1 bg-slate-500"
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-200 ${
                  aiSpeechState === "speaking"
                    ? "h-4 bg-[#F4B41A] animate-bounce"
                    : aiSpeechState === "listening"
                    ? "h-3.5 bg-emerald-400"
                    : "h-1.5 bg-slate-500"
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-100 ${
                  aiSpeechState === "speaking"
                    ? "h-2.5 bg-amber-300"
                    : aiSpeechState === "listening"
                    ? "h-2 bg-emerald-400"
                    : "h-1 bg-slate-500"
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-300 ${
                  aiSpeechState === "speaking"
                    ? "h-3.5 bg-[#F4B41A]"
                    : aiSpeechState === "listening"
                    ? "h-4 bg-emerald-400 animate-bounce"
                    : "h-1 bg-slate-500"
                }`}
              />
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  aiSpeechState === "speaking"
                    ? "h-2 bg-amber-300"
                    : aiSpeechState === "listening"
                    ? "h-1.5 bg-emerald-400"
                    : "h-1 bg-slate-500"
                }`}
              />
            </div>

            {/* Click affordance indicator */}
            <span className="text-[10px] text-slate-300/80 font-medium tracking-tight">
              {callStatus === "active" && aiSpeechState === "speaking"
                ? "Ketuk layar untuk memotong bicara"
                : callStatus === "active" && aiSpeechState === "listening"
                ? "Bicaralah, Mr. Khoirul mendengarkan"
                : "EDDY'S Voice Engine"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
