"use client";

import React from "react";
import { RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, Target, Award } from "lucide-react";

interface SubmoduleResultModalProps {
  isOpen: boolean;
  score: number;
  passingScore?: number;
  subModuleTitle?: string;
  questionResults?: any[];
  onRetake: () => void;
  onCloseToHub: () => void;
}

export function SubmoduleResultModal({
  isOpen,
  score,
  passingScore = 75,
  subModuleTitle = "Sub-Modul Praktikum",
  questionResults = [],
  onRetake,
  onCloseToHub,
}: SubmoduleResultModalProps) {
  if (!isOpen) return null;

  const passed = score >= passingScore;
  const wrongQuestions = (questionResults || []).filter((q) => q && !q.isCorrect);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center">
        {/* Header Icon */}
        <div
          className={`w-14 h-14 mx-auto rounded-3xl flex items-center justify-center shadow-inner ${
            passed
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {passed ? (
            <Award className="w-7 h-7" />
          ) : (
            <Target className="w-7 h-7 animate-pulse" />
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-block border ${
              passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
            }`}
          >
            {passed ? "Lulus KKM Sub-Modul ✓" : "Belum Memenuhi KKM (Target: 75)"}
          </span>
          <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white pt-1">
            {passed ? "Misi Berhasil Diselesaikan!" : "Hasil Evaluasi Praktikum"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {passed
              ? `Selamat! Anda berhasil mencapai KKM dan menyelesaikan latihan pada ${subModuleTitle}. Progres telah tersimpan ke server.`
              : `Anda memperoleh skor ${score}/100. Standar KKM kelulusan adalah ${passingScore}. Pelajari catatan soal di bawah dan ulangi praktikum untuk mencapai target kelulusan.`}
          </p>
        </div>

        {/* Big Score Card */}
        <div
          className={`py-3.5 px-6 rounded-2xl border inline-flex items-center gap-6 mx-auto ${
            passed
              ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/80"
              : "bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/80"
          }`}
        >
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Skor Anda
            </span>
            <span
              className={`text-3xl font-black font-mono leading-none ${
                passed
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {score}
              <span className="text-xs font-semibold text-slate-500 ml-0.5">/100</span>
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Standar KKM
            </span>
            <span className="text-2xl font-black font-mono leading-none text-slate-700 dark:text-slate-300">
              {passingScore}
              <span className="text-xs font-semibold text-slate-500 ml-0.5">/100</span>
            </span>
          </div>
        </div>

        {/* Wrong questions list breakdown */}
        {!passed && wrongQuestions.length > 0 && (
          <div className="text-left space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                {wrongQuestions.length} Soal Perlu Diperbaiki
              </span>
              <span className="text-slate-400 font-normal text-[10px]">Cek petunjuk & ulangi</span>
            </div>
            <div className="max-h-48 overflow-y-auto pr-1 space-y-2 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 bg-slate-50/70 dark:bg-slate-900/50">
              {wrongQuestions.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {q.question || `Soal #${idx + 1}`}
                  </p>
                  {q.selectedAnswer && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      Pilihan Anda: <span className="font-semibold line-through decoration-rose-500">{q.selectedAnswer}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-300/90 bg-amber-500/10 p-2 rounded-lg leading-relaxed mt-1">
                      <span className="font-bold">Petunjuk: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          {!passed ? (
            <>
              <button
                type="button"
                onClick={onRetake}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation font-heading"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F4B41A]" />
                <span>Ulangi Praktikum (Reset Jawaban)</span>
              </button>

              <button
                type="button"
                onClick={onCloseToHub}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer min-h-[44px] touch-manipulation"
              >
                Kembali ke Menu Modul
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onCloseToHub}
              className="w-full px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation font-heading"
            >
              <span>Lanjut ke Menu Modul</span>
              <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

