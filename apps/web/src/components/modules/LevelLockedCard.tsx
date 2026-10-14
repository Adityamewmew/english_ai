"use client";

import React from "react";
import { Lock, Target, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { animeCardHover, animeShake } from "@/lib/anime-effects";

interface LevelLockedCardProps {
  levelTitle: string;
  cefr: string;
  description: string;
  lockReason?: string | null;
  remainingModules?: number;
}

export function LevelLockedCard({
  levelTitle,
  cefr,
  description,
  lockReason,
  remainingModules,
}: LevelLockedCardProps) {
  return (
    <Card
      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
      onClick={(e) => animeShake(e.currentTarget)}
      className="card-skeuo bg-slate-900 border border-slate-800 border-b-2 border-b-slate-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden mt-8 cursor-pointer will-change-transform"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60 border-b-2 border-b-slate-950">
            <Lock className="w-3.5 h-3.5 text-[#F4B41A]" />
            <span>Level {cefr} Terkunci</span>
          </Badge>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{levelTitle}</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-2 text-xs text-white/90 bg-[#9E1B1B]/15 border border-[#9E1B1B]/30 border-b-2 border-b-[#9E1B1B]/30 rounded-xl px-3.5 py-2.5 max-w-md">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#F4B41A]" />
            <span>
              {lockReason ||
                (remainingModules !== undefined && remainingModules > 0
                  ? `Selesaikan ${remainingModules} modul lagi dan Ujian Akhir (skor min 75%) untuk membuka level ini.`
                  : "Selesaikan seluruh modul sebelumnya dan Ujian Akhir (skor min 75%) untuk membuka level ini.")}
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700/50 border-b-2 border-b-slate-900 cursor-not-allowed w-full sm:w-auto">
            <Lock className="w-3.5 h-3.5 text-[#F4B41A]" />
            <span>Modul {cefr} Masih Terkunci</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
