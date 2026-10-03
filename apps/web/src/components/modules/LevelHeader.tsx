"use client";

import React, { useEffect, useRef } from "react";
import { GraduationCap, CheckCircle2, Target, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { animeCardHover, animeCountUp } from "@/lib/anime-effects";

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
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (percentRef.current) {
      animeCountUp(percentRef.current, 0, progressPercent, "", "%");
    }
  }, [progressPercent]);

  return (
    <div
      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
      className={`rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden transition-all will-change-transform ${
        isUnlocked
          ? "bg-gradient-to-r from-blue-900 to-indigo-950"
          : "bg-gradient-to-r from-slate-800 to-slate-900 opacity-90 border border-slate-700/60"
      }`}
    >
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant={isUnlocked ? "primary" : "secondary"}
            className="gap-1.5 px-3 py-1 text-xs font-semibold"
          >
            {isUnlocked ? (
              <GraduationCap className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            Level {cefr}
          </Badge>
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
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {completedCount} dari {totalCount} modul selesai
              </span>
            </div>
            <span ref={percentRef} className="font-bold text-white">
              {progressPercent}%
            </span>
          </div>

          <Progress value={progressPercent} className="h-2.5 bg-black/30" />

          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-blue-200/80">
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
