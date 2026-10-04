"use client";

import React, { useEffect, useRef } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  Headphones,
  BookOpen,
  PenTool,
  MessageSquare,
  Info,
} from "lucide-react";
import {
  animeCardStagger,
  animeCardHover,
  animeButtonPop,
  animeCardReveal,
} from "@/lib/anime-effects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface QuizQuestion {
  id: string | number;
  question: string;
  options: string[];
  explanation?: string;
}

export interface QuestionResult {
  questionId: string | number;
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
  quizScore?: number;
  speakingScore?: number | null;
  passed?: boolean;
  results?: QuestionResult[];
  isExam?: boolean;
  onSelectAnswer: (questionId: string | number, optionIndex: number) => void;
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
  quizScore,
  speakingScore,
  passed,
  results,
  isExam,
  onSelectAnswer,
  onSubmit,
  onRetry,
  onContinue,
}: SectionQuizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const unansweredQuestions = questions
    .map((q, idx) => ({ id: q.id ?? idx, index: idx, number: idx + 1 }))
    .filter((item) => userAnswers[item.id.toString()] === undefined);

  const scrollToQuestion = (idx: number) => {
    const el = document.getElementById(`quiz-question-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Anime.js Stagger question cards on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>(".quiz-question-card");
    if (cards.length > 0) {
      animeCardStagger(cards, 60);
    }
  }, [questions]);

  // Anime.js Reveal result banner when submitted
  useEffect(() => {
    if (isSubmitted && resultCardRef.current) {
      animeCardReveal(resultCardRef.current);
    }
  }, [isSubmitted]);

  const getResultForQuestion = (qId: string | number | undefined) => {
    if (qId === undefined || qId === null) return undefined;
    return results?.find(
      (r) => r.questionId !== undefined && r.questionId !== null && r.questionId.toString() === qId.toString()
    );
  };

  const handleOptionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    qId: string | number,
    optIndex: number
  ) => {
    animeButtonPop(e.currentTarget);
    onSelectAnswer(qId, optIndex);
  };

  return (
    <div ref={containerRef} className="space-y-8 sm:space-y-10">
      {/* Quiz Header Banner Card using shadcn Card */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="flex items-center justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs will-change-transform"
      >
        <div className="flex items-center gap-3.5">
          {isExam ? (
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Syarat kelulusan: Nilai minimum {passingScore}%
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="font-bold text-xs">
          {answeredCount} / {questions.length} Dijawab
        </Badge>
      </Card>

      {/* Result Card if Submitted using shadcn Card */}
      {isSubmitted && (
        <Card
          ref={resultCardRef}
          className={`p-6 sm:p-8 rounded-2xl shadow-xs will-change-transform ${
            passed
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              {passed ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-lg">
                  {passed
                    ? isExam
                      ? "Selamat! Anda Lulus Ujian Level A1.1!"
                      : "Luar Biasa! Anda Berhasil Lulus Modul Ini"
                    : "Belum Mencapai Nilai Kelulusan"}
                </h3>
                <p className="text-xs md:text-sm opacity-90 mt-0.5 font-medium">
                  {passed
                    ? `Skor Akhir: ${score}%. Selamat, modul berikutnya telah terbuka!`
                    : `Skor Akhir: ${score}%. Target minimal ${passingScore}%. Pelajari kembali materi dan coba lagi.`}
                </p>
              </div>
            </div>

            {/* Hybrid Evaluation Score Badges */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
              {speakingScore !== undefined && speakingScore !== null && (
                <div className="flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm min-w-[90px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Speaking (60%)
                  </span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">
                    {speakingScore}%
                  </span>
                </div>
              )}

              {quizScore !== undefined && quizScore !== null && (
                <div className="flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm min-w-[90px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Kuis (40%)
                  </span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    {quizScore}%
                  </span>
                </div>
              )}

              <div
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl font-bold min-w-[80px] shadow-sm ${
                  passed
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  Total
                </span>
                <span className="text-lg font-black">{score}%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Questions List as Staggered Tactile Cards */}
      <div className="space-y-6 sm:space-y-8">
        {questions.map((q, qIndex) => {
          const qId = q.id ?? qIndex;
          const selectedOption = userAnswers[qId.toString()];
          const qResult = isSubmitted ? getResultForQuestion(qId) : undefined;

          return (
            <Card
              key={qId.toString()}
              id={`quiz-question-${qIndex}`}
              onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
              onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
              className={`quiz-question-card scroll-mt-24 p-6 sm:p-8 rounded-2xl transition-all will-change-transform shadow-xs space-y-5 ${
                isSubmitted
                  ? qResult?.isCorrect
                    ? "border-emerald-200 bg-white dark:border-emerald-800/40 dark:bg-slate-900"
                    : "border-rose-200 bg-white dark:border-rose-800/40 dark:bg-slate-900"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              {/* Question header */}
              {(() => {
                const skillMatch = q.question.match(/^\[(.*?)\]\s*([\s\S]*)$/);
                const skillTag = skillMatch ? skillMatch[1] : null;
                const cleanQuestionText = skillMatch ? skillMatch[2] : q.question;

                return (
                  <div>
                    {skillTag && (
                      <div className="mb-2.5">
                        <Badge
                          variant={
                            skillTag.toLowerCase().includes("listening")
                              ? "primary"
                              : skillTag.toLowerCase().includes("reading")
                              ? "success"
                              : skillTag.toLowerCase().includes("writing")
                              ? "accent"
                              : "secondary"
                          }
                          className="gap-1.5 uppercase font-bold"
                        >
                          {skillTag.toLowerCase().includes("listening") ? (
                            <Headphones className="w-3.5 h-3.5" />
                          ) : skillTag.toLowerCase().includes("reading") ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : skillTag.toLowerCase().includes("writing") ? (
                            <PenTool className="w-3.5 h-3.5" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                          <span>{skillTag}</span>
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3.5">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
                          {cleanQuestionText}
                        </p>
                      </div>

                      {isSubmitted && qResult && (
                        <div>
                          {qResult.isCorrect ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tepat
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Kurang Tepat
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Options as Tactile Cards */}
              <div className="grid grid-cols-1 gap-3 sm:gap-3.5 mt-5">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrectAnswer = isSubmitted && qResult?.correctAnswer === optIndex;
                  const isWrongAnswer = isSubmitted && isSelected && !qResult?.isCorrect;

                  const letter = String.fromCharCode(65 + optIndex);

                  let optionStyles =
                    "border-slate-200/90 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200";

                  if (isSelected && !isSubmitted) {
                    optionStyles =
                      "border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500 shadow-xs";
                  } else if (isCorrectAnswer) {
                    optionStyles =
                      "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold ring-2 ring-emerald-500";
                  } else if (isWrongAnswer) {
                    optionStyles =
                      "border-rose-500 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-semibold ring-2 ring-rose-500";
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={isSubmitted}
                      onClick={(e) => handleOptionClick(e, qId, optIndex)}
                      className={`flex items-center gap-3.5 p-4 sm:p-4.5 rounded-2xl border text-left text-sm md:text-base min-h-[58px] transition-all cursor-pointer select-none active:scale-98 will-change-transform ${optionStyles}`}
                    >
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center flex-shrink-0 ${
                          isSelected && !isSubmitted
                            ? "bg-blue-600 text-white"
                            : isCorrectAnswer
                            ? "bg-emerald-600 text-white"
                            : isWrongAnswer
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 font-medium leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Note after submit */}
              {isSubmitted && (q.explanation || qResult?.explanation) && (
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal flex items-start gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-slate-800 dark:text-slate-200">Penjelasan:</strong>{" "}
                    {qResult?.explanation || q.explanation}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit Action Bar */}
      {!isSubmitted && (
        <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="space-y-2">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {isAllAnswered ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Semua pertanyaan telah dijawab! Klik tombol untuk kirim.
                </span>
              ) : (
                <span>
                  Tersisa <strong className="text-amber-600 dark:text-amber-400">{unansweredQuestions.length}</strong> pertanyaan yang belum dijawab:
                </span>
              )}
            </div>

            {!isAllAnswered && unansweredQuestions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {unansweredQuestions.map((uq) => (
                  <button
                    key={uq.id.toString()}
                    type="button"
                    onClick={() => scrollToQuestion(uq.index)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer"
                    title={`Lompat ke Soal #${uq.number}`}
                  >
                    Soal #{uq.number}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            disabled={!isAllAnswered || isSubmitting}
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onSubmit();
            }}
            className="w-full sm:w-auto gap-2 shadow-md shrink-0 min-h-[44px]"
          >
            <span>{isSubmitting ? "Memproses..." : "Kirim Jawaban"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {/* Completion Action Bar */}
      {isSubmitted && (
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {passed
              ? "Anda telah menyelesaikan seluruh materi dan evaluasi pada modul ini."
              : "Periksa kembali pembahasan jawaban di atas sebelum mengulang kuis."}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!passed && onRetry && (
              <Button
                variant="outline"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onRetry();
                }}
                className="gap-2 shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Kuis</span>
              </Button>
            )}
            {onContinue && (
              <Button
                variant={passed ? "default" : "secondary"}
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onContinue();
                }}
                className={passed ? "bg-emerald-600 hover:bg-emerald-700 shadow-md gap-2" : "gap-2"}
              >
                <span>Kembali ke Daftar Modul</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
