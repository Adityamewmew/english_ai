"use client";

import React from "react";
import { Lock, CheckCircle2, Award, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeCardHover, animeButtonPop } from "@/lib/anime-effects";

export interface ModuleItemProps {
  id: string;
  title: string;
  cefr: string;
  group: string;
  objective: string;
  complexity: string;
  estimatedMinutes: number;
  isExam: boolean;
  passingScore: number;
  status: "locked" | "unlocked" | "completed";
  score?: number | null;
  orderIndex: number;
}

interface ModuleCardProps {
  module: ModuleItemProps;
  onSelect?: (moduleId: string) => void;
}

export function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const isLocked = module.status === "locked";
  const isCompleted = module.status === "completed";

  return (
    <Card
      onMouseEnter={(e) => !isLocked && animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => !isLocked && animeCardHover(e.currentTarget, false)}
      className={`module-item-card card-skeuo group relative flex flex-col justify-between p-5 transition-all will-change-transform ${
        isLocked
          ? "border-slate-200 bg-slate-50/75 opacity-70 dark:border-slate-800 dark:bg-slate-900/30"
          : isCompleted
          ? "border-slate-200/90 dark:border-slate-800 bg-[#0D3B66]/5 dark:bg-slate-900/60 hover:border-[#0D3B66]/40 cursor-pointer"
          : "border-slate-200/90 bg-white hover:border-[#0D3B66]/40 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
      }`}
    >
      <div>
        {/* Header row: CEFR / Exam badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-semibold text-xs border-b">
              Modul {module.orderIndex}
            </Badge>

            {module.isExam && (
              <Badge className="gap-1 text-xs font-semibold bg-[#F4B41A] text-[#0D3B66] border-b border-[#DDA012]">
                <Award className="w-3 h-3 text-[#0D3B66]" />
                Ujian Kelulusan
              </Badge>
            )}
          </div>

          <div>
            {isCompleted ? (
              <Badge className="gap-1 text-xs font-bold bg-[#0D3B66] text-white border-b border-[#082542]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F4B41A]" />
                <span>Lulus {module.score ? `(${module.score}%)` : ""}</span>
              </Badge>
            ) : isLocked ? (
              <Badge variant="secondary" className="gap-1 text-xs font-medium opacity-80 border-b">
                <Lock className="w-3 h-3" />
                <span>Terkunci</span>
              </Badge>
            ) : (
              <Badge className="text-xs font-bold bg-[#F4B41A] text-[#0D3B66] border-b border-[#DDA012]">
                <span>Terbuka</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-base mb-1.5 ${
            isLocked
              ? "text-slate-600 dark:text-slate-400"
              : "text-slate-900 dark:text-white group-hover:text-[#0D3B66] dark:group-hover:text-[#F4B41A] transition-colors"
          }`}
        >
          {module.title}
        </h3>

        {/* Objective */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {module.objective}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {module.estimatedMinutes} menit
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {module.group}
          </span>
        </div>

        <Button
          size="sm"
          disabled={isLocked}
          onClick={(e) => {
            if (!isLocked) {
              animeButtonPop(e.currentTarget);
              onSelect?.(module.id);
            }
          }}
          className={`gap-1 font-bold text-xs will-change-transform cursor-pointer ${
            isCompleted
              ? "btn-skeuo-navy"
              : isLocked
              ? ""
              : "btn-skeuo-yellow"
          }`}
        >
          <span>{isCompleted ? "Ulangi" : "Mulai"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
