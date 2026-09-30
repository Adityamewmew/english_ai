"use client";

import React, { useState, useRef } from "react";
import { Volume2, Sparkles, Square, CheckCircle2, BookOpen } from "lucide-react";

export interface DashboardWeakWordsWidgetProps {
  words: string[];
}

export function DashboardWeakWordsWidget({ words }: DashboardWeakWordsWidgetProps) {
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayWordAudio = (word: string) => {
    if (typeof window === "undefined") return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingWord === word) {
      setPlayingWord(null);
      return;
    }

    setPlayingWord(word);

    const clean = word.toLowerCase().trim();
    const audio = new Audio(`/api/voice/tts?text=${encodeURIComponent(clean)}`);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingWord(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      // Fallback ke browser speech synthesis jika offline/gagal
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(clean);
        utt.lang = "en-US";
        utt.rate = 0.9;
        utt.onend = () => setPlayingWord(null);
        utt.onerror = () => setPlayingWord(null);
        window.speechSynthesis.speak(utt);
      } else {
        setPlayingWord(null);
      }
    };

    audio.play().catch(() => {
      setPlayingWord(null);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Long-Term Memory</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Kosakata & Pelafalan yang Perlu Dilatih
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kata-kata ini dicatat otomatis oleh Mr. Khoirul saat evaluasi Speaking Lab.
          </p>
        </div>

        {words.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40 self-start sm:self-center">
            {words.length} Kata Dicatat
          </span>
        )}
      </div>

      {/* Word Chips List */}
      {words.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            Belum Ada Catatan Kelemahan Kata
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Luar biasa! Otot mulut dan pelafalanmu berjalan mulus. Terus berlatih di Speaking Lab modul untuk memperkuat kelancaran bicaramu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {words.map((w, idx) => {
              const isPlaying = playingWord === w;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePlayWordAudio(w)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                    isPlaying
                      ? "bg-amber-500 text-white shadow-amber-500/20 scale-105"
                      : "bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100"
                  }`}
                  title="Klik untuk mendengarkan pengucapan yang benar"
                >
                  <span>{w}</span>
                  {isPlaying ? (
                    <Square className="w-3 h-3 fill-current animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
            Tips: Klik speaker pada kata untuk mendengarkan aksen dan artikulasi bibir yang tepat sebelum mencoba kembali di modul latihan.
          </p>
        </div>
      )}
    </div>
  );
}
