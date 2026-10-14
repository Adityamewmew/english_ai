"use client";

import React, { useState } from "react";
import { Volume2, ArrowRight, TrendingUp, TrendingDown, Music2, Mic } from "lucide-react";
import { TutorAudioStage } from "./tutor-audio-stage";
import { playPopSound } from "@/lib/sound-fx";

interface PillarItem {
  id: string;
  title: string;
  desc: string;
  example: string;
}

interface SpeakingOverviewStageProps {
  theorySec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onNextStep?: () => void;
}

export function SpeakingOverviewStage({
  theorySec,
  tutor,
  onRewardXp,
  onNextStep,
}: SpeakingOverviewStageProps) {
  const content = theorySec?.content || {};
  const [activeAudioPillar, setActiveAudioPillar] = useState<string | null>(null);

  const pillars: PillarItem[] = content.pillars || [];

  const handlePlayPillarAudio = (pillar: PillarItem) => {
    playPopSound();
    setActiveAudioPillar(pillar.id);
    const audioText =
      pillar.id === "pillar-pitch"
        ? "Are you Japanese? Where are you from?"
        : pillar.id === "pillar-stress"
        ? "Canada. Canadian. Japan. Japanese."
        : "Hello! I am from Indonesia. Nice to meet you.";

    tutor.playTutorAudio(audioText);
    setTimeout(() => {
      setActiveAudioPillar(null);
      onRewardXp(5);
    }, 2800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Demia-style Audio Hero */}
      <TutorAudioStage
        instructionText={
          content.audioGuidance ||
          "Hello voice champion! Pronunciation is not just about words, it is about music and rhythm. Wh-questions glide downward, while confirmation questions lift upward. Let's build your vocal confidence step by step!"
        }
        encouragementText="Speak aloud with confidence and clear posture!"
        skillLabel="SPEAKING MISSION"
      />

      {/* 2. Overview Intro Card */}
      <div className="p-5 sm:p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0D3B66]/10 dark:bg-[#F4B41A]/20 text-[#0D3B66] dark:text-[#F4B41A] flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Pilar Utama Pelafalan & Intonasi Berbicara
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pahami 3 prinsip kunci ini sebelum mulai latihan ritme suku kata dan panggilan lisan bersama Mr. Khoirul:
            </p>
          </div>
        </div>

        {/* 3. 3 Core Pillars (Clean Informational Cards without checkboxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {pillars.map((item, idx) => {
            const isPlaying = activeAudioPillar === item.id;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Pilar 0{idx + 1}
                    </span>
                    {idx === 0 ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Pitch</span>
                      </div>
                    ) : idx === 1 ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A]">
                        <Music2 className="w-3.5 h-3.5" />
                        <span>Stress</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A]">
                        <Mic className="w-3.5 h-3.5" />
                        <span>Vowel</span>
                      </div>
                    )}
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <span className="text-[11px] font-mono text-[#0D3B66] dark:text-[#F4B41A] block font-semibold truncate">
                    Contoh: {item.example}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePlayPillarAudio(item)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-[#0D3B66] dark:hover:text-[#F4B41A] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "text-[#F4B41A] animate-pulse" : "text-slate-400"}`} />
                    <span>{isPlaying ? "Memutar Contoh..." : "Dengar Contoh Suara"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Action CTA */}
        {onNextStep && (
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={onNextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl btn-skeuo-navy text-white font-black text-sm tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Mulai Latihan Intonasi (Langkah 2)</span>
              <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
