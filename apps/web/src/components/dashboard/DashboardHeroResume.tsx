"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { animeCardHover, animeButtonPop } from "@/lib/anime-effects";

export interface DashboardHeroResumeProps {
  studentName: string;
  studentEmail: string;
  currentCefr: string;
  placementScore?: number | null;
  totalCompletedModules: number;
  totalModules: number;
}

export function DashboardHeroResume({
  studentName,
  studentEmail,
  currentCefr,
  placementScore,
  totalCompletedModules,
  totalModules,
}: DashboardHeroResumeProps) {
  const cefrCardRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg border border-blue-900/30">
      <div className="space-y-2">
        <Badge
          variant="secondary"
          className="gap-2 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Student English Passport</span>
        </Badge>
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
      <Card
        ref={cefrCardRef}
        onMouseEnter={() => cefrCardRef.current && animeCardHover(cefrCardRef.current, true)}
        onMouseLeave={() => cefrCardRef.current && animeCardHover(cefrCardRef.current, false)}
        className="bg-white/10 border-white/15 backdrop-blur-md rounded-2xl p-5 text-center min-w-[170px] shrink-0 text-white"
      >
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
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="text-[11px] text-blue-300 hover:text-white underline mt-2 block font-medium transition-colors"
        >
          Ulangi Tes Penempatan
        </Link>
      </Card>
    </div>
  );
}
