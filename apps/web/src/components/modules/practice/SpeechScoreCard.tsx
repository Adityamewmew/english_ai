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
      className="p-5 space-y-4 shadow-sm border-slate-200 dark:border-slate-800 will-change-transform"
    >
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
            <span ref={scoreRef}>{score}%</span>
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

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onRetry();
          }}
          className="gap-1.5 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Coba Lagi</span>
        </Button>
      </div>

      {/* Side-by-Side Audio Comparison Bar */}
      {(studentAudioUrl || targetText) && (
        <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block w-full sm:w-auto mr-1">
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
              className="gap-1.5 text-xs font-semibold"
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
              className="gap-1.5 text-xs font-semibold bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Dengar Pelafalan Native</span>
            </Button>
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
                <Badge
                  key={idx}
                  variant="success"
                  className="px-2.5 py-1 text-xs font-semibold"
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
                  className="px-2.5 py-1 text-xs font-semibold"
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
                className="px-2.5 py-1 text-xs font-semibold line-through"
                title="Tidak terdeteksi"
              >
                {item.word}
              </Badge>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onPlayTipAudio(tip);
                }}
                className="h-auto p-0 gap-1 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dengar Audio</span>
              </Button>
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
    </Card>
  );
}
