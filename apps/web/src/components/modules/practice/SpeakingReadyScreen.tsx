"use client";

import React from "react";
import { Mic, Volume2, Sparkles, MessageSquare, ArrowRight, ShieldCheck, Headphones } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeButtonPop, animeCardHover } from "@/lib/anime-effects";

interface SpeakingReadyScreenProps {
  moduleTitle: string;
  hasDrills?: boolean;
  onStart: () => void;
}

export function SpeakingReadyScreen({
  moduleTitle,
  hasDrills = true,
  onStart,
}: SpeakingReadyScreenProps) {
  return (
    <Card className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-violet-50/70 via-indigo-50/40 to-white dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-violet-200/80 dark:border-violet-900/50 shadow-sm space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span>Persiapan Praktikum Berbicara</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Selamat Datang di Speaking Lab!
        </h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Saatnya mengubah teori pada modul <strong>&ldquo;{moduleTitle}&rdquo;</strong> menjadi kelancaran berbicara nyata.
        </p>
      </div>

      {/* 3 Tahap Alur Latihan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-violet-100 dark:border-violet-900/50 shadow-xs space-y-3 will-change-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Drill Artikulasi
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Tirukan pola kalimat inti dan peroleh penilaian akurasi kata per kata secara instan.
          </p>
        </div>

        <div
          onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-indigo-100 dark:border-indigo-900/50 shadow-xs space-y-3 will-change-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Simulasi Peran
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Berinteraksi langsung dalam percakapan dua arah bersama Mr. Khoirul (Guru AI).
          </p>
        </div>

        <div
          onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
          onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-3 will-change-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            Tantangan Spontan
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Jawab situasi spontan tanpa teks bantuan untuk menguji reflek berbicara natural.
          </p>
        </div>
      </div>

      {/* Mic Checklist Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-violet-100/60 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white block">
              Izin Akses Mikrofon Browser
            </span>
            <span>Pastikan kamu mengizinkan mikrofon saat browser memunculkan permintaan akses.</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privasi Aman</span>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onStart();
          }}
          className="gap-2.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold shadow-md px-6 py-3 min-h-[48px] rounded-xl"
        >
          <span>Saya Siap, Mulai Latihan!</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
