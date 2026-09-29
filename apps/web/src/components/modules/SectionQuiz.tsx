"use client";

import React from "react";
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from "lucide-react";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  explanation?: string;
}

export interface QuestionResult {
  questionId: number;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

interface SectionQuizProps {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  userAnswers: Record<string, number>;
  isSubmitted: boolean;
  isSubmitting?: boolean;
  score?: number | null;
  passed?: boolean;
  results?: QuestionResult[];
  isExam?: boolean;
  onSelectAnswer: (questionId: number, optionIndex: number) => void;
  onSubmit: () => void;
  onRetry?: () => void;
  onContinue?: () => void;
}

export function SectionQuiz({
  title,
  questions,
  passingScore,
  userAnswers,
  isSubmitted,
  isSubmitting,
  score,
  passed,
  results,
  isExam,
  onSelectAnswer,
  onSubmit,
  onRetry,
  onContinue,
}: SectionQuizProps) {
  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const getResultForQuestion = (qId: number) => {
    return results?.find((r) => r.questionId === qId);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header Banner */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          {isExam ? (
            <Award className="w-5 h-5 text-amber-500" />
          ) : (
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Syarat kelulusan: Nilai minimum {passingScore}%
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
          {answeredCount} / {questions.length} Dijawab
        </div>
      </div>

      {/* Result Card if Submitted */}
      {isSubmitted && (
        <div
          className={`p-6 rounded-2xl border ${
            passed
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-900 dark:text-red-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {passed ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">
                  {passed
                    ? isExam
                      ? "Selamat! Anda Lulus Ujian Level A1.1!"
                      : "Luar Biasa! Anda Berhasil Lulus Modul Ini"
                    : "Belum Mencapai Nilai Kelulusan"}
                </h3>
                <p className="text-xs md:text-sm opacity-90">
                  {passed
                    ? `Skor Anda: ${score}%. Modul berikutnya telah terbuka.`
                    : `Skor Anda: ${score}%. Target minimal ${passingScore}%. Pelajari kembali materi dan coba lagi.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {!passed && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Kuis</span>
                </button>
              )}

              {passed && onContinue && (
                <button
                  type="button"
                  onClick={onContinue}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md"
                >
                  <span>Lanjut ke Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const qResult = getResultForQuestion(q.id);
          const selectedOption = userAnswers[q.id.toString()] ?? userAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`p-5 rounded-xl border transition-all ${
                isSubmitted && qResult
                  ? qResult.isCorrect
                    ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-800/30 dark:bg-emerald-950/10"
                    : "border-red-200 bg-red-50/20 dark:border-red-800/30 dark:bg-red-950/10"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <p className="font-semibold text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {isSubmitted && qResult && (
                  <div>
                    {qResult.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tepat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        Kurang Tepat
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 mt-4">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrectAnswer = isSubmitted && qResult?.correctAnswer === optIndex;
                  const isWrongAnswer = isSubmitted && isSelected && !qResult?.isCorrect;

                  const letter = String.fromCharCode(65 + optIndex);

                  let optionStyles =
                    "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200";

                  if (isSelected && !isSubmitted) {
                    optionStyles =
                      "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500";
                  } else if (isCorrectAnswer) {
                    optionStyles =
                      "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium ring-1 ring-emerald-500";
                  } else if (isWrongAnswer) {
                    optionStyles =
                      "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-medium ring-1 ring-red-500";
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => onSelectAnswer(q.id, optIndex)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs md:text-sm transition-all ${optionStyles}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                          isSelected && !isSubmitted
                            ? "bg-blue-600 text-white"
                            : isCorrectAnswer
                            ? "bg-emerald-600 text-white"
                            : isWrongAnswer
                            ? "bg-red-600 text-white"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation if submitted */}
              {isSubmitted && (qResult?.explanation || q.explanation) && (
                <div className="mt-3.5 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold block mb-0.5 text-slate-900 dark:text-white">
                    Penjelasan:
                  </span>
                  {qResult?.explanation || q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Action Bar */}
      {!isSubmitted && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAllAnswered
              ? "Semua soal telah dijawab. Klik tombol untuk memeriksa hasil."
              : `Masih ada ${questions.length - answeredCount} soal yang belum dijawab.`}
          </p>

          <button
            type="button"
            disabled={!isAllAnswered || isSubmitting}
            onClick={onSubmit}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
              isAllAnswered && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none"
            }`}
          >
            <span>{isSubmitting ? "Memproses..." : "Kirim Jawaban"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
