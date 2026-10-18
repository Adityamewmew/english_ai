"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

export interface CurriculumModuleItem {
  id: string;
  title: string;
  cefr: string;
  description?: string;
  status: "unlocked" | "completed" | "locked";
  score?: number | null;
  skillFocus?: string;
  orderIndex?: number;
}

interface ModuleGridCardProps {
  module: CurriculumModuleItem;
  index: number;
}

const THUMBNAIL_STYLES = [
  { bg: "#F8FAFC", border: "#E2E8F0", img: "/illustrations/hero-learning.svg", badge: "bg-[#0D3B66] text-white border-b border-[#082542]" },
  { bg: "#FFFBEB", border: "#FDE68A", img: "/illustrations/student-books.svg", badge: "bg-[#F4B41A] text-[#0F172A] border-b border-[#DDA012]" },
  { bg: "#FEF2F2", border: "#FECACA", img: "/illustrations/article-vocab.svg", badge: "bg-[#9E1B1B] text-white border-b border-[#751414]" },
  { bg: "#F0F9FF", border: "#BAE6FD", img: "/illustrations/article-guide.svg", badge: "bg-[#1B4965] text-white border-b border-[#113144]" },
];

export function ModuleGridCard({ module, index }: ModuleGridCardProps) {
  const isLocked = module.status === "locked";
  const isCompleted = module.status === "completed";
  const style = THUMBNAIL_STYLES[index % THUMBNAIL_STYLES.length];

  return (
    <>
      {/* 1. Mobile Compact List Card (<sm) */}
      <div
        className={`sm:hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3 active:scale-98 transition-all min-h-[64px] ${
          isLocked ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            style={{ backgroundColor: style.bg }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : isLocked ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : (
              <BookOpen className="w-5 h-5 text-[#0D3B66]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#0D3B66] dark:text-[#F4B41A]">
                {module.id}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                · 10 Latihan
              </span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
              {module.title}
            </h4>
          </div>
        </div>

        <div className="shrink-0">
          {isLocked ? (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-[11px] flex items-center gap-1 border border-slate-200">
              <Lock className="w-3 h-3" />
              <span>Terkunci</span>
            </span>
          ) : (
            <Link
              href={`/modules/${module.id}`}
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 min-h-[38px] active:scale-95 transition-all shadow-xs ${
                isCompleted
                  ? "btn-skeuo-yellow text-[#0F172A]"
                  : "btn-skeuo-navy"
              }`}
            >
              <span>{isCompleted ? "Ulas" : "Mulai"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Desktop Grid Card (sm+) */}
      <div
        className={`hidden sm:flex group bg-white dark:bg-slate-900 border border-b-2 rounded-[22px] overflow-hidden p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 flex-col justify-between gap-3.5 ${
          isLocked
            ? "border-slate-200/60 dark:border-slate-800/60 opacity-75"
            : "border-slate-200/90 dark:border-slate-800 hover:shadow-md hover:border-[#0D3B66] dark:hover:border-[#F4B41A]"
        }`}
      >
        {/* Top Illustration Thumbnail Frame */}
        <div
          style={{ backgroundColor: style.bg }}
          className="w-full h-36 rounded-2xl flex items-center justify-center relative overflow-hidden border border-black/5 p-2 group-hover:scale-[1.01] transition-transform"
        >
          {/* Level Pill Badge in corner */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs font-mono ${style.badge}`}
            >
              CEFR {module.cefr}
            </span>
          </div>

          {/* Status Indicator */}
          {isCompleted && (
            <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-[#0D3B66] text-[#F4B41A] flex items-center justify-center shadow-xs border border-white/20">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {isLocked && (
            <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-[#0D3B66]/80 backdrop-blur-xs text-white flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Real SVG illustration */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={style.img}
            alt={module.title}
            className="w-full h-full object-contain drop-shadow-2xs"
          />
        </div>

        {/* Meta row: Category & exercise count */}
        <div className="px-1 space-y-1.5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
              <span className="uppercase tracking-wider font-mono text-[#0D3B66] dark:text-[#F4B41A]">
                {module.id}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <BookOpen className="w-3 h-3 text-[#0D3B66]" />
                <span>10 Latihan</span>
              </span>
            </div>

            {/* Module Title */}
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#0D3B66] dark:group-hover:text-[#F4B41A] transition-colors">
              {module.title}
            </h4>

            {/* Module Description */}
            {module.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {module.description}
              </p>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400">
              CEFR {module.cefr}
            </span>

            {/* CTA Action Pill */}
            {isLocked ? (
              <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center gap-1 cursor-not-allowed border border-slate-200">
                <Lock className="w-3 h-3" />
                <span>Terkunci</span>
              </span>
            ) : (
              <Link
                href={`/modules/${module.id}`}
                onClick={(e) => animeButtonPop(e.currentTarget)}
                className={`px-4 py-2 sm:py-1.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 min-h-[40px] sm:min-h-[36px] touch-manipulation ${
                  isCompleted
                    ? "btn-skeuo-yellow text-[#0F172A]"
                    : "btn-skeuo-navy"
                }`}
              >
                <span>{isCompleted ? "Ulas" : "Mulai"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
