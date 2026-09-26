"use client";

import React from "react";
import { Award, PhoneOff, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCallDuration } from "@/lib/call-utils";

interface CallEvaluationModalProps {
  isShortCall: boolean;
  feedback: any;
  duration: number;
  onNewCall: () => void;
}

export function CallEvaluationModal({
  isShortCall,
  feedback,
  duration,
  onNewCall,
}: CallEvaluationModalProps) {
  return (
    <div className="w-full max-w-md bg-zinc-950/95 border border-zinc-800/90 rounded-3xl p-6 space-y-5 text-left shadow-2xl animate-fadeIn backdrop-blur-md">
      {isShortCall || !feedback ? (
        <div className="text-center space-y-3 py-2">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <PhoneOff className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Panggilan Diakhiri</h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Sesi ini singkat dan belum memiliki percakapan aktif yang cukup untuk dinilai. Mulai panggilan baru untuk latihan percakapan penuh dengan Mr. Khoirul.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <span className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2 font-bold">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">Hasil Latihan Percakapan</h3>
            <p className="text-xs text-zinc-400">
              Durasi: {formatCallDuration(duration)} • Estimasi Level:{" "}
              <span className="text-blue-400 font-bold">{feedback.cefr || "B1"}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-[11px]">Fluency</p>
              <p className="text-base font-bold text-blue-400">{feedback.fluency ?? 3.5} / 5.0</p>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-[11px]">Vocabulary</p>
              <p className="text-base font-bold text-blue-400">{feedback.lexical ?? 3.5} / 5.0</p>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-[11px]">Grammar</p>
              <p className="text-base font-bold text-blue-400">{feedback.grammar ?? 3.5} / 5.0</p>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-[11px]">Pronunciation</p>
              <p className="text-base font-bold text-blue-400">{feedback.pronunciation ?? 4.0} / 5.0</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-1.5">
            <p className="font-semibold text-blue-400 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" /> Catatan Mr. Khoirul:
            </p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">{feedback.feedback_id}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
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
