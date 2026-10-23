"use client";

import React from "react";
import { Award, Clock, Printer, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "@/features/certificates/components/certificate-card";

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
}

export function ExamCertificateView({
  scores,
  moduleData,
  studentName,
  passingScore,
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

      {/* 3. Official EDDY'S Certificate (Rendered on Passing) */}
      {scores.isPassed ? (
        <div className="flex justify-center py-2">
          <CertificateCard
            data={{
              certificateNumber: `EE-RC-A-${(moduleData?.cefr || "A1").toUpperCase()}-X/26-001`,
              userName: studentName,
              cefrLevel: moduleData?.cefr || "A1",
              score: scores.totalScore,
              structureScore:
                scores.rTotal > 0
                  ? Math.round((scores.rCorrect / scores.rTotal) * 100)
                  : 85,
              readingScore:
                scores.rTotal > 0
                  ? Math.round((scores.rCorrect / scores.rTotal) * 100)
                  : 85,
              listeningScore:
                scores.lTotal > 0
                  ? Math.round((scores.lCorrect / scores.lTotal) * 100)
                  : 85,
              dictationScore: Math.min(
                100,
                Math.max(
                  60,
                  Math.round(
                    ((scores.lTotal > 0
                      ? scores.lCorrect / scores.lTotal
                      : 0.85) *
                      0.6 +
                      (scores.rTotal > 0
                        ? scores.rCorrect / scores.rTotal
                        : 0.85) *
                        0.4) *
                      100
                  )
                )
              ),
              conversationScore:
                scores.sTotal > 0
                  ? Math.round((scores.sCompletedCount / scores.sTotal) * 100)
                  : 85,
              compositionScore:
                scores.wTotal > 0
                  ? Math.round((scores.wAnswered / scores.wTotal) * 100)
                  : 85,
              grade:
                scores.totalScore >= 89
                  ? "EXCELLENT"
                  : scores.totalScore >= 76
                  ? "GOOD"
                  : "FAIR",
              issuedAt: new Date(),
              examDate: new Date(),
            }}
            isModal={false}
          />
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
