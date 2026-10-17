"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCallDuration } from "@/lib/call-utils";

interface CallHeaderProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  duration: number;
  lang?: "en-US" | "id-ID";
  onToggleLang?: () => void;
  onExit?: () => void;
}

export function CallHeader({
  callStatus,
  duration,
  lang = "en-US",
  onToggleLang,
  onExit,
}: CallHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 pt-5 pb-2 z-20 max-w-4xl mx-auto">
      {/* Back to Dashboard Button */}
      <div className="flex items-center gap-2">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Middle status & LCD duration display */}
      <div className="flex items-center gap-2.5">
        {callStatus === "active" && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-widest">{formatCallDuration(duration)}</span>
          </div>
        )}

        {onToggleLang && (
          <button
            type="button"
            onClick={onToggleLang}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            title={`Mode mic: ${lang === "id-ID" ? "Indonesia" : "English"}. Klik untuk beralih.`}
          >
            {lang === "id-ID" ? "🇮🇩 ID" : "🇬🇧 EN"}
          </button>
        )}
      </div>

      {/* Right Spacer for balance (top right button removed per instruction) */}
      <div className="w-10" />
    </header>
  );
}
