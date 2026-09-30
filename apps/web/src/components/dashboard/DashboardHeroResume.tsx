"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardHeroResumeProps {
  studentName: string;
  studentEmail: string;
  currentCefr: string;
  placementScore?: number | null;
  nextModule?: {
    id: string;
    title: string;
    orderIndex: number;
    cefr: string;
  } | null;
  totalCompletedModules: number;
  totalModules: number;
}

export function DashboardHeroResume({
  studentName,
  studentEmail,
  currentCefr,
  placementScore,
  nextModule,
  totalCompletedModules,
  totalModules,
}: DashboardHeroResumeProps) {
  const isAllCompleted = totalModules > 0 && totalCompletedModules >= totalModules;

  return (
    <div className="space-y-4">
      {/* Welcome Passport Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg border border-blue-900/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Student English Passport</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {studentName}!
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-lg leading-relaxed">
            {studentEmail} • Progress Belajar:{" "}
            <span className="font-semibold text-white">
              {totalCompletedModules} dari {totalModules} modul
            </span>{" "}
            telah kamu kuasai.
          </p>
        </div>

        {/* CEFR Level Box */}
        <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-5 text-center min-w-[170px] shrink-0">
          <span className="text-xs font-medium text-slate-300 block">Level CEFR Aktif</span>
          <div className="text-4xl font-black text-amber-400 mt-1 tracking-tight">
            {currentCefr}
          </div>
          {placementScore !== null && placementScore !== undefined ? (
            <span className="text-[11px] text-slate-300 mt-1 block">
              Skor Penempatan: {placementScore}%
            </span>
          ) : (
            <span className="text-[11px] text-slate-300 mt-1 block">
              Status: Terdaftar
            </span>
          )}
          <Link
            href="/placement"
            className="text-[11px] text-blue-300 hover:text-white underline mt-2 block font-medium transition-colors"
          >
            Ulangi Tes Penempatan
          </Link>
        </div>
      </div>

      {/* Smart Resume Action Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/40">
                {isAllCompleted ? "Kurikulum Tuntas" : "Lanjutkan Belajar"}
              </span>
              {nextModule && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Level {nextModule.cefr}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isAllCompleted
                ? "Luar Biasa! Semua Modul Selesai"
                : nextModule
                ? `Modul ${nextModule.orderIndex}: ${nextModule.title}`
                : "Mulai Modul Pertama"}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAllCompleted
                ? "Kamu telah menyelesaikan seluruh level pembelajaran. Terus asah refleks bicaramu di sesi Call Speaking!"
                : nextModule
                ? "Lanjutkan latihan teori, kosa kata, dan speaking lab untuk membuka materi berikutnya."
                : "Masuk ke kurikulum modul untuk memulai perjalanan belajarmu dari fondasi dasar."}
            </p>
          </div>
        </div>

        <div className="shrink-0 sm:self-center">
          <Link
            href={
              isAllCompleted
                ? "/call"
                : nextModule
                ? `/modules/${nextModule.id}`
                : "/modules"
            }
          >
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isAllCompleted ? "Praktik Bicara Bebas" : "Mulai Modul Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
