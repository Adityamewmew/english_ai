"use client";

import React from "react";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

interface OnboardingStepBriefingProps {
  onStartPlacement: () => void;
  onSkipBeginner: () => void;
  isSubmitting: boolean;
  isSkipping: boolean;
}

const SECTIONS = [
  {
    icon: BookOpen,
    title: "Reading Comprehension",
    desc: "Memahami struktur teks, tata bahasa, dan kosakata kontekstual.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Headphones,
    title: "Listening Reflex",
    desc: "Mendengarkan percakapan audio dan menjawab pertanyaan pemahaman.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: PenTool,
    title: "Writing Expression",
    desc: "Menulis respon singkat atau paragraf bahasa Inggris yang padu.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Mic,
    title: "Speaking Accuracy",
    desc: "Merekam jawaban lisan untuk mengevaluasi kelancaran dan pengucapan.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export function OnboardingStepBriefing({
  onStartPlacement,
  onSkipBeginner,
  isSubmitting,
  isSkipping,
}: OnboardingStepBriefingProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Panduan Placement Test CEFR
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Tes diagnostik ini akan menentukan level awal bahasa Inggris Anda (A1 hingga C1) secara objektif.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5 shadow-2xs"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sec.bg} ${sec.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {sec.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {sec.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info & Advice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Durasi: ±15–20 Menit · 22 Pertanyaan Terarah</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Tips Kejujuran:</strong> Kerjakan sendiri tanpa membuka Google Translate atau kamus online. Jangan khawatir jika ada soal yang terasa sulit—sistem adaptif kami hanya mencari titik mula materi yang paling tepat untuk Anda.
          </p>
        </div>
      </div>

      {/* Action Decision Area */}
      <div className="pt-2 space-y-4">
        {/* Primary CTA */}
        <button
          type="button"
          disabled={isSubmitting || isSkipping}
          onClick={onStartPlacement}
          className="w-full py-4 px-6 rounded-2xl btn-skeuo-yellow font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-[0.98] min-h-[52px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menyiapkan Ujian...</span>
            </>
          ) : (
            <>
              <span>Mulai Placement Test Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Secondary Alternative for Absolute Beginners */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Merasa baru pertama kali belajar bahasa Inggris dari nol?
          </p>
          <button
            type="button"
            disabled={isSubmitting || isSkipping}
            onClick={onSkipBeginner}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white underline underline-offset-4 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isSkipping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyiapkan Modul Dasar...</span>
              </>
            ) : (
              <span>Saya Pemula Total (Lewati Tes & Mulai dari Level A1.1)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

