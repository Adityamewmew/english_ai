"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { playPopSound, playMatchSuccessSound } from "@/lib/sound-fx";
import { PracticumRoleplayCall } from "./practicum-roleplay-call";
import type { PracticumQuestion } from "./speaking-practicum-stage";

interface SpeakingRoleplayStageProps {
  practiceSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onNextStep?: () => void;
}

export function SpeakingRoleplayStage({
  practiceSec,
  tutor,
  onRewardXp,
  onNextStep,
}: SpeakingRoleplayStageProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(100);

  // Guided roleplay question for Step 4
  const step4Question: PracticumQuestion = {
    id: 4001,
    category: "roleplay",
    typeLabel: "Guided Roleplay: Meeting Mr. Khoirul",
    scenarioContext: "Kelas Bahasa Inggris: Perkenalan Pertama dengan Mr. Khoirul",
    characterRole: "Tutor Bahasa Inggris Pribadi",
    initialGreeting:
      practiceSec?.content?.roleplay?.turns?.[0]?.audioPrompt ||
      "Hello! Welcome to our English class. I am Mr. Khoirul. What is your name?",
    instruction:
      "Lakukan panggilan suara 3 putaran ramah pemula dengan Mr. Khoirul. Dengarkan sapaannya, lalu tekan tombol untuk menjawab dengan santai!",
    callTopic: "Roleplay: First Meeting and Introduction with Mr. Khoirul",
  };

  const handleRoleplayComplete = (earnedScore: number) => {
    setIsCompleted(true);
    setScore(earnedScore);
    playMatchSuccessSound();
    onRewardXp(35);
  };

  const handleReset = () => {
    playPopSound();
    setIsCompleted(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#1B4965] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
          Step 4 · Live AI Roleplay Call (Spoken Simulation)
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Simulasi Telepon Suara dengan Mr. Khoirul
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Praktikkan materi perkenalan diri dan asal negara secara lisan melalui panggilan suara nyata. Percakapan dibatasi 3 putaran ringkas agar fokus dan tidak bertele-tele.
        </p>
      </div>

      {/* Main Roleplay Call Card */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
        <PracticumRoleplayCall
          question={step4Question}
          isCompleted={isCompleted}
          savedScore={score}
          onComplete={handleRoleplayComplete}
        />

        {/* Action Button after Call Completion */}
        {isCompleted && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Telepon</span>
            </button>

            {onNextStep && (
              <button
                type="button"
                onClick={onNextStep}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Lanjut ke Step 5 (Praktikum Speaking)</span>
                <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
