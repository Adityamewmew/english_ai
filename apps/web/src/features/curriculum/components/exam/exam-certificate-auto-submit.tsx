"use client";

import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamCertificateView } from "./exam-certificate-view";

interface ExamCertificateViewWithAutoSubmitProps {
  scores: any;
  moduleData: any;
  studentName: string;
  passingScore: number;
  onSubmitExam?: (score: number, examAnswers?: Record<string, any>) => Promise<void>;
  examAnswers: Record<string, any>;
  isSubmittingExam: boolean;
  isExamSubmitted: boolean;
  setIsSubmittingExam: (val: boolean) => void;
  setIsExamSubmitted: (val: boolean) => void;
  hasSubmittedRef: React.MutableRefObject<boolean>;
  onSelectStep?: (stepId: number) => void;
  isAdmin?: boolean;
}

export function ExamCertificateViewWithAutoSubmit({
  scores,
  moduleData,
  studentName,
  passingScore,
  onSubmitExam,
  examAnswers,
  isSubmittingExam,
  isExamSubmitted,
  setIsSubmittingExam,
  setIsExamSubmitted,
  hasSubmittedRef,
  onSelectStep,
  isAdmin = false,
}: ExamCertificateViewWithAutoSubmitProps) {
  const answeredCount = React.useMemo(() => {
    return Object.keys(examAnswers || {}).filter(
      (k) => !k.startsWith("__") && examAnswers[k] !== undefined && examAnswers[k] !== ""
    ).length;
  }, [examAnswers]);

  React.useEffect(() => {
    // SECURITY SAFEGUARD: Never auto-submit if no questions were answered (unless admin testing)
    // Prevents refreshed pages or empty sessions from zeroing out user progress
    if (answeredCount === 0 && !isAdmin) return;

    if (!hasSubmittedRef.current && onSubmitExam) {
      hasSubmittedRef.current = true;
      setIsSubmittingExam(true);
      onSubmitExam(scores.totalScore, examAnswers)
        .then(() => setIsExamSubmitted(true))
        .catch((err) => {
          console.error("Auto submit exam failed:", err);
          hasSubmittedRef.current = false;
        })
        .finally(() => setIsSubmittingExam(false));
    }
  }, [onSubmitExam, scores.totalScore, examAnswers, hasSubmittedRef, setIsSubmittingExam, setIsExamSubmitted, answeredCount, isAdmin]);

  if (answeredCount === 0 && !scores.isPassed && !isExamSubmitted && !isAdmin) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 inline-flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Sesi Ujian Belum Dikerjakan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Jawaban ujian belum ditemukan di sesi ini. Silakan mulai pengerjaan dari Part 1 agar seluruh kompetensi dievaluasi dan sertifikat kelulusan dapat diterbitkan.
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            onClick={() => (onSelectStep ? onSelectStep(2) : undefined)}
            className="px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#082542] text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span>Mulai dari Part 1 (Reading)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ExamCertificateView
      scores={scores}
      moduleData={moduleData}
      studentName={studentName}
      passingScore={passingScore}
      isSubmitting={isSubmittingExam}
      isSubmitted={isExamSubmitted}
      onRetake={() => (onSelectStep ? onSelectStep(2) : undefined)}
    />
  );
}

