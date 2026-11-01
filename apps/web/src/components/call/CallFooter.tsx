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
  talkMode = "auto",
  onToggleTalkMode,
  isPressingTalk = false,
  onTalkStart,
  onTalkEnd,
}: CallFooterProps) {
  if (callStatus === "evaluating" || callStatus === "ended") {
    return null;
  }

  return (
    <footer className="w-full max-w-md mx-auto px-6 pb-8 pt-2 flex flex-col items-center justify-center gap-3 relative z-20">
      {callStatus === "active" && onToggleTalkMode && (
        <div className="flex items-center gap-1 p-1 bg-slate-100/95 border border-slate-200/90 rounded-full shadow-2xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => onToggleTalkMode("auto")}
            className={`px-3 py-1 rounded-full text-[11px] font-heading font-bold transition-all cursor-pointer ${
              talkMode === "auto"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Auto (Hands-Free)
          </button>
          <button
            type="button"
            onClick={() => onToggleTalkMode("ptt")}
            className={`px-3 py-1 rounded-full text-[11px] font-heading font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              talkMode === "ptt"
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Radio className="w-3 h-3 text-slate-900" />
            <span>Push to Talk (PTT)</span>
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
        <div className="flex items-center gap-3.5">
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
              className={`px-5 sm:px-6 py-3 rounded-full flex items-center gap-2.5 font-heading font-black text-xs uppercase tracking-wider transition-all select-none cursor-pointer ${
                isPressingTalk
                  ? "bg-amber-400 text-slate-950 scale-102 shadow-lg shadow-amber-400/40 ring-4 ring-amber-400/30 border-2 border-amber-500"
                  : "bg-white hover:bg-slate-50 text-primary border border-slate-300 shadow-md active:scale-95"
              }`}
              title="Tahan untuk Bicara (atau tahan Spacebar di keyboard)"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isPressingTalk
                    ? "bg-slate-950 text-amber-400 animate-pulse"
                    : "bg-slate-100 text-primary"
                }`}
              >
                <Mic className="w-4 h-4" />
              </div>
              <span className="whitespace-nowrap">
                {isPressingTalk ? "Lepas untuk Kirim..." : "Tahan untuk Bicara"}
              </span>
            </button>
          ) : (
            /* Standard Mute/Unmute Tactile Button in Auto Mode */
            onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 border shadow-sm cursor-pointer ${
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
            className="px-5 py-3 rounded-full btn-skeuo-red flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/30 group cursor-pointer"
            title="End Call and Return to Dashboard"
          >
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center">
              <PhoneOff className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              End Call
            </span>
          </button>
        </div>
      )}
    </footer>
  );
}
