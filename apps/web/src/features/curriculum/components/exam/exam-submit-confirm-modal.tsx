"use client";

import React from "react";
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExamSubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scores: {
    rCorrect: number;
    rTotal: number;
    lCorrect: number;
    lTotal: number;
    wAnswered: number;
    wTotal: number;
    sCompletedCount: number;
    sTotal: number;
  };
  totalAnswered: number;
  grandTotal: number;
  readingAnswered?: number;
  listeningAnswered?: number;
}

export function ExamSubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  scores,
  totalAnswered,
  grandTotal,
  readingAnswered,
  listeningAnswered,
}: ExamSubmitConfirmModalProps) {
  if (!isOpen) return null;

  const unanswered = Math.max(0, grandTotal - totalAnswered);
  const rAns = readingAnswered ?? scores.rCorrect;
  const lAns = listeningAnswered ?? scores.lCorrect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Kumpulkan Ujian Sekarang?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pastikan Anda telah memeriksa seluruh jawaban Anda.
            </p>
          </div>
        </div>

        {/* Summary grid */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-600 dark:text-slate-400">Total Soal Terjawab:</span>
            <span className="text-slate-900 dark:text-white">{totalAnswered} / {grandTotal}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <div>Reading: {rAns}/{scores.rTotal} dijawab</div>
            <div>Listening: {lAns}/{scores.lTotal} dijawab</div>
            <div>Writing: {scores.wAnswered}/{scores.wTotal} diketik</div>
            <div>Speaking: {scores.sCompletedCount}/{scores.sTotal} diverifikasi</div>
          </div>

          {unanswered > 0 && (
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-200 dark:border-amber-800/60">
              ⚠️ Masih ada {unanswered} soal yang belum Anda isi.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border-slate-300 dark:border-slate-700 cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Periksa Kembali</span>
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer min-h-[44px] shadow-sm font-heading"
          >
            <span>Ya, Kumpulkan Ujian</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
