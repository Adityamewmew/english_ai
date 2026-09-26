"use client";

import React from "react";
import { Menu, SlidersHorizontal } from "lucide-react";
import { formatCallDuration } from "@/lib/call-utils";

interface CallHeaderProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  duration: number;
  showSubtitles: boolean;
  onOpenDrawer: () => void;
  onToggleSubtitles: () => void;
}

export function CallHeader({
  callStatus,
  duration,
  showSubtitles,
  onOpenDrawer,
  onToggleSubtitles,
}: CallHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-6 pt-6 pb-2 z-20">
      <button
        type="button"
        onClick={onOpenDrawer}
        className="w-11 h-11 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
        title="Menu & Riwayat"
      >
        <Menu className="w-5 h-5" />
      </button>

      {callStatus === "active" && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono font-medium text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{formatCallDuration(duration)}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onToggleSubtitles}
        className={`w-11 h-11 rounded-full border transition-all active:scale-95 shadow-md flex items-center justify-center ${
          showSubtitles
            ? "bg-zinc-900/90 border-zinc-700 text-zinc-200"
            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
        }`}
        title={showSubtitles ? "Sembunyikan Teks Subtitle" : "Tampilkan Teks Subtitle"}
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>
    </header>
  );
}
