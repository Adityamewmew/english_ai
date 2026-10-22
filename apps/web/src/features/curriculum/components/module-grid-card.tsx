"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, BookOpen, GraduationCap } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { useSession } from "@/features/auth/hooks/use-session";
import { isUserAdmin } from "@/lib/auth-utils";

export interface CurriculumModuleItem {
  id: string;
  title: string;
  cefr: string;
  description?: string;
  status: "unlocked" | "completed" | "locked" | "requires_access";
  score?: number | null;
  skillFocus?: string;
  orderIndex?: number;
  isExam?: boolean;
}

interface ModuleGridCardProps {
  module: CurriculumModuleItem;
  index: number;
  onUnlockClick?: () => void;
}

const THUMBNAIL_STYLES = [
  { bg: "#F8FAFC", border: "#E2E8F0", img: "/illustrations/hero-learning.svg", badge: "bg-[#0D3B66] text-white border-b border-[#082542]" },
  { bg: "#FFFBEB", border: "#FDE68A", img: "/illustrations/student-books.svg", badge: "bg-[#F4B41A] text-[#0F172A] border-b border-[#DDA012]" },
  { bg: "#FEF2F2", border: "#FECACA", img: "/illustrations/article-vocab.svg", badge: "bg-[#9E1B1B] text-white border-b border-[#751414]" },
  { bg: "#F0F9FF", border: "#BAE6FD", img: "/illustrations/article-guide.svg", badge: "bg-[#1B4965] text-white border-b border-[#113144]" },
];

export function ModuleGridCard({ module, index, onUnlockClick }: ModuleGridCardProps) {
  const { data: sessionUser } = useSession();
  const isAdmin = isUserAdmin(sessionUser);
  const isRequiresAccess = !isAdmin && module.status === "requires_access";
  const isLocked = !isAdmin && (module.status === "locked" || isRequiresAccess);
  const isCompleted = module.status === "completed";
  const isExam = module.id.includes("M13") || Boolean(module.isExam);
  const style = THUMBNAIL_STYLES[index % THUMBNAIL_STYLES.length];

  return (
    <>
      {/* 1. Mobile Card (<sm) */}
      <div
        className={`sm:hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3 transition-all ${
          isLocked ? "opacity-65" : "hover:shadow-xs"
        }`}
      >
        {/* Card Header: Level Pill & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0D3B66] text-white">
              CEFR {module.cefr}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {module.id}
            </span>
          </div>

          <div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Selesai</span>
              </span>
            ) : isRequiresAccess ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Lock className="w-3 h-3" />
                <span>Perlu Beli</span>
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Terkunci</span>
              </span>
            ) : (
              <span className={`text-[10px] font-bold ${isExam ? "text-amber-600 dark:text-amber-400" : "text-[#0D3B66] dark:text-[#F4B41A]"}`}>
                {isExam ? "55 Soal Ujian" : "10 Latihan"}
              </span>
            )}
          </div>
        </div>

        {/* Card Content: Title & Objective */}
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
            {module.title}
          </h4>
          {module.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
              {module.description}
            </p>
          )}
        </div>

        {/* Card Action Button */}
        <div>
          {isRequiresAccess ? (
            <button
              type="button"
              onClick={onUnlockClick}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Buka Akses Kelas</span>
            </button>
          ) : isLocked ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Materi Terkunci</span>
            </button>
          ) : (
            <Link
              href={`/modules/${module.id}`}
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all shadow-xs ${
                isCompleted
                  ? "btn-skeuo-yellow text-[#0F172A]"
                  : isExam
                  ? "bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  : "btn-skeuo-navy"
              }`}
            >
              <span>{isCompleted ? (isExam ? "Ulas Ujian" : "Ulas Materi") : (isExam ? "Mulai Ujian" : "Mulai Belajar")}</span>
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
              <span className={`flex items-center gap-1 font-semibold ${isExam ? "text-amber-600 dark:text-amber-400" : ""}`}>
                {isExam ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>55 Soal Ujian</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3 h-3 text-[#0D3B66]" />
                    <span>10 Latihan</span>
                  </>
                )}
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
            {isRequiresAccess ? (
              <button
                type="button"
                onClick={onUnlockClick}
                className="px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 text-indigo-600" />
                <span>Buka Kelas</span>
              </button>
            ) : isLocked ? (
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
                    : isExam
                    ? "bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    : "btn-skeuo-navy"
                }`}
              >
                <span>{isCompleted ? (isExam ? "Ulas Ujian" : "Ulas") : (isExam ? "Ikuti Ujian" : "Mulai")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
