"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  PhoneCall,
  Award,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

export interface StudentDashboardMobileProps {
  studentName?: string;
  currentCefr?: string;
  activeModule?: {
    id: string;
    title: string;
    cefr?: string;
    objective?: string;
    status?: string;
  };
  levelModules?: any[];
  totalCompletedModules: number;
  totalModules: number;
  placementScore?: number;
  placementCefr?: string;
  voiceCallsCount: number;
  voiceTotalMinutes: number;
  voiceSessions?: any[];
  chatSessions?: any[];
  completedModules?: any[];
}

export function StudentDashboardMobile({
  studentName = "Siswa",
  currentCefr = "A1.1",
  activeModule,
  levelModules = [],
  totalCompletedModules = 0,
  totalModules = 0,
  placementScore,
  placementCefr,
  voiceCallsCount = 0,
  voiceTotalMinutes = 0,
  voiceSessions = [],
  chatSessions = [],
  completedModules = [],
}: StudentDashboardMobileProps) {
  const moduleProgressPercent =
    totalModules > 0
      ? Math.min(100, Math.round((totalCompletedModules / totalModules) * 100))
      : 0;

  const nextModule =
    activeModule ||
    levelModules.find((m) => m.status === "unlocked") ||
    levelModules[0] || {
      id: "A1.1-M01",
      title: "Unit 1: One World: Countries, Nationalities & To Be",
      cefr: currentCefr,
      objective: "Materi mencakup tata bahasa, kosakata kewarganegaraan, dan latihan respons lisan.",
    };

  // Compile real recent activity entries without fabricated numbers
  const activities: Array<{
    id: string;
    type: "voice" | "chat" | "module";
    title: string;
    subtitle: string;
    badgeText: string;
    badgeStyle: string;
    dateText: string;
    scoreText?: string;
    href: string;
  }> = [];

  voiceSessions.slice(0, 2).forEach((call) => {
    const mins = Math.max(1, Math.round((call.durationSeconds || 60) / 60));
    const fluency = call.evaluation?.fluency ? `${call.evaluation.fluency}% Kelancaran` : undefined;
    const dateFormatted = call.createdAt
      ? new Date(call.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      : "Baru saja";

    activities.push({
      id: "voice-" + call.id,
      type: "voice",
      title: call.topic || "Percakapan Harian",
      subtitle: `${mins} menit bersama Mr. Khoirul`,
      badgeText: "Bicara",
      badgeStyle: "bg-amber-100 text-amber-900 border-amber-200",
      dateText: dateFormatted,
      scoreText: fluency,
      href: "/call",
    });
  });

  chatSessions.slice(0, 2).forEach((chat) => {
    const dateFormatted = chat.updatedAt
      ? new Date(chat.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      : "Baru saja";

    activities.push({
      id: "chat-" + chat.id,
      type: "chat",
      title: chat.title || "Tanya Jawab Materi",
      subtitle: "Diskusi tata bahasa dan latihan kalimat",
      badgeText: "Diskusi",
      badgeStyle: "bg-sky-100 text-sky-900 border-sky-200",
      dateText: dateFormatted,
      href: "/chat",
    });
  });

  completedModules.slice(0, 2).forEach((mod) => {
    const dateFormatted = mod.completedAt
      ? new Date(mod.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      : "Selesai";

    activities.push({
      id: "mod-" + mod.id,
      type: "module",
      title: mod.title,
      subtitle: `Unit level ${mod.cefr || currentCefr} selesai`,
      badgeText: "Modul",
      badgeStyle: "bg-emerald-100 text-emerald-900 border-emerald-200",
      dateText: dateFormatted,
      scoreText: mod.score !== null && mod.score !== undefined ? `${mod.score}%` : "Lulus",
      href: `/modules/${mod.id}`,
    });
  });

  const displayActivities = activities.slice(0, 3);

  return (
    <div className="w-full px-3.5 py-4 space-y-3.5 max-w-md mx-auto">
      {/* 1. Header Ringkas & Terarah */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Selamat datang, {studentName}.
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0D3B66] text-white">
            CEFR {currentCefr}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {totalCompletedModules > 0
            ? `Kamu telah menuntaskan ${totalCompletedModules} dari ${totalModules} modul kurikulum.`
            : "Lanjutkan unit pembelajaran aktif atau latih respons bicara bersama tutor."}
        </p>
      </div>

      {/* 2. Ringkasan Metrik (3 Kolom) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Modul */}
        <Link
          href="/modules"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between text-left min-h-[88px] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D3B66]/10 text-[#0D3B66] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="pt-2">
            <p className="text-xs font-black text-slate-900 font-mono leading-none">
              {totalCompletedModules}/{totalModules}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-none">
              Modul ({moduleProgressPercent}%)
            </p>
          </div>
        </Link>

        {/* Latihan Bicara */}
        <Link
          href="/call"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between text-left min-h-[88px] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#F4B41A]/20 text-[#854D0E] flex items-center justify-center">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <div className="pt-2">
            <p className="text-xs font-black text-slate-900 font-mono leading-none">
              {voiceTotalMinutes}m
            </p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-none">
              {voiceCallsCount} Sesi Bicara
            </p>
          </div>
        </Link>

        {/* Evaluasi CEFR */}
        <Link
          href="/placement"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between text-left min-h-[88px] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#9E1B1B]/10 text-[#9E1B1B] flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="pt-2">
            <p className="text-xs font-black text-slate-900 font-mono leading-none truncate">
              {placementCefr || (placementScore !== undefined && placementScore !== null ? `${placementScore}%` : "Tes")}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-none truncate">
              {placementScore !== undefined && placementScore !== null ? "Skor Teruji" : "Diagnostik"}
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Kartu Target Utama: Modul Aktif */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0D3B66]/10 text-[#0D3B66]">
            Target Modul
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {nextModule.id}
          </span>
        </div>

        <div>
          <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
            {nextModule.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">
            {nextModule.objective || "Materi mencakup tata bahasa terstruktur, latihan membaca, dan latihan respons lisan."}
          </p>
        </div>

        <Link
          href={`/modules/${nextModule.id}`}
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="w-full py-2.5 px-4 rounded-xl btn-skeuo-navy text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-95 transition-all"
        >
          <span>Lanjut Belajar</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* 4. Percakapan Langsung dengan Mr. Khoirul */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#F4B41A] text-[#0F172A] flex items-center justify-center shrink-0 shadow-2xs">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              Percakapan Langsung
            </p>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Latih respons spontan bersama Mr. Khoirul
            </p>
          </div>
        </div>
        <Link
          href="/call"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="py-2 px-3.5 rounded-xl btn-skeuo-yellow text-xs font-bold shadow-2xs shrink-0 min-h-[40px] flex items-center active:scale-95 transition-all"
        >
          <span>Mulai Telepon</span>
        </Link>
      </div>

      {/* 5. Riwayat Aktivitas Terakhir */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Riwayat Terakhir
          </h3>
          <Link
            href="/modules"
            className="text-[11px] font-bold text-[#0D3B66] hover:underline"
          >
            Buka Kurikulum
          </Link>
        </div>

        {displayActivities.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-1.5 shadow-2xs">
            <p className="text-xs font-bold text-slate-800">
              Belum ada riwayat tercatat
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Selesaikan modul pertama atau mulai percakapan untuk mencatat progres belajarmu di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayActivities.map((item) => {
              const Icon =
                item.type === "voice"
                  ? PhoneCall
                  : item.type === "chat"
                  ? MessageSquare
                  : CheckCircle2;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => animeButtonPop(e.currentTarget)}
                  className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 active:scale-98 transition-all group min-h-[48px] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-[#0D3B66]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 group-hover:text-[#0D3B66] transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.scoreText && (
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.scoreText}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.dateText}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D3B66] transition-colors ml-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
