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
      className={`module-item-card group relative flex flex-col justify-between p-5 transition-all will-change-transform ${
        isLocked
          ? "border-slate-200 bg-slate-50/75 opacity-70 dark:border-slate-800 dark:bg-slate-900/30"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-800/40 dark:bg-emerald-950/10 cursor-pointer"
          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
      }`}
    >
      <div>
        {/* Header row: CEFR / Exam badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-semibold text-xs">
              Modul {module.orderIndex}
            </Badge>

            {module.isExam && (
              <Badge variant="warning" className="gap-1 text-xs font-semibold">
                <Award className="w-3 h-3" />
                Ujian Kelulusan
              </Badge>
            )}
          </div>

          <div>
            {isCompleted ? (
              <Badge variant="success" className="gap-1 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lulus {module.score ? `(${module.score}%)` : ""}</span>
              </Badge>
            ) : isLocked ? (
              <Badge variant="secondary" className="gap-1 text-xs font-medium opacity-80">
                <Lock className="w-3 h-3" />
                <span>Terkunci</span>
              </Badge>
            ) : (
              <Badge variant="primary" className="text-xs font-medium">
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
              : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
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
          className={`gap-1 font-medium text-xs shadow-xs will-change-transform ${
            isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
        >
          <span>{isCompleted ? "Ulangi" : "Mulai"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
