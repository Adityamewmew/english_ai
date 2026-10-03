"use client";

import React, { useRef, useEffect } from "react";
import { Volume2, Sparkles, HelpCircle } from "lucide-react";
import { animeCharacterState, animeButtonPop } from "@/lib/anime-effects";

export type CharacterState = "idle" | "walking" | "speaking" | "happy" | "puzzled";
export type CharacterPersona = "teacher" | "student" | "student_female";

interface AnimatedCharacterProps {
  persona?: CharacterPersona;
  state?: CharacterState;
  message?: string;
  subMessage?: string;
  onSpeechClick?: () => void;
  className?: string;
}

export function AnimatedCharacter({
  persona = "teacher",
  state = "idle",
  message,
  subMessage,
  onSpeechClick,
  className = "",
}: AnimatedCharacterProps) {
  const isTeacher = persona === "teacher";
  const isFemale = persona === "student_female";
  const charRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Trigger Anime.js physics whenever character state changes
  useEffect(() => {
    if (charRef.current) {
      animeCharacterState(charRef.current, state);
    }
  }, [state]);

  // Subtle pop on message update
  useEffect(() => {
    if (bubbleRef.current && message) {
      animeButtonPop(bubbleRef.current);
    }
  }, [message]);

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      {/* Character Visual Stage */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Subtle shadow ground beneath feet */}
        <div className="absolute -bottom-1 w-20 h-4 bg-slate-300/60 dark:bg-slate-800/80 rounded-full blur-[2px] transition-all" />

        {/* Character SVG Container with Anime.js Target Ref */}
        <div
          ref={charRef}
          className="relative w-28 h-32 select-none will-change-transform"
        >
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-sm">
            {/* Background Aura */}
            <circle
              cx="60"
              cy="65"
              r="46"
              className={
                state === "happy"
                  ? "fill-emerald-100/60 dark:fill-emerald-950/40"
                  : state === "puzzled"
                  ? "fill-amber-100/60 dark:fill-amber-950/40"
                  : "fill-blue-100/50 dark:fill-blue-950/30"
              }
            />

            {/* Body / Clothes */}
            {isTeacher ? (
              // Teacher: Navy Blazer & White Collar with tie
              <g>
                <path
                  d="M 36 90 Q 60 82 84 90 L 88 128 Q 60 134 32 128 Z"
                  className="fill-indigo-700 dark:fill-indigo-600"
                />
                {/* White Shirt Triangle */}
                <polygon points="52,86 68,86 60,110" className="fill-white" />
                {/* Orange Tie */}
                <polygon points="58,92 62,92 64,115 60,122 56,115" className="fill-amber-500" />
                {/* Blazer lapels */}
                <path d="M 40 89 L 52 114 L 38 126" stroke="#312E81" strokeWidth="2" fill="none" />
                <path d="M 80 89 L 68 114 L 82 126" stroke="#312E81" strokeWidth="2" fill="none" />
              </g>
            ) : isFemale ? (
              // Student Female: Emerald Hoodie
              <g>
                <path
                  d="M 35 90 Q 60 84 85 90 L 87 128 Q 60 132 33 128 Z"
                  className="fill-emerald-600 dark:fill-emerald-500"
                />
                <circle cx="60" cy="100" r="4" className="fill-white/80" />
              </g>
            ) : (
              // Student Male: Sky Blue T-shirt
              <g>
                <path
                  d="M 35 90 Q 60 84 85 90 L 87 128 Q 60 132 33 128 Z"
                  className="fill-blue-600 dark:fill-blue-500"
                />
                <circle cx="60" cy="98" r="3" className="fill-amber-300" />
              </g>
            )}

            {/* Neck */}
            <rect x="54" y="74" width="12" height="15" rx="3" className="fill-amber-200" />

            {/* Head */}
            <circle cx="60" cy="56" r="24" className="fill-amber-100 dark:fill-amber-200" />

            {/* Hair */}
            {isTeacher ? (
              // Neat Teacher Hair
              <path
                d="M 36 50 C 36 32, 84 32, 84 50 C 80 38, 40 38, 36 50 Z"
                className="fill-slate-800 dark:fill-slate-900"
              />
            ) : isFemale ? (
              // Student Ponytail / Long Hair
              <g>
                <path
                  d="M 34 56 C 34 28, 86 28, 86 56 C 88 75, 78 72, 78 60 C 70 36, 46 36, 42 60 Z"
                  className="fill-amber-900 dark:fill-amber-950"
                />
                {/* Hair bow */}
                <circle cx="82" cy="40" r="5" className="fill-pink-500" />
              </g>
            ) : (
              // Modern Messy Hair
              <path
                d="M 36 52 C 34 32, 86 30, 84 52 C 78 40, 42 40, 36 52 Z"
                className="fill-amber-950 dark:fill-stone-900"
              />
            )}

            {/* Eyes */}
            {state === "happy" ? (
              // Happy Arc Eyes (^^)
              <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 48 54 Q 53 48 58 54" />
                <path d="M 62 54 Q 67 48 72 54" />
              </g>
            ) : state === "puzzled" ? (
              // Puzzled Eyes (one wide, one squinting)
              <g>
                <circle cx="52" cy="54" r="3.5" className="fill-slate-900" />
                <line x1="63" y1="55" x2="71" y2="53" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            ) : (
              // Normal Friendly Eyes with Sparkle
              <g>
                <circle cx="52" cy="54" r="3.5" className="fill-slate-900" />
                <circle cx="53" cy="53" r="1.2" className="fill-white" />
                <circle cx="68" cy="54" r="3.5" className="fill-slate-900" />
                <circle cx="69" cy="53" r="1.2" className="fill-white" />
              </g>
            )}

            {/* Glasses for Teacher */}
            {isTeacher && (
              <g stroke="#1E293B" strokeWidth="2" fill="none">
                <rect x="46" y="48" width="13" height="11" rx="2" className="fill-blue-50/20" />
                <rect x="61" y="48" width="13" height="11" rx="2" className="fill-blue-50/20" />
                <line x1="59" y1="53" x2="61" y2="53" />
              </g>
            )}

            {/* Smile / Mouth */}
            {state === "speaking" ? (
              // Open animated mouth
              <ellipse cx="60" cy="67" rx="5" ry="4" className="fill-rose-700 animate-pulse" />
            ) : state === "puzzled" ? (
              // Wavy mouth
              <path d="M 54 67 Q 60 63 66 67" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              // Warm Smile
              <path d="M 53 66 Q 60 72 67 66" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}

            {/* Cheeks */}
            <circle cx="45" cy="62" r="3.5" className="fill-rose-300/70" />
            <circle cx="75" cy="62" r="3.5" className="fill-rose-300/70" />

            {/* Floating Status Icon Badge */}
            {state === "happy" && (
              <g transform="translate(85, 20)">
                <circle cx="10" cy="10" r="10" className="fill-amber-400" />
                <path d="M 10 4 L 12 8 L 16 9 L 13 12 L 14 16 L 10 14 L 6 16 L 7 12 L 4 9 L 8 8 Z" className="fill-white" />
              </g>
            )}
            {state === "puzzled" && (
              <g transform="translate(85, 20)">
                <circle cx="10" cy="10" r="10" className="fill-amber-500" />
                <text x="10" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">?</text>
              </g>
            )}
          </svg>
        </div>

        {/* Persona Tag */}
        <span className="absolute -bottom-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs uppercase tracking-wider">
          {isTeacher ? "Mr. Khoirul" : isFemale ? "Maya" : "Budi"}
        </span>
      </div>

      {/* Interactive Speech Bubble */}
      {message && (
        <div
          ref={bubbleRef}
          onClick={onSpeechClick}
          className={`relative flex-1 p-4 rounded-2xl border transition-all ${
            onSpeechClick ? "cursor-pointer hover:border-blue-400 hover:shadow-md" : ""
          } ${
            state === "happy"
              ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
              : state === "puzzled"
              ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
          }`}
        >
          {/* Triangular Tail pointing to Avatar */}
          <div className="hidden sm:block absolute -left-2 top-7 w-3 h-3 bg-inherit border-l border-b border-inherit -rotate-45" />

          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {message}
              </p>
              {subMessage && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  {subMessage}
                </p>
              )}
            </div>

            {onSpeechClick && (
              <button
                type="button"
                className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 hover:bg-blue-200 shrink-0 transition-colors"
                title="Dengarkan suara"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
