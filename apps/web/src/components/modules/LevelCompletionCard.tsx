"use client";

import React from "react";
import Link from "next/link";
import { Award, ArrowRight, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeCardHover, animeButtonPop } from "@/lib/anime-effects";

interface LevelCompletionCardProps {
  completedLevelTitle: string;
  nextLevelTitle: string;
  nextLevelId: string;
  firstNextModuleId: string;
  description?: string;
  nextLevelButtonText?: string;
  firstModuleButtonText?: string;
}

export function LevelCompletionCard({
  completedLevelTitle,
  nextLevelTitle,
  nextLevelId,
  firstNextModuleId,
  description,
  nextLevelButtonText,
  firstModuleButtonText,
}: LevelCompletionCardProps) {
  const moduleNumber = firstNextModuleId.replace(/^A1-M0?/, "");
  const defaultNextBtnText = nextLevelButtonText || `Buka ${nextLevelTitle}`;
  const defaultFirstModBtnText = firstModuleButtonText || `Mulai Modul ${moduleNumber}`;
  const defaultDescription =
    description ||
    `Fondasi pembelajaran telah kamu kuasai dengan baik. Lanjutkan perjalanan belajarmu ke ${nextLevelTitle} untuk materi dan tantangan speaking baru.`;

  return (
    <Card
      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
      className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950 border-emerald-500/30 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mt-8 will-change-transform"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge variant="success" className="gap-2 px-3 py-1 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pencapaian Level Selesai</span>
          </Badge>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selamat! Kamu telah menyelesaikan {completedLevelTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {defaultDescription}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href={`/modules?level=${nextLevelId}`}>
            <Button
              size="default"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 active:translate-y-0.5 will-change-transform"
            >
              <span>{defaultNextBtnText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href={`/modules/${firstNextModuleId}`}>
            <Button
              variant="outline"
              size="default"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="w-full sm:w-auto border-emerald-500/40 hover:bg-emerald-950/50 text-emerald-200 text-xs sm:text-sm flex items-center justify-center gap-2 active:translate-y-0.5 will-change-transform"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{defaultFirstModBtnText}</span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
