"use client";

import React from "react";
import { Award, Clock, Printer, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamScores {
  rCorrect: number;
  rTotal: number;
  lCorrect: number;
  lTotal: number;
  wAnswered: number;
  wTotal: number;
  sCompletedCount: number;
  sTotal: number;
  totalScore: number;
  isPassed: boolean;
}

interface ExamCertificateViewProps {
  scores: ExamScores;
  moduleData: any;
  studentName: string;
  passingScore: number;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
}

export function ExamCertificateView({
  scores,
  moduleData,
  studentName,
  passingScore,
  isSubmitting = false,
  isSubmitted = false,
}: ExamCertificateViewProps) {
  const certDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* 1. Score Summary Header */}
      <div className="text-center space-y-2">
        <div
          className={`w-16 h-16 rounded-3xl inline-flex items-center justify-center shadow-md ${
            scores.isPassed
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {scores.isPassed ? <Award className="w-9 h-9" /> : <Clock className="w-9 h-9" />}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {scores.isPassed ? "Selamat! Anda Lulus Ujian Kelulusan" : "Evaluasi Selesai (Perlu Remedial)"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          {moduleData?.title} · Tingkat CEFR {moduleData?.cefr || "A1"}
        </p>
      </div>

      {/* 2. Bento 4-Skill Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Reading</div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {scores.rCorrect} / {scores.rTotal}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
            {Math.round((scores.rCorrect / scores.rTotal) * 100)}%
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Listening</div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {scores.lCorrect} / {scores.lTotal}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
            {Math.round((scores.lCorrect / scores.lTotal) * 100)}%
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Writing</div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {scores.wAnswered} / {scores.wTotal}
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">
            {Math.round((scores.wAnswered / scores.wTotal) * 100)}%
          </div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Speaking</div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {scores.sCompletedCount} / {scores.sTotal}
          </div>
          <div className="text-[10px] text-sky-700 dark:text-sky-400 font-bold">
            {Math.round((scores.sCompletedCount / scores.sTotal) * 100)}%
          </div>
        </Card>
      </div>

      {/* 3. Official Certificate Card (Only if Passed) */}
      {scores.isPassed ? (
        <div
          id="graduation-certificate"
          className="relative p-6 sm:p-10 rounded-3xl bg-amber-50/40 dark:bg-slate-900 border-2 border-amber-600/40 shadow-md space-y-6 text-center print:border-none print:shadow-none print:bg-white print:p-0"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-300 dark:border-amber-800">
              <Award className="w-3.5 h-3.5" />
              <span>Official CEFR Credential</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide pt-2 font-serif">
              CERTIFICATE OF SUB-LEVEL MASTERY
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-serif italic">
              EDDY&apos;S English AI Academic Board · Autonomous Evaluation Standard
            </p>
          </div>

          <div className="space-y-1 py-2">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              This is proudly conferred upon
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0D3B66] dark:text-[#F4B41A] font-serif">
              {studentName}
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed pt-1">
              telah berhasil menuntaskan seluruh 55 evaluasi kompetensi pada tingkat:
              <br />
              <strong className="text-slate-900 dark:text-white text-sm">
                {moduleData?.title} (CEFR {moduleData?.cefr || "A1"})
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-amber-600/20 text-xs text-slate-700 dark:text-slate-300 font-mono">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Nilai Akhir</div>
              <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                {scores.totalScore} / 100
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Tanggal Terbit</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{certDate}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">ID Verifikasi</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                EDDY-{moduleData?.id || "M13"}-OK
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center space-y-3">
          <div className="text-rose-800 dark:text-rose-200 font-bold text-sm">
            Skor Anda ({scores.totalScore}%) masih di bawah passing score ({passingScore}%).
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Anda dapat meninjau kembali materi di unit 1 s.d. 12 dan mengulang ujian kelulusan ini kapan saja untuk meraih sertifikat resmi.
          </p>
        </Card>
      )}

      {/* Progress saving status notification */}
      {isSubmitting ? (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2 print:hidden">
          <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Menyimpan skor kelulusan dan membuka modul berikutnya di akun Anda...</span>
        </div>
      ) : isSubmitted ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2 print:hidden">
          <span>✓ Progres kelulusan tersimpan di server! Modul 2 telah terbuka otomatis.</span>
        </div>
      ) : null}

      {/* 4. Action Buttons (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 print:hidden">
        {scores.isPassed && (
          <Button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF Sertifikat</span>
          </Button>
        )}
        <Button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/modules";
            }
          }}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#082542] text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <span>Kembali ke Katalog Kursus</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
