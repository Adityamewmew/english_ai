"use client";

import React from "react";
import { AlertCircle, ArrowRight, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExamSubmitScores {
  rCorrect?: number;
  rTotal?: number;
  lCorrect?: number;
  lTotal?: number;
  wAnswered?: number;
  wTotal?: number;
  sCompletedCount?: number;
  sTotal?: number;
}

interface ExamSubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scores?: ExamSubmitScores;
  totalAnswered: number;
  grandTotal: number;
  readingAnswered?: number;
  listeningAnswered?: number;
  isAdmin?: boolean;
}

export function ExamSubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  scores = {},
  totalAnswered,
  grandTotal,
  readingAnswered,
  listeningAnswered,
  isAdmin = false,
}: ExamSubmitConfirmModalProps) {
  if (!isOpen) return null;

  const isZeroAnswers = totalAnswered === 0;
  const isBlocked = isZeroAnswers && !isAdmin;

  const unanswered = Math.max(0, grandTotal - totalAnswered);
  const rAns = readingAnswered ?? scores.rCorrect ?? 0;
  const lAns = listeningAnswered ?? scores.lCorrect ?? 0;
  const rTot = scores.rTotal ?? 15;
  const lTot = scores.lTotal ?? 15;
  const wAns = scores.wAnswered ?? 0;
  const wTot = scores.wTotal ?? 10;
  const sAns = scores.sCompletedCount ?? 0;
  const sTot = scores.sTotal ?? 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isBlocked
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isBlocked ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isBlocked ? "Ujian Belum Dikerjakan" : "Kumpulkan Ujian Sekarang?"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBlocked
                ? "Anda belum menjawab soal apa pun di sesi ini."
                : "Pastikan Anda telah memeriksa seluruh jawaban Anda."}
            </p>
          </div>
        </div>

        {/* Summary grid */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-600 dark:text-slate-400">Total Soal Terjawab:</span>
            <span className={isZeroAnswers ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}>
              {totalAnswered} / {grandTotal}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <div>Reading: {rAns}/{rTot} dijawab</div>
            <div>Listening: {lAns}/{lTot} dijawab</div>
            <div>Writing: {wAns}/{wTot} diketik</div>
            <div>Speaking: {sAns}/{sTot} diverifikasi</div>
          </div>

          {isBlocked ? (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] font-semibold text-rose-800 dark:text-rose-300">
              ⚠️ Ujian tidak dapat dikumpulkan dalam kondisi kosong. Silakan kembali untuk mengerjakan soal ujian.
            </div>
          ) : isZeroAnswers && isAdmin ? (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-[11px] font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-600" />
              <span>Admin Bypass: Pengumpulan 0 jawaban diizinkan untuk simulasi remedial.</span>
            </div>
          ) : unanswered > 0 ? (
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-200 dark:border-amber-800/60">
              ⚠️ Masih ada {unanswered} soal yang belum Anda isi.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>{isBlocked ? "Kembali ke Soal" : "Periksa Kembali"}</span>
          </Button>

          {!isBlocked && (
            <Button
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer min-h-[44px] shadow-sm font-heading"
            >
              <span>Ya, Kumpulkan Ujian</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
