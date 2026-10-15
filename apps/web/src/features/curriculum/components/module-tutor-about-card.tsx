"use client";

import React from "react";
import { PhoneCall, CheckCircle2, Target } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface ModuleTutorCallBarProps {
  onStartCall: () => void;
  isCalling?: boolean;
}

export function ModuleTutorCallBar({ onStartCall, isCalling }: ModuleTutorCallBarProps) {
  return (
    <div className="card-skeuo bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Avatar with Status Ring */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-[#0D3B66] border border-[#082542] p-0.5 shadow-xs">
            <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-[#0D3B66] dark:text-[#F4B41A] text-xs">
              MK
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#F4B41A] border-2 border-white dark:border-slate-900" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              Mr. Khoirul
            </h4>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-slate-800 dark:text-[#F4B41A] font-mono">
              AI Tutor
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal Spoken English Coach • Spoken Reflexes Specialist
          </p>
        </div>
      </div>

      {/* Start Call Action */}
      <button
        type="button"
        onClick={(e) => {
          animeButtonPop(e.currentTarget);
          onStartCall();
        }}
        className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
          isCalling
            ? "btn-skeuo-red animate-pulse"
            : "btn-skeuo-navy"
        }`}
      >
        <PhoneCall className="w-3.5 h-3.5" />
        <span>{isCalling ? "Call Active..." : "Voice Practice Call"}</span>
      </button>
    </div>
  );
}

interface ModuleAboutCardProps {
  moduleTitle?: string;
  cefr?: string;
  summary?: string;
  objective?: string;
}

export function ModuleAboutCard({
  moduleTitle,
  cefr = "A1.1",
  summary,
  objective,
}: ModuleAboutCardProps) {
  const canDoDescriptors = [
    "State your name, age, and country of origin naturally in English.",
    "Form affirmative and negative sentences using the present tense of verb 'to be'.",
    "Apply spoken contractions (I'm, He's, She's, We're, They're) with correct syllable reduction.",
    "Ask others where they are from ('Where are you from?' • 'I am from Spain').",
  ];

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h4 className="font-black text-base text-slate-900 dark:text-white">
          About This Module
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
          {summary ||
            "Learn essential foundational vocabulary for countries and nationalities, and understand how to use the verb 'to be' to describe people's origins in conversational English."}
        </p>
      </div>

      {/* Objective Box */}
      {objective && (
        <div className="card-skeuo p-4 rounded-2xl bg-[#0D3B66]/5 dark:bg-slate-800/40 border border-[#0D3B66]/20 text-xs sm:text-sm text-[#0D3B66] dark:text-slate-200 flex items-start gap-3">
          <Target className="w-4 h-4 text-[#F4B41A] shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold uppercase text-[10px] tracking-wider block text-[#0D3B66] dark:text-[#F4B41A] mb-0.5">
              Target Communicative Outcome
            </span>
            <p>{objective}</p>
          </div>
        </div>
      )}

      {/* Can-Do Descriptors List */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
          CEFR {cefr} Core Competencies Covered:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {canDoDescriptors.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 border-b-2 border-b-slate-300 dark:border-b-slate-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const ModuleTutorAboutCard = ModuleTutorCallBar;

