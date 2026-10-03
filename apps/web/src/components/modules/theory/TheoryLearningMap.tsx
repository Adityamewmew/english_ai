"use client";

import React from "react";
import { Compass, CheckCircle2, Circle, ArrowDown, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface LearningMapNode {
  step: number;
  title: string;
  subtitle: string;
  tag: string;
}

export const DEFAULT_LEARNING_MAP: LearningMapNode[] = [
  { step: 1, title: "Orientasi & Peta Mental", subtitle: "Target & gambaran besar materi", tag: "Orient" },
  { step: 2, title: "Konsep Dasar & Anatomi", subtitle: "Definisi, fungsi & bagian komponen", tag: "Understand" },
  { step: 3, title: "Rumus & Contoh Bertingkat", subtitle: "Pola kalimat & tangga contoh 3-tier", tag: "Learn" },
  { step: 4, title: "Kosakata & Bedah Dialog", subtitle: "Kosakata kontekstual & analisis", tag: "Explore" },
  { step: 5, title: "Cek Kesiapan Belajar", subtitle: "3 soal latihan terpandu & feedback", tag: "Check" },
  { step: 6, title: "Uji Mandiri Menulis/Bicara", subtitle: "Mini trial & gerbang praktikum", tag: "Apply" },
];

interface TheoryLearningMapProps {
  unlockedStep: number;
  onScrollToStep: (step: number) => void;
  isPracticeUnlocked?: boolean;
}

export function TheoryLearningMap({
  unlockedStep,
  onScrollToStep,
  isPracticeUnlocked = false,
}: TheoryLearningMapProps) {
  const maxStep = isPracticeUnlocked ? 6 : unlockedStep;

  return (
    <Card className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>🗺️ Peta Mental Pembelajaran (Lesson Map)</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Klik langkah yang terbuka untuk melompat
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        Peta alur dari pemahaman dasar hingga siap berinteraksi langsung di Speaking Lab:
      </p>

      {/* Visual Roadmap Grid / Stepper Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {DEFAULT_LEARNING_MAP.map((node) => {
          const isUnlocked = node.step <= maxStep;
          const isDone = node.step < maxStep || isPracticeUnlocked;
          const isCurrent = node.step === maxStep;

          return (
            <button
              key={node.step}
              type="button"
              onClick={() => {
                if (isUnlocked) onScrollToStep(node.step);
              }}
              disabled={!isUnlocked}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer select-none ${
                isCurrent
                  ? "bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-sm ring-2 ring-blue-300 dark:ring-blue-800 scale-102"
                  : isDone
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100 hover:border-emerald-400"
                  : isUnlocked
                  ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                  : "bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : node.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Step 0{node.step}
                  </span>
                </div>

                <Badge
                  variant={isCurrent ? "primary" : isDone ? "success" : "secondary"}
                  size="sm"
                  className="text-[9px] uppercase tracking-wider font-extrabold"
                >
                  {node.tag}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {node.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {node.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// Backward-compatible alias
export const Phase1LearningMap = TheoryLearningMap;
