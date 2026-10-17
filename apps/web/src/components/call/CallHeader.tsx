"use client";

import React from "react";
import { Menu, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCallDuration } from "@/lib/call-utils";

interface CallHeaderProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  duration: number;
  showSubtitles: boolean;
  lang?: "en-US" | "id-ID";
  onOpenDrawer: () => void;
  onToggleSubtitles: () => void;
  onToggleLang?: () => void;
  onExit?: () => void;
}

export function CallHeader({
  callStatus,
  duration,
  showSubtitles,
  lang = "en-US",
  onOpenDrawer,
  onToggleSubtitles,
  onToggleLang,
  onExit,
}: CallHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 pt-5 pb-2 z-20 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="w-10 h-10 rounded-2xl bg-[#082542] hover:bg-[#0D3B66] border border-white/10 text-slate-200 flex items-center justify-center transition-all active:scale-95 shadow-md"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl bg-[#082542] hover:bg-[#0D3B66] border border-white/10 text-slate-200 flex items-center justify-center transition-all active:scale-95 shadow-md"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}

        <button
          type="button"
          onClick={onOpenDrawer}
          className="w-10 h-10 rounded-2xl bg-[#082542] hover:bg-[#0D3B66] border border-white/10 text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
          title="Menu & Riwayat Percakapan"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Middle status & LCD duration display */}
      <div className="flex items-center gap-2">
        {callStatus === "active" && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#061e36] border border-cyan-500/20 text-xs font-mono font-bold text-emerald-400 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest">{formatCallDuration(duration)}</span>
          </div>
        )}

        {onToggleLang && (
          <button
            type="button"
            onClick={onToggleLang}
            className="px-3 py-1 rounded-full bg-[#082542] hover:bg-[#0D3B66] border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95"
            title={`Mode mic: ${lang === "id-ID" ? "Indonesia" : "English"}. Klik untuk beralih.`}
          >
            {lang === "id-ID" ? "🇮🇩 ID" : "🇬🇧 EN"}
          </button>
        )}
      </div>

      {/* Subtitles Toggle Button */}
      <button
        type="button"
        onClick={onToggleSubtitles}
        className={`w-10 h-10 rounded-2xl border transition-all active:scale-95 shadow-md flex items-center justify-center ${
          showSubtitles
            ? "bg-[#F4B41A] border-[#DDA012] text-slate-950 font-black shadow-amber-500/20"
            : "bg-[#082542] border-white/10 text-slate-400 hover:text-slate-200"
        }`}
        title={showSubtitles ? "Sembunyikan Teks Subtitle" : "Tampilkan Teks Subtitle"}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </header>
  );
}
