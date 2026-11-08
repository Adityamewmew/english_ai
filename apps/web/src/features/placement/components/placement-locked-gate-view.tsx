"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  CheckCircle2,
  BookOpen,
  Award,
  ArrowRight,
  GraduationCap,
  LogOut,
  LayoutGrid,
} from "lucide-react";
import { doLogout } from "@/app/(auth)/auth.actions";
import { PlacementAdvancementGateInfo } from "../hooks/use-placement-advancement-gate";

interface PlacementLockedGateViewProps {
  gateInfo: PlacementAdvancementGateInfo;
}

export function PlacementLockedGateView({ gateInfo }: PlacementLockedGateViewProps) {
  const {
    currentCefr,
    totalModules,
    completedModules,
    remainingModules,
    progressPercent,
    allModulesCompleted,
    hasCertificate,
  } = gateInfo;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col select-none antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="EDDY'S AI Logo"
              width={36}
              height={36}
              className="rounded-xl shadow-xs"
              priority
            />
            <span className="font-black text-base sm:text-lg tracking-tight text-[#0D3B66] dark:text-white">
              EDDY&apos;S AI
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0D3B66] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[36px]"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <form action={doLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer min-h-[36px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Locked Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 text-center space-y-6">
          {/* Lock Icon Emblem */}
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>Tingkat Aktif: CEFR {currentCefr}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tes Kenaikan Level Terkunci
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Untuk mengambil tes kenaikan level dari <span className="font-bold text-slate-800 dark:text-slate-200">CEFR {currentCefr}</span>, Anda harus menyelesaikan seluruh modul kurikulum dan membuka Sertifikat Kelulusan resmi terlebih dahulu.
            </p>
          </div>

          {/* Checklist Requirements */}
          <div className="space-y-3 text-left">
            {/* 1. Modules Completion Requirement */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                allModulesCompleted
                  ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      allModulesCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-[#0D3B66] text-white"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      1. Tuntaskan Seluruh Modul CEFR {currentCefr}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {completedModules} dari {totalModules} Modul Selesai ({progressPercent}%)
                    </p>
                  </div>
                </div>

                {allModulesCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tuntas</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{remainingModules} Modul Lagi</span>
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    allModulesCompleted ? "bg-emerald-600" : "bg-[#0D3B66]"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 2. Certificate Unlocked Requirement */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                hasCertificate
                  ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      hasCertificate
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      2. Buka Sertifikat Kelulusan {currentCefr}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Otomatis terbuka begitu seluruh {totalModules} modul terselesaikan
                    </p>
                  </div>
                </div>

                {hasCertificate ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Diperoleh</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Belum Terbuka</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {!allModulesCompleted ? (
              <Link
                href="/modules"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0D3B66] hover:bg-[#092b4b] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lanjutkan Belajar ({remainingModules} Modul Tersisa)</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            ) : !hasCertificate ? (
              <Link
                href="/certificates"
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] shadow-xs"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Klaim Sertifikat Kelulusan {currentCefr}</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/certificates"
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 min-h-[44px] transition-all"
              >
                <GraduationCap className="w-4 h-4 text-slate-500" />
                <span>Lihat Sertifikat</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 min-h-[44px] transition-all"
              >
                <LayoutGrid className="w-4 h-4 text-slate-500" />
                <span>Ke Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

