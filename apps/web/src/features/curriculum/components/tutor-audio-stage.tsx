"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";
import { playPopSound } from "@/lib/sound-fx";

interface TutorAudioStageProps {
  instructionText: string;
  encouragementText?: string;
  skillLabel?: string;
  autoPlay?: boolean;
}

export function TutorAudioStage({
  instructionText,
  encouragementText,
  autoPlay = false,
}: TutorAudioStageProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (autoPlay) {
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
      pitch: 0.95,
      rate: 0.95,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="w-full p-4 sm:p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
      {/* Header Row: Title & Audio Trigger Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0D3B66] text-[#F4B41A] flex items-center justify-center shrink-0 border-b-2 border-[#082542] shadow-2xs">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#0D3B66] dark:text-white uppercase tracking-tight">
              Panduan Sesi
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Dengarkan pengantar materi sebelum mulai latihan
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlayVoice}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 border-b-2 ${
            isSpeaking
              ? "btn-skeuo-navy text-white"
              : "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 border-b-2 border-slate-300 dark:border-slate-600"
          }`}
        >
          {isSpeaking ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Jeda Audio</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-[#0D3B66]" />
              <span>Putar Penjelasan</span>
            </>
          )}
        </button>
      </div>

      {/* Instruction Content */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        <p>&ldquo;{instructionText}&rdquo;</p>
        {encouragementText && (
          <p className="mt-2 text-xs text-[#0D3B66] dark:text-[#F4B41A] font-bold">
            {encouragementText}
          </p>
        )}
      </div>
    </div>
  );
}
