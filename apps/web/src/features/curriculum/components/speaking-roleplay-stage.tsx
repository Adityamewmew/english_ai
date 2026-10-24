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
  const roleplayData = practiceSec?.content?.roleplay || {};
  const firstTurn = roleplayData?.turns?.[0];

  const step4Question: PracticumQuestion = {
    id: 4001,
    category: "roleplay",
    typeLabel: roleplayData.context || "Guided Roleplay: Practice with Mr. Khoirul",
    scenarioContext: roleplayData.context || "English Classroom Practice with Mr. Khoirul",
    characterRole: roleplayData.roles?.[0] || "Personal English Tutor",
    initialGreeting:
      firstTurn?.text ||
      firstTurn?.audioPrompt ||
      "Hello! Welcome to our English class. How are you today?",
    instruction:
      "Have a friendly voice conversation with Mr. Khoirul. Listen to his greeting, then tap the button to respond naturally!",
    callTopic: roleplayData.context || "Interactive Spoken Conversation",
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
          Voice Call Simulation with Mr. Khoirul
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {roleplayData.context ||
            "Practice natural English conversation aloud through an interactive voice call with Mr. Khoirul."}
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
              <span>Redial Call</span>
            </button>

            {onNextStep && (
              <button
                type="button"
                onClick={onNextStep}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Continue to Step 5 (Speaking Practicum)</span>
                <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
              </button>
            )}
          </div>
        )}

        {/* Fallback Skip Call if mic not available */}
        {!isCompleted && onNextStep && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onNextStep}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1 px-2"
            >
              Skip Voice Call &amp; Continue &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
