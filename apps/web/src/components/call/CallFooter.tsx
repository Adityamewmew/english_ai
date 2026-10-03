"use client";

import React from "react";
import { PhoneCall, PhoneOff } from "lucide-react";

interface CallFooterProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  onStartCall: () => void;
  onEndCall: () => void;
}

export function CallFooter({ callStatus, onStartCall, onEndCall }: CallFooterProps) {
  if (callStatus === "evaluating" || callStatus === "ended") {
    return null;
  }

  return (
    <footer className="w-full max-w-sm mx-auto px-6 pb-12 pt-2 flex items-center justify-center relative z-20">
      {callStatus === "idle" ? (
        <button
          type="button"
          onClick={onStartCall}
          className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-emerald-500/30 group"
          title="Mulai Panggilan"
        >
          <PhoneCall className="w-7 h-7 transition-transform group-hover:scale-110" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-red-600/30 group"
          title="Akhiri Panggilan"
        >
          <PhoneOff className="w-7 h-7 transition-transform group-hover:scale-110" />
        </button>
      )}
    </footer>
  );
}
