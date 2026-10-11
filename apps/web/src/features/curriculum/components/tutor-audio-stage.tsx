"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Sparkles, MessageSquare } from "lucide-react";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";
import { playPopSound } from "@/lib/sound-fx";

interface TutorAudioStageProps {
  tutorName?: string;
  avatarUrl?: string;
  instructionText: string;
  encouragementText?: string;
  skillLabel: string;
  autoPlay?: boolean;
}

export function TutorAudioStage({
  tutorName = "Mr. Khoirul",
  avatarUrl = "/illustrations/tutor-khoirul.png",
  instructionText,
  encouragementText,
  skillLabel,
  autoPlay = false,
}: TutorAudioStageProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (autoPlay && !isMuted) {
      handlePlayVoice();
    }
    return () => {
      stopTutorSpeech();
    };
  }, [instructionText]);

  const handlePlayVoice = () => {
    if (isSpeaking) {
      stopTutorSpeech();
      setIsSpeaking(false);
      return;
    }

    playPopSound();
    setIsSpeaking(true);
    speakTutorText(instructionText, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleToggleMute = () => {
    if (isSpeaking) {
      stopTutorSpeech();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Tutor Character Avatar + Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm overflow-hidden border-2 transition-all ${
              isSpeaking ? "border-blue-500 scale-105 shadow-blue-500/20 shadow-md" : "border-slate-100 dark:border-slate-700"
            }`}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={tutorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : null}
              <span>MK</span>
            </div>
            {/* Live Indicator Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {tutorName}
              </h4>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900">
                AI Coach
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {skillLabel}
            </p>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 w-full p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 relative">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            &ldquo;{instructionText}&rdquo;
          </p>

          {encouragementText && (
            <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {encouragementText}
            </p>
          )}

          {/* Action Row inside Bubble */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePlayVoice}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                isSpeaking
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-3 h-3 fill-current" />
                  <span>Jeda Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Dengar Penjelasan Mr. Khoirul</span>
                </>
              )}
            </button>

            {isSpeaking && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-blue-400">
                <span className="w-1 h-2.5 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-1 h-3.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="ml-1 text-[10px]">Menjelaskan...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
