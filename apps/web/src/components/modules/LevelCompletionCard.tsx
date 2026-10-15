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
  const defaultNextBtnText = nextLevelButtonText || `Unlock ${nextLevelTitle}`;
  const defaultFirstModBtnText = firstModuleButtonText || `Start Module ${moduleNumber}`;
  const defaultDescription =
    description ||
    `You have mastered the foundational materials well. Continue your learning journey to ${nextLevelTitle} for new topics and speaking challenges.`;

  return (
    <Card
      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
      className="card-skeuo bg-[#0D3B66] border-b-2 border-[#082542] border-slate-700/50 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mt-8 will-change-transform"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge className="gap-2 px-3 py-1 text-xs font-bold bg-[#F4B41A] text-[#0D3B66] border-b border-[#DDA012]">
            <Award className="w-3.5 h-3.5 text-[#0D3B66]" />
            <span>Level Completed</span>
          </Badge>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Congratulations! You have completed {completedLevelTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
            {defaultDescription}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href={`/modules?level=${nextLevelId}`}>
            <Button
              size="default"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="btn-skeuo-yellow w-full sm:w-auto font-black text-xs sm:text-sm flex items-center justify-center gap-2 will-change-transform cursor-pointer"
            >
              <span>{defaultNextBtnText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href={`/modules/${firstNextModuleId}`}>
            <Button
              size="default"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 border-b-2 border-b-black/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:translate-y-0.5 will-change-transform cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#F4B41A]" />
              <span>{defaultFirstModBtnText}</span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
