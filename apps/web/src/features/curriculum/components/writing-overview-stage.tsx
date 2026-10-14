"use client";

import React from "react";
import { BookOpen, Volume2, ArrowRight, PenLine, Check } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound } from "@/lib/sound-fx";

interface WritingOverviewStageProps {
  theorySec?: any;
  tutor: any;
  onGoToNext: () => void;
}

export function WritingOverviewStage({
  theorySec,
  tutor,
  onGoToNext,
}: WritingOverviewStageProps) {
  const content = theorySec?.content || {};
  const blueprintItems: Array<{
    part: string;
    role: string;
    examples: string[];
    color: string;
    tagColor: string;
  }> = content.blueprintItems || [];

  const mechanicsRules: Array<{
    title: string;
    rule: string;
    example: string;
  }> = content.mechanicsRules || [];

  const sampleSentences: Array<{
    text: string;
    audio: string;
  }> = content.sampleSentences || [];

  const summary = content.summary || "Dalam modul ini, kamu akan mempelajari cara membangun kalimat bahasa Inggris yang utuh dan akurat.";

  const handlePlayAudio = (text: string, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    tutor?.playTutorAudio?.(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Mission Briefing Banner */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A]">
          <BookOpen className="w-4 h-4" />
          <span className="uppercase tracking-wider font-mono">
            Tujuan Belajar Menulis
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* 2. Visual Blueprint Formula */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Formula Baku Konstruksi Kalimat
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Setiap kalimat afirmatif bahasa Inggris dibangun dengan tiga komponen utama berikut:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {blueprintItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${item.color} space-y-2.5 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase tracking-wider">
                  {item.part}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/60">
                  Langkah {idx + 1}
                </span>
              </div>
              <p className="text-xs font-semibold">{item.role}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.examples.map((ex, exIdx) => (
                  <span
                    key={exIdx}
                    className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${item.tagColor}`}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mechanics Core Rules */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Aturan Mekanika &amp; Tata Tulis
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perhatikan mekanika ini karena akan diuji langsung pada latihan mengetik di langkah berikutnya:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mechanicsRules.map((r, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs"
            >
              <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] block">
                {r.title}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {r.rule}
              </p>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Contoh: <span className="font-semibold text-slate-800 dark:text-slate-200">{r.example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Audio Sentence Examples */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Contoh Kalimat Siap Pakai
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dengarkan pelafalan kalimat model sebelum mulai latihan menulis:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleSentences.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs"
            >
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                &ldquo;{s.text}&rdquo;
              </span>
              <button
                type="button"
                onClick={(e) => handlePlayAudio(s.audio, e)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0D3B66] dark:text-[#F4B41A] transition-colors cursor-pointer shrink-0"
                title="Dengarkan pengucapan"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Direct Action CTA */}
      <div className="pt-3 flex justify-end">
        <button
          type="button"
          onClick={onGoToNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <PenLine className="w-4 h-4" />
          <span>Mulai Latihan Menulis (Langkah 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
