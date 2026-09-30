"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneOff,
  RefreshCw,
  Award,
  Sparkles,
  Volume2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCallDuration } from "@/lib/call-utils";
import { ChatMessage } from "./CallTranscriptDrawer";

export interface CallEvaluationData {
  fluency?: number;
  lexical?: number;
  grammar?: number;
  pronunciation?: number;
  overallBand?: number;
  cefr?: string;
  feedback_id?: string;
  feedback_en?: string;
  student_facts?: string[];
}

export interface CallEvaluationModalProps {
  duration: number;
  evaluation?: CallEvaluationData | null;
  isLoading?: boolean;
  isShortCall?: boolean;
  conversationHistory?: ChatMessage[];
  onNewCall: () => void;
  onPlayAudio?: (text: string) => void;
}

export function CallEvaluationModal({
  duration,
  evaluation,
  isLoading = false,
  isShortCall = false,
  conversationHistory = [],
  onNewCall,
  onPlayAudio,
}: CallEvaluationModalProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 1. Loading State saat AI sedang menilai percakapan
  if (isLoading) {
    return (
      <div className="w-full max-w-md bg-zinc-950/95 border border-zinc-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl animate-fadeIn backdrop-blur-md">
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <Sparkles className="w-7 h-7 text-blue-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Menganalisis Percakapanmu...
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Mr. Khoirul sedang mengevaluasi kelancaran, tata bahasa, dan artikulasi pengucapan dari sesi ini.
          </p>
        </div>

        <div className="text-[11px] text-zinc-500 font-medium">
          Durasi Sesi: {formatCallDuration(duration)}
        </div>
      </div>
    );
  }

  // 2. Sesi Terlalu Singkat (< 15 detik atau belum berbicara)
  if (isShortCall || !evaluation) {
    return (
      <div className="w-full max-w-sm bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 space-y-6 text-center shadow-2xl animate-fadeIn backdrop-blur-md">
        <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <PhoneOff className="w-6 h-6 text-red-400" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white">Sesi Terlalu Singkat</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Percakapan berlangsung singkat (<span className="text-white font-semibold">{formatCallDuration(duration)}</span>). Lakukan obrolan minimal 1-2 putaran agar Mr. Khoirul dapat memberikan evaluasi speaking.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            onClick={onNewCall}
            className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold text-xs py-3 rounded-2xl shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Panggilan Baru
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full text-xs py-3 text-zinc-300 border-zinc-800 hover:bg-zinc-900 rounded-2xl"
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Full Scorecard View
  const overallBand = evaluation.overallBand || 5.0;
  const cefrGrade = evaluation.cefr || "A1";
  const metrics = [
    { label: "Fluency & Coherence", score: evaluation.fluency || 5.0 },
    { label: "Lexical Resource", score: evaluation.lexical || 5.0 },
    { label: "Grammar Range & Accuracy", score: evaluation.grammar || 5.0 },
    { label: "Pronunciation Clarity", score: evaluation.pronunciation || 5.0 },
  ];

  const handlePlayVoiceNote = () => {
    if (evaluation.feedback_id && onPlayAudio) {
      setIsPlayingAudio(true);
      onPlayAudio(evaluation.feedback_id);
    }
  };

  return (
    <div className="w-full max-w-lg bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 text-white shadow-2xl animate-fadeIn backdrop-blur-xl max-h-[88vh] overflow-y-auto custom-scrollbar">
      {/* Top Header & Band Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <Award className="w-4 h-4" />
            <span>Evaluasi Speaking Sesi</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Hasil Penilaian Panggilan
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Durasi Percakapan: {formatCallDuration(duration)}</span>
          </div>
        </div>

        {/* Big Band Box */}
        <div className="bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border border-blue-500/30 rounded-2xl px-4 py-3 text-center shrink-0 min-w-[120px]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-300 block">
            Overall Band
          </span>
          <div className="text-3xl font-black text-white mt-0.5 tracking-tight">
            {overallBand.toFixed(1)}
          </div>
          <span className="text-[11px] font-bold text-amber-400 block mt-0.5">
            CEFR {cefrGrade}
          </span>
        </div>
      </div>

      {/* 4 IELTS Metric Bars */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
          <span>Analisis Metrik Speaking (Skala 1.0 - 9.0)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {metrics.map((m, idx) => {
            const percent = Math.min(100, Math.max(10, (m.score / 9.0) * 100));
            return (
              <div
                key={idx}
                className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 text-[11px]">{m.label}</span>
                  <span className="font-extrabold text-blue-400">{m.score.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mr. Khoirul Feedback Note Box */}
      {evaluation.feedback_id && (
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Catatan Evaluasi Mr. Khoirul</span>
            </div>

            {onPlayAudio && (
              <button
                type="button"
                onClick={handlePlayVoiceNote}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-[11px] font-semibold text-blue-300 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Dengar Pesan Suara</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            &ldquo;{evaluation.feedback_id}&rdquo;
          </p>

          {evaluation.feedback_en && (
            <p className="text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-800/80">
              Summary: &ldquo;{evaluation.feedback_en}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Collapsible Transcript Review */}
      {conversationHistory.length > 0 && (
        <div className="border border-zinc-800/80 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="w-full px-4 py-3 bg-zinc-900/60 hover:bg-zinc-900 flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <span>Transkrip Percakapan ({conversationHistory.length} Putaran)</span>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTranscript && (
            <div className="p-4 space-y-3 bg-zinc-950 max-h-56 overflow-y-auto custom-scrollbar border-t border-zinc-800/80">
              {conversationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`text-xs space-y-0.5 ${
                    item.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    {item.role === "user" ? "Kamu" : "Mr. Khoirul"}
                  </span>
                  <div
                    className={`inline-block p-2.5 rounded-xl text-xs max-w-[85%] ${
                      item.role === "user"
                        ? "bg-blue-600 text-white text-left"
                        : "bg-zinc-800 text-zinc-200 text-left"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-2">
        <Button
          onClick={onNewCall}
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold text-xs py-3 rounded-2xl shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Panggilan Baru
        </Button>
        <Link href="/dashboard" className="flex-1">
          <Button
            variant="outline"
            className="w-full text-xs py-3 text-zinc-300 border-zinc-800 hover:bg-zinc-900 rounded-2xl flex items-center justify-center gap-1.5"
          >
            <span>Ke Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
