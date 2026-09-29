import React from "react";
import { GraduationCap, CheckCircle2, Target } from "lucide-react";

interface LevelHeaderProps {
  levelTitle: string;
  cefr: string;
  description: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export function LevelHeader({
  levelTitle,
  cefr,
  description,
  completedCount,
  totalCount,
  progressPercent,
}: LevelHeaderProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <GraduationCap className="w-3.5 h-3.5" />
            Level {cefr}
          </span>
          <span className="text-xs text-blue-200 font-medium">Kurikulum Bertingkat</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white">
          {levelTitle}
        </h1>

        <p className="text-sm md:text-base text-blue-100/90 leading-relaxed mb-6 max-w-2xl">
          {description}
        </p>

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
            <span>Selesaikan modul secara berurutan untuk membuka modul berikutnya.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
