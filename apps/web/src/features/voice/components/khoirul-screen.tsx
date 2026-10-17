"use client";

import React from "react";
import { Mic, Volume2, Sparkles, Loader2 } from "lucide-react";

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
    if (callStatus === "idle" || callStatus === "connecting") {
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

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-4">
      {/* Floating Info Pill Text (Status indicator when call is active/connecting) */}
      {callStatus === "connecting" && (
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-sm animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D3B66]" />
          <span>Menghubungkan...</span>
        </div>
      )}

      {callStatus === "active" && (
        <div className="mb-4 animate-fadeIn">
          {aiSpeechState === "speaking" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D3B66] text-white border border-[#082542] text-xs font-bold shadow-md shadow-[#0D3B66]/20 transition-all duration-300">
              <Volume2 className="w-3.5 h-3.5 text-[#F4B41A] animate-bounce" />
              <span className="tracking-wide">Berbicara</span>
            </div>
          )}

          {aiSpeechState === "listening" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white border border-emerald-700 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all duration-300">
              <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="tracking-wide">{isMuted ? "Mikrofon Dibisukan" : "Mendengarkan"}</span>
            </div>
          )}

          {aiSpeechState === "thinking" && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4B41A] text-slate-950 border border-[#DDA012] text-xs font-bold shadow-md shadow-amber-400/20 transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin" />
              <span className="tracking-wide">Berpikir</span>
            </div>
          )}
        </div>
      )}

      {/* Pure Character Display (No TV Bezel, No Glass Box) */}
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
        className="relative group cursor-pointer flex flex-col items-center justify-center focus:outline-none transition-transform duration-200 active:scale-95"
        title={
          callStatus === "idle"
            ? "Ketuk untuk memulai panggilan"
            : aiSpeechState === "speaking"
            ? "Ketuk untuk memotong bicara"
            : "Mr. Khoirul"
        }
      >
        {/* Character Illustration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt="Mr. Khoirul AI English Coach"
          className={`relative z-10 w-auto h-64 sm:h-80 md:h-96 object-contain transition-all duration-300 drop-shadow-lg ${
            aiSpeechState === "speaking"
              ? "animate-[orb-breathe_2.5s_ease-in-out_infinite] scale-[1.03]"
              : "scale-100"
          }`}
        />

        {/* Soft Contact Ground Shadow */}
        <div className="w-44 sm:w-56 h-5 rounded-full bg-slate-300/60 blur-md -mt-3 z-0 transition-all duration-300 group-hover:scale-105" />
      </div>
    </div>
  );
}
