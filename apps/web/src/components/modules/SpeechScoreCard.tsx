"use client";

import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  RotateCcw,
  Square,
} from "lucide-react";
import { EvaluatedWord } from "@/lib/speech-diff";

export interface SpeechScoreCardProps {
  score: number;
  passed: boolean;
  statusText: string;
  words: EvaluatedWord[];
  spokenText: string;
  targetText?: string;
  studentAudioUrl?: string | null;
  isPlayingStudentAudio?: boolean;
  tip?: string;
  isLoadingTip?: boolean;
  onRetry: () => void;
  onPlayStudentAudio?: (url: string) => void;
  onStopStudentAudio?: () => void;
  onPlayNativeAudio?: (text: string) => void;
  onPlayTipAudio?: (text: string) => void;
}

export function SpeechScoreCard({
  score,
  passed,
  statusText,
  words,
  spokenText,
  targetText,
  studentAudioUrl,
  isPlayingStudentAudio = false,
  tip,
  isLoadingTip = false,
  onRetry,
  onPlayStudentAudio,
  onStopStudentAudio,
  onPlayNativeAudio,
  onPlayTipAudio,
}: SpeechScoreCardProps) {
  const isHigh = score >= 85;
  const isMid = score >= 70 && score < 85;

  return (
    <div className="rounded-2xl border p-5 space-y-4 transition-all duration-300 shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      {/* Top Header: Score & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base shadow-sm ${
              isHigh
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : isMid
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            }`}
          >
            {score}%
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              {passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {statusText}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Akurasi artikulasi pengucapan kalimat
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Coba Lagi</span>
        </button>
      </div>

      {/* Side-by-Side Audio Comparison Bar */}
      {(studentAudioUrl || targetText) && (
        <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block w-full sm:w-auto mr-1">
            Bandingkan Suara:
          </span>

          {studentAudioUrl && onPlayStudentAudio && (
            <button
              type="button"
              onClick={() =>
                isPlayingStudentAudio && onStopStudentAudio
                  ? onStopStudentAudio()
                  : onPlayStudentAudio(studentAudioUrl)
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                isPlayingStudentAudio
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
              }`}
            >
              {isPlayingStudentAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Suara Saya</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Dengar Suara Saya</span>
                </>
              )}
            </button>
          )}

          {targetText && onPlayNativeAudio && (
            <button
              type="button"
              onClick={() => onPlayNativeAudio(targetText)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Dengar Pelafalan Native</span>
            </button>
          )}
        </div>
      )}

      {/* Word-by-Word Colored Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Analisis Kata Target
        </span>
        <div className="flex flex-wrap gap-1.5">
          {words.map((item, idx) => {
            if (item.status === "matched") {
              return (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                  title="Tepat"
                >
                  {item.word}
                </span>
              );
            }
            if (item.status === "similar") {
              return (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                  title={`Kurang jelas (terdengar: "${item.spokenWord}")`}
                >
                  {item.word}
                </span>
              );
            }
            return (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 line-through"
                title="Tidak terdeteksi"
              >
                {item.word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Spoken Transcript Preview */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-1">
          Suara Terdeteksi:
        </span>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 italic">
          &ldquo;{spokenText || "-"}&rdquo;
        </p>
      </div>

      {/* Mr. Khoirul Pronunciation Tip Box */}
      {(isLoadingTip || tip) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tips Pelafalan Mr. Khoirul</span>
            </div>

            {tip && onPlayTipAudio && (
              <button
                type="button"
                onClick={() => onPlayTipAudio(tip)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dengar Audio</span>
              </button>
            )}
          </div>

          {isLoadingTip ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Mr. Khoirul sedang menyiapkan evaluasi cara baca...</span>
            </div>
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
