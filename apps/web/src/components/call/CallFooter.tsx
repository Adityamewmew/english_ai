"use client";

import React from "react";
import { PhoneCall, PhoneOff, Mic, MicOff, Radio } from "lucide-react";

interface CallFooterProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  isMuted?: boolean;
  onToggleMute?: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
  talkMode?: "auto" | "ptt";
  onToggleTalkMode?: (mode: "auto" | "ptt") => void;
  isPressingTalk?: boolean;
  onTalkStart?: () => void;
  onTalkEnd?: () => void;
}

export function CallFooter({
  callStatus,
  isMuted = false,
  onToggleMute,
  onStartCall,
  onEndCall,
  talkMode = "ptt",
  onToggleTalkMode,
  isPressingTalk = false,
  onTalkStart,
  onTalkEnd,
}: CallFooterProps) {
  if (callStatus === "evaluating" || callStatus === "ended") {
    return null;
  }

  return (
    <footer className="w-full max-w-md mx-auto px-4 sm:px-6 pb-4 sm:pb-6 pt-1 flex flex-col items-center justify-center gap-2.5 relative z-20 shrink-0">
      {callStatus === "active" && onToggleTalkMode && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/90 rounded-full shadow-xs w-full max-w-xs sm:max-w-sm justify-between">
          <button
            type="button"
            onClick={() => onToggleTalkMode("ptt")}
            className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-heading font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] select-none ${
              talkMode === "ptt"
                ? "bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="whitespace-nowrap">Push to Talk</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleTalkMode("auto")}
            className={`flex-1 py-2 px-3 sm:px-4 rounded-full text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] select-none ${
              talkMode === "auto"
                ? "bg-white text-primary shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="whitespace-nowrap">Hands-Free</span>
          </button>
        </div>
      )}

      {callStatus === "idle" ? (
        <button
          type="button"
          onClick={onStartCall}
          className="group px-8 py-3.5 rounded-full btn-skeuo-yellow flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-amber-500/25 cursor-pointer"
          title="Start Voice Call with Mr. Khoirul"
        >
          <div className="w-9 h-9 rounded-full bg-slate-950/10 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-950 uppercase tracking-wide">
              Start Voice Call
            </p>
            <p className="text-[11px] text-slate-800 font-semibold">AI Tutor Mr. Khoirul</p>
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-center gap-3 w-full max-w-sm">
          {talkMode === "ptt" ? (
            /* Tactile Push-to-Talk Button */
            <button
              type="button"
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                } catch {}
                onTalkStart?.();
              }}
              onPointerUp={(e) => {
                try {
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
                } catch {}
                onTalkEnd?.();
              }}
              onPointerCancel={onTalkEnd}
              className={`flex-1 min-h-[46px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 font-heading font-black text-xs sm:text-[13px] uppercase tracking-wider transition-all select-none cursor-pointer ${
                isPressingTalk
                  ? "bg-amber-400 text-slate-950 scale-102 shadow-lg shadow-amber-400/40 ring-4 ring-amber-400/30 border-2 border-amber-500"
                  : "bg-white hover:bg-slate-50 text-primary border border-slate-300 shadow-md active:scale-95"
              }`}
              title="Tahan untuk Bicara (atau tahan Spacebar di keyboard)"
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                  isPressingTalk
                    ? "bg-slate-950 text-amber-400 animate-pulse"
                    : "bg-slate-100 text-primary"
                }`}
              >
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="whitespace-nowrap">
                {isPressingTalk ? "Lepas untuk Kirim..." : "Tahan Bicara"}
              </span>
            </button>
          ) : (
            /* Standard Mute/Unmute Tactile Button in Auto Mode */
            onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 border shadow-sm cursor-pointer shrink-0 ${
                  isMuted
                    ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
                    : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-amber-800" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )
          )}

          {/* End Call 3D Tactile Push Button */}
          <button
            type="button"
            onClick={onEndCall}
            className="px-4 sm:px-5 py-2.5 sm:py-3 min-h-[46px] rounded-full btn-skeuo-red flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-red-900/30 group cursor-pointer shrink-0"
            title="End Call and Return to Dashboard"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/20 flex items-center justify-center">
              <PhoneOff className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white whitespace-nowrap">
              End Call
            </span>
          </button>
        </div>
      )}
    </footer>
  );
}
