import React from "react";
import { Lock, Target, ShieldAlert } from "lucide-react";

interface LevelLockedCardProps {
  levelTitle: string;
  cefr: string;
  description: string;
  lockReason?: string | null;
}

export function LevelLockedCard({
  levelTitle,
  cefr,
  description,
  lockReason,
}: LevelLockedCardProps) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 text-white shadow-md relative overflow-hidden mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Level {cefr} Terkunci</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{levelTitle}</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2.5 max-w-md">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              {lockReason || "Selesaikan seluruh modul Level 1 dan Ujian Akhir (skor min 75%) untuk membuka level ini."}
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold border border-slate-700/50 cursor-not-allowed w-full sm:w-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>Modul Level 2 Masih Terkunci</span>
          </div>
        </div>
      </div>
    </div>
  );
}
