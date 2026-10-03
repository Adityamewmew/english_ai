"use client";

import React, { useEffect, useRef } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  RotateCcw,
  Square,
} from "lucide-react";
import { EvaluatedWord } from "@/lib/speech-diff";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeCardHover, animeButtonPop, animeCountUp } from "@/lib/anime-effects";

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
  const scoreRef = useRef<HTMLSpanElement>(null);

  // Animated Count-Up for score
  useEffect(() => {
    if (scoreRef.current) {
      animeCountUp(scoreRef.current, 0, score, "", "%");
    }
  }, [score]);

  return (
    <Card
      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
      className="p-6 sm:p-7 space-y-5 rounded-2xl shadow-xs border-slate-200 dark:border-slate-800 will-change-transform"
    >
      {/* Top Header: Score & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-13 h-13 rounded-2xl flex items-center justify-center font-extrabold text-base sm:text-lg shadow-xs ${
              isHigh
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : isMid
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            }`}
          >
            <span ref={scoreRef}>{score}%</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              {passed ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              )}
              <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                {statusText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Akurasi artikulasi pengucapan kalimat
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onRetry();
          }}
          className="gap-1.5 text-xs font-semibold shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Coba Lagi</span>
        </Button>
      </div>

      {/* Side-by-Side Audio Comparison Bar */}
      {(studentAudioUrl || targetText) && (
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block w-full sm:w-auto mr-1">
            Bandingkan Suara:
          </span>

          {studentAudioUrl && onPlayStudentAudio && (
            <Button
              variant={isPlayingStudentAudio ? "destructive" : "secondary"}
              size="sm"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                isPlayingStudentAudio && onStopStudentAudio
                  ? onStopStudentAudio()
                  : onPlayStudentAudio(studentAudioUrl);
              }}
              className="gap-1.5 text-xs font-semibold shadow-xs"
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
            </Button>
          )}

          {targetText && onPlayNativeAudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onPlayNativeAudio(targetText);
              }}
              className="gap-1.5 text-xs font-semibold bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Dengar Pelafalan Native</span>
            </Button>
          )}
        </div>
      )}

      {/* Word-by-Word Colored Chips */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Analisis Kata Target
        </span>
        <div className="flex flex-wrap gap-2">
          {words.map((item, idx) => {
            if (item.status === "matched") {
              return (
                <Badge
                  key={idx}
                  variant="success"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg"
                  title="Tepat"
                >
                  {item.word}
                </Badge>
              );
            }
            if (item.status === "similar") {
              return (
                <Badge
                  key={idx}
                  variant="warning"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg"
                  title={`Kurang jelas (terdengar: "${item.spokenWord}")`}
                >
                  {item.word}
                </Badge>
              );
            }
            return (
              <Badge
                key={idx}
                variant="destructive"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg line-through"
                title="Tidak terdeteksi"
              >
                {item.word}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Spoken Transcript Preview */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mb-1">
          Suara Terdeteksi:
        </span>
        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 italic">
          &ldquo;{spokenText || "-"}&rdquo;
        </p>
      </div>

      {/* Mr. Khoirul Pronunciation Tip Box */}
      {(isLoadingTip || tip) && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tips Pelafalan Mr. Khoirul</span>
            </div>

            {tip && onPlayTipAudio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onPlayTipAudio(tip);
                }}
                className="h-auto p-0 gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dengar Audio</span>
              </Button>
            )}
          </div>

          {isLoadingTip ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 py-1">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Mr. Khoirul sedang menyiapkan evaluasi cara baca...</span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {tip}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
