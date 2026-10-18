"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  PhoneCall,
  Award,
  ArrowRight,
  ChevronRight,
  Sparkles,
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
      objective: "Materi interaktif dasar tata bahasa dan komunikasi sehari-hari.",
    };

  // Compile recent activities for mobile feed
  const activities: Array<{
    id: string;
    type: "voice" | "chat" | "module";
    title: string;
    subtitle: string;
    badgeText: string;
    badgeColor: string;
    dateText: string;
    scoreText?: string;
    href: string;
  }> = [];

  voiceSessions.slice(0, 2).forEach((call) => {
    const mins = Math.max(1, Math.round((call.durationSeconds || 60) / 60));
    const fluency = call.evaluation?.fluency ? `${call.evaluation.fluency}% Fluency` : undefined;
    const dateFormatted = call.createdAt
      ? new Date(call.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      : "Baru saja";

    activities.push({
      id: "voice-" + call.id,
      type: "voice",
      title: call.topic || "Latihan Percakapan",
      subtitle: `${mins}m latihan bersama Mr. Khoirul`,
      badgeText: "Voice",
      badgeColor: "bg-[#F4B41A]/20 text-[#854D0E] border-[#F4B41A]/40",
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
      title: chat.title || "Tanya Jawab AI",
      subtitle: "Diskusi kosakata & grammar",
      badgeText: "Chat",
      badgeColor: "bg-[#0D3B66]/10 text-[#0D3B66] border-[#0D3B66]/20",
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
      subtitle: `Modul level ${mod.cefr || "A1"} tuntas`,
      badgeText: "Modul",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dateText: dateFormatted,
      scoreText: mod.score !== null && mod.score !== undefined ? `${mod.score}%` : "Lulus",
      href: `/modules/${mod.id}`,
    });
  });

  const displayActivities = activities.slice(0, 3);
  const initial = studentName ? studentName.charAt(0).toUpperCase() : "S";

  return (
    <div className="w-full px-3.5 py-4 space-y-4 max-w-md mx-auto">
      {/* 1. Compact Native Greeting Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0D3B66] border border-[#082542] p-4 text-white shadow-sm">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[#F4B41A]/20 blur-xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[#F4B41A] text-[10px] font-black uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3 h-3 text-[#F4B41A]" />
              <span>CEFR Level {currentCefr}</span>
            </div>
            <h2 className="text-base font-black text-white truncate leading-tight pt-1">
              Halo, {studentName}! 👋
            </h2>
            <p className="text-[11px] text-slate-200 font-medium">
              Ayo lanjutkan latihan bahasa Inggrismu hari ini.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F4B41A] text-[#0D3B66] font-black text-sm flex items-center justify-center shrink-0 border-2 border-white/20 shadow-xs">
            {initial}
          </div>
        </div>
      </div>

      {/* 2. Compact 3-Metric Stat Strip */}
      <div className="grid grid-cols-3 gap-2">
        {/* Modul Card */}
        <Link
          href="/modules"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-between text-center min-h-[86px] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-[#0D3B66] text-white flex items-center justify-center shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="w-full">
            <p className="text-xs font-black text-slate-900 group-hover:text-[#0D3B66] transition-colors leading-none">
              {totalCompletedModules}/{totalModules}
            </p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-none">
              Modul ({moduleProgressPercent}%)
            </p>
          </div>
        </Link>

        {/* Speaking Card */}
        <Link
          href="/call"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-between text-center min-h-[86px] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-[#F4B41A] text-[#0F172A] flex items-center justify-center shadow-2xs">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <div className="w-full">
            <p className="text-xs font-black text-slate-900 group-hover:text-[#854D0E] transition-colors leading-none">
              {voiceTotalMinutes}m
            </p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-none">
              {voiceCallsCount} Sesi Bicara
            </p>
          </div>
        </Link>

        {/* Placement Card */}
        <Link
          href="/placement"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-between text-center min-h-[86px] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-xl bg-[#9E1B1B] text-white flex items-center justify-center shadow-2xs">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="w-full">
            <p className="text-xs font-black text-slate-900 group-hover:text-[#9E1B1B] transition-colors leading-none">
              {placementCefr || (placementScore ? `${placementScore}%` : "Tes")}
            </p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-none">
              {placementScore ? `${placementScore}% Skor` : "CEFR Level"}
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Primary Next Unit Spotlight Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0D3B66]/10 text-[#0D3B66] border border-[#0D3B66]/20">
            Unit Selanjutnya
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {nextModule.id}
          </span>
        </div>

        <div>
          <h3 className="font-black text-sm text-slate-900 leading-snug line-clamp-2">
            {nextModule.title}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
            {nextModule.objective || "Materi interaktif tata bahasa, kosakata, dan speaking."}
          </p>
        </div>

        <Link
          href={`/modules/${nextModule.id}`}
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="w-full py-3 px-4 rounded-xl btn-skeuo-navy text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 min-h-[46px] touch-manipulation active:scale-95 transition-all"
        >
          <span>Lanjut Belajar</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* 4. Live Speaking Lab Mini Callout */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-[#F4B41A]/40 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#F4B41A] text-[#0F172A] flex items-center justify-center shrink-0 shadow-2xs">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">
              Latihan Speaking Bebas
            </p>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Ngobrol 5 menit bareng Mr. Khoirul
            </p>
          </div>
        </div>
        <Link
          href="/call"
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="py-2 px-3.5 rounded-xl btn-skeuo-yellow text-[11px] font-bold shadow-2xs shrink-0 min-h-[38px] flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Call AI</span>
        </Link>
      </div>

      {/* 5. Compact Recent Activity Feed */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Aktivitas Terakhir
          </h3>
          <Link
            href="/modules"
            className="text-[11px] font-bold text-[#0D3B66] hover:underline"
          >
            Lihat Modul
          </Link>
        </div>

        {displayActivities.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center space-y-2 shadow-2xs">
            <p className="text-xs font-bold text-slate-700">
              Belum ada riwayat aktivitas
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Mulai modul pertamamu atau latihan percakapan bersama Mr. Khoirul.
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
                  className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 active:scale-98 transition-all group min-h-[50px] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-[#0D3B66]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-900 group-hover:text-[#0D3B66] transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.scoreText && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                        {item.scoreText}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D3B66] transition-colors" />
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
