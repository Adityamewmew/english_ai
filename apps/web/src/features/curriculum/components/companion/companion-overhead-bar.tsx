"use client";

import React from "react";
import { Mic, Sparkles, Volume2, Loader2, MessageSquare } from "lucide-react";
import type { CompanionPersona, CompanionState } from "./roaming-types";

interface CompanionOverheadBarProps {
  state: CompanionState;
  persona: CompanionPersona;
  liveTranscript: string;
  tutorReply: string;
  onCharacterClick?: () => void;
}

export function CompanionOverheadBar({
  state,
  persona,
  liveTranscript,
  tutorReply,
  onCharacterClick,
}: CompanionOverheadBarProps) {
  const isKhoirul = persona === "khoirul";
  const tutorName = isKhoirul ? "Mr. Khoirul" : "Ms. Maya";
  const playerTag = isKhoirul ? "P1" : "P2";

  // During free roaming / idle
  if (state === "roaming" || state === "paused") {
    return (
      <div
        onClick={onCharacterClick}
        className="group/overhead cursor-pointer flex flex-col items-center pointer-events-auto transition-transform duration-200 hover:scale-105"
      >
        <div className="relative px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white border-2 border-[#F4B41A] shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center gap-2 max-w-xs animate-bounce [animation-duration:2.5s]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4B41A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F4B41A]" />
          </span>

          <span className="text-[11px] font-bold tracking-tight text-[#F4B41A] font-mono">
            Click me for Voice Call! 🎙️
          </span>

          <span className="text-[9px] font-mono px-1 py-0.2 bg-[#F4B41A]/20 text-[#F4B41A] rounded border border-[#F4B41A]/40">
            {playerTag}
          </span>
        </div>

        {/* Downward Speech Bubble Arrow Pointer */}
        <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-900/90 -mt-0.5" />
      </div>
    );
  }

  // During active voice call states (listening, thinking, speaking)
  return (
    <div className="flex flex-col items-center pointer-events-auto max-w-[340px] sm:max-w-[420px] transition-all duration-300">
      <div
        className={`relative w-full rounded-2xl p-3 border-2 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          state === "listening"
            ? "bg-slate-950/95 border-[#F4B41A]/90 shadow-[#F4B41A]/20 text-white"
            : state === "thinking"
            ? "bg-slate-950/95 border-[#0D3B66]/90 shadow-[#0D3B66]/20 text-white"
            : "bg-slate-950/95 border-[#1B4965]/90 shadow-[#1B4965]/20 text-white"
        }`}
      >
        {/* Status Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase tracking-wider border-b ${
                isKhoirul ? "bg-[#0D3B66] text-white border-[#082542]" : "bg-[#9E1B1B] text-white border-[#841515]"
              }`}
            >
              {playerTag} {tutorName}
            </span>

            {state === "listening" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#F4B41A]/20 text-[#F4B41A] border border-[#F4B41A]/40 animate-pulse">
                <Mic className="w-2.5 h-2.5" /> LISTENING
              </span>
            )}

            {state === "thinking" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#0D3B66]/30 text-sky-200 border border-[#0D3B66]/50">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> THINKING...
              </span>
            )}

            {state === "speaking" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#1B4965]/30 text-[#F4B41A] border border-[#1B4965]/50">
                <Volume2 className="w-2.5 h-2.5" /> SPEAKING
              </span>
            )}
          </div>

          {/* Sound Wave Bars when speaking or listening */}
          {(state === "listening" || state === "speaking") && (
            <div className="flex items-center gap-0.5">
              <span
                className={`w-1 rounded-full animate-bounce ${
                  state === "listening" ? "bg-[#F4B41A] h-2.5" : "bg-sky-300 h-3"
                }`}
              />
              <span
                className={`w-1 rounded-full animate-bounce [animation-delay:0.15s] ${
                  state === "listening" ? "bg-[#F4B41A] h-4" : "bg-sky-300 h-4.5"
                }`}
              />
              <span
                className={`w-1 rounded-full animate-bounce [animation-delay:0.3s] ${
                  state === "listening" ? "bg-[#F4B41A] h-2" : "bg-sky-300 h-2.5"
                }`}
              />
            </div>
          )}
        </div>

        {/* Dynamic Overhead Bar Content Body */}
        <div className="min-h-[38px] flex items-center">
          {state === "listening" && (
            <div className="w-full">
              {liveTranscript ? (
                <p className="text-sm font-medium text-emerald-200 leading-snug break-words">
                  &ldquo;{liveTranscript}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Bicaralah dalam bahasa Inggris... Saya mendengarkan!
                </p>
              )}
            </div>
          )}

          {state === "thinking" && (
            <div className="w-full py-0.5 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.3s]" />
              </div>
              <p className="text-xs text-amber-200 font-mono">
                Menyusun jawaban & umpan balik...
              </p>
            </div>
          )}

          {state === "speaking" && (
            <div className="w-full">
              <p className="text-sm font-medium text-slate-100 leading-snug break-words">
                {tutorReply || "Good to hear from you! Let's continue practicing."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Speech Triangle Anchor */}
      <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-950/95 -mt-0.5 filter drop-shadow-md" />
    </div>
  );
}
