import React from "react";
import { GraduationCap, CheckCircle2, Target, Lock } from "lucide-react";

interface LevelHeaderProps {
  levelTitle: string;
  cefr: string;
  description: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  isUnlocked?: boolean;
  lockReason?: string | null;
}

export function LevelHeader({
  levelTitle,
  cefr,
  description,
  completedCount,
  totalCount,
  progressPercent,
  isUnlocked = true,
  lockReason,
}: LevelHeaderProps) {
  return (
    <div
      className={`rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden transition-all duration-300 ${
        isUnlocked
          ? "bg-gradient-to-r from-blue-900 to-indigo-950"
          : "bg-gradient-to-r from-slate-800 to-slate-900 opacity-90 border border-slate-700/60"
      }`}
    >
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isUnlocked
                ? "bg-blue-500/20 text-blue-200 border-blue-400/30"
                : "bg-slate-700/50 text-slate-300 border-slate-600/40"
            }`}
          >
            {isUnlocked ? (
              <GraduationCap className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            Level {cefr}
          </span>
          <span className="text-xs text-blue-200/80 font-medium">
            {isUnlocked ? "Kurikulum Bertingkat" : "Terkunci"}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-2.5">
          {levelTitle}
          {!isUnlocked && <Lock className="w-5 h-5 text-amber-400 shrink-0" />}
        </h1>

        <p className="text-sm md:text-base text-blue-100/90 leading-relaxed mb-6 max-w-2xl">
          {description}
        </p>

        {/* Lock Notice if locked */}
        {!isUnlocked && lockReason && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 max-w-xl">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200 font-medium leading-relaxed">
              {lockReason}
            </p>
          </div>
        )}

        {/* Progress bar and counter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 font-medium text-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {completedCount} dari {totalCount} modul selesai
              </span>
            </div>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>

          <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-blue-200/80">
            <Target className="w-3 h-3 text-amber-300" />
            <span>
              {isUnlocked
                ? "Selesaikan modul secara berurutan untuk membuka modul berikutnya."
                : "Selesaikan modul prasyarat untuk membuka level ini."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
