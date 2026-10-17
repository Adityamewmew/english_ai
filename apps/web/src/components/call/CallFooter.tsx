"use client";

import React from "react";
import { PhoneCall, PhoneOff, Mic, MicOff } from "lucide-react";

interface CallFooterProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  isMuted?: boolean;
  onToggleMute?: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
}

export function CallFooter({
  callStatus,
  isMuted = false,
  onToggleMute,
  onStartCall,
  onEndCall,
}: CallFooterProps) {
  if (callStatus === "evaluating" || callStatus === "ended") {
    return null;
  }

  return (
    <footer className="w-full max-w-sm mx-auto px-6 pb-8 pt-3 flex items-center justify-center gap-5 relative z-20">
      {callStatus === "idle" ? (
        <button
          type="button"
          onClick={onStartCall}
          className="group px-7 py-3.5 rounded-full btn-skeuo-yellow flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          title="Mulai Panggilan dengan Mr. Khoirul"
        >
          <div className="w-9 h-9 rounded-full bg-slate-900/10 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-slate-900 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-950 uppercase tracking-wide">
              Mulai Panggilan
            </p>
            <p className="text-[10px] text-slate-800 font-semibold">Tutor AI Mr. Khoirul</p>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-4">
          {/* Mute/Unmute Tactile Button */}
          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 border-b-2 shadow-md ${
                isMuted
                  ? "bg-amber-500 hover:bg-amber-400 border-amber-700 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-900 text-slate-200"
              }`}
              title={isMuted ? "Aktifkan Mikrofon" : "Bisukan Mikrofon"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* End Call 3D Tactile Push Button */}
          <button
            type="button"
            onClick={onEndCall}
            className="px-6 py-3 rounded-full btn-skeuo-red flex items-center gap-2.5 transition-all active:scale-95 shadow-lg shadow-red-900/40 group"
            title="Akhiri Panggilan dan Kembali ke Dashboard"
          >
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
              <PhoneOff className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Akhiri Panggilan
            </span>
          </button>
        </div>
      )}
    </footer>
  );
}
