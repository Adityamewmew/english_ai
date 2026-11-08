"use client";

import React from "react";
import { Clock, LogOut, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionIdleTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onContinue: () => void;
  onLogout: () => void;
}

export function SessionIdleTimeoutModal({
  isOpen,
  remainingSeconds,
  onContinue,
  onLogout,
}: SessionIdleTimeoutModalProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center">
        {/* Icon with pulsing animation */}
        <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white">
            Sesi Belajar Segera Berakhir
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Tidak ada aktivitas terdeteksi selama 25 menit. Sesi Anda akan otomatis ditutup untuk melindungi keamanan akun Anda.
          </p>
        </div>

        {/* Big countdown badge */}
        <div className="py-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 inline-block mx-auto">
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Sisa Waktu Sesi
          </div>
          <div className="text-3xl font-black font-mono text-amber-900 dark:text-amber-200 pt-0.5">
            {timeFormatted}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Keluar Sekarang</span>
          </Button>

          <Button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#082542] text-white text-xs font-bold cursor-pointer min-h-[44px] shadow-sm font-heading"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            <span>Lanjutkan Belajar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

