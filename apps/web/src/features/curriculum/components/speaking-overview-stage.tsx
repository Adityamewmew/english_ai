"use client";

import React, { useState } from "react";
import { Volume2, TrendingUp, Music2, Mic } from "lucide-react";
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
}: SpeakingOverviewStageProps) {
  const content = theorySec?.content || {};
  const [activeAudioPillar, setActiveAudioPillar] = useState<string | null>(null);

  // Normalize pillars with robust unique keys and field mapping
  const pillars: PillarItem[] = (content.pillars || []).map((p: any, idx: number) => ({
    id: p.id || `pillar-${idx + 1}`,
    title: p.title || p.name || `Pillar 0${idx + 1}`,
    desc: p.desc || p.explanation || p.description || "",
    example: p.example || p.target || "",
  }));

  const handlePlayPillarAudio = (pillar: PillarItem) => {
    playPopSound();
    setActiveAudioPillar(pillar.id);

    // Speak dynamic example or target from pillar data, no hardcoded unit 1 text
    const audioText = pillar.example || pillar.title || "Practice speaking clearly and naturally.";

    tutor?.playTutorAudio?.(audioText);
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
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Core Pillars of Pronunciation &amp; Spoken Intonation
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master these key principles before starting syllable rhythm drills and spoken roleplay with Mr. Khoirul:
            </p>
          </div>
        </div>

        {/* 3. Core Pillars (Clean Informational Cards without checkboxes) */}
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
                      Pillar 0{idx + 1}
                    </span>
                    {idx === 0 ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Pitch</span>
                      </div>
                    ) : idx === 1 ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        <Music2 className="w-3.5 h-3.5" />
                        <span>Stress</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        <Mic className="w-3.5 h-3.5" />
                        <span>Vowel</span>
                      </div>
                    )}
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h5>
                  {item.desc && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  )}
                </div>

                {item.example && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 block font-semibold truncate">
                      Target: {item.example}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePlayPillarAudio(item)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 ${
                          isPlaying ? "text-amber-500 animate-pulse" : "text-slate-400"
                        }`}
                      />
                      <span>{isPlaying ? "Playing Sample..." : "Listen to Audio Sample"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
