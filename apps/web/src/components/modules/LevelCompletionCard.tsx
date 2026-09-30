import React from "react";
import Link from "next/link";
import { Award, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LevelCompletionCardProps {
  completedLevelTitle: string;
  nextLevelTitle: string;
  nextLevelId: string;
  firstNextModuleId: string;
}

export function LevelCompletionCard({
  completedLevelTitle,
  nextLevelTitle,
  nextLevelId,
  firstNextModuleId,
}: LevelCompletionCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mt-8">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pencapaian Level Selesai</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selamat! Kamu telah menyelesaikan {completedLevelTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Fondasi dasar komunikasi telah kamu kuasai. Buka dan lanjutkan pembelajaran ke{" "}
            <span className="font-semibold text-emerald-300">{nextLevelTitle}</span> untuk mempelajari bentuk lampau, penunjuk arah, dan percakapan kontekstual lanjutan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href={`/modules?level=${nextLevelId}`}>
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
            >
              <span>Buka Level 2</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href={`/modules/${firstNextModuleId}`}>
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto border-emerald-500/40 hover:bg-emerald-950/50 text-emerald-200 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Modul 14</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
