"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, LayoutGrid, CheckCircle2, Headphones, PenTool, Mic, LogOut } from "lucide-react";
import { doLogout } from "@/app/(auth)/auth.actions";

interface PlacementCooldownViewProps {
  status: {
    canTakeTest: boolean;
    isInCooldown: boolean;
    daysRemaining: number;
    nextAvailableAt: string | null;
    lastResult: any;
    isAdmin?: boolean;
  };
}

export function PlacementCooldownView({ status }: PlacementCooldownViewProps) {
  const result = status.lastResult;
  const skills = result?.details?.skills || {};
  const cefr = (result?.overallCefr || "A1").toUpperCase();

  const formattedDate = status.nextAvailableAt
    ? new Date(status.nextAvailableAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen bg-[#F4F6FF] text-slate-800 antialiased flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Image
            src="/images/logo-academy.webp"
            alt="EDDY'S AI Academy"
            width={130}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
          <form action={doLogout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Cooldown Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 border-b-6 border-b-slate-300 shadow-md text-center p-6 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 border-b-4 border-b-amber-400 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Placement Assessment Aktif
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
              Level Penempatan Kamu: <span className="text-secondary">{cefr}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Kamu baru saja menyelesaikan tes penempatan. Agar progres belajarmu fokus dan kurikulum tidak terganggu, tes penempatan ulang dapat diambil dalam:
            </p>
          </div>

          {/* Countdown Pill */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-center">
            <span className="text-xs font-semibold text-amber-800">Sisa Masa Cooldown:</span>
            <p className="font-heading text-2xl font-black text-amber-950 mt-0.5">
              {status.daysRemaining} Hari Lagi
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Terbuka kembali pada: <strong>{formattedDate}</strong>
            </p>
          </div>

          {/* 4 Skill Overview */}
          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left pt-1">
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 border-b-2">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" /> MCQ
                </span>
                <p className="font-heading text-base font-extrabold text-primary mt-0.5">
                  {skills.mcq?.score ?? result.mcqScore ?? 0}%
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 border-b-2">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Headphones className="w-3 h-3 text-purple-600" /> Listening
                </span>
                <p className="font-heading text-base font-extrabold text-primary mt-0.5">
                  {skills.listening?.score ?? 0}%
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 border-b-2">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <PenTool className="w-3 h-3 text-emerald-600" /> Writing
                </span>
                <p className="font-heading text-base font-extrabold text-primary mt-0.5">
                  {skills.writing?.score ?? result.writingScore ?? 0}%
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 border-b-2">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Mic className="w-3 h-3 text-secondary" /> Speaking
                </span>
                <p className="font-heading text-base font-extrabold text-primary mt-0.5">
                  {skills.speaking?.score ?? result.speakingScore ?? 0}%
                </p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/modules" className="flex-1">
              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-[#0c2b48] text-white font-bold text-sm border-b-4 border-b-[#07192b] active:border-b-0 active:translate-y-1 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                Lanjut Belajar Modul {cefr}
              </button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 border-b-4 border-b-slate-400 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-slate-500" />
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

