"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, Bot, Check, X, AlertCircle } from "lucide-react";

import { VocabItem } from "../SectionVocab";
import { animeButtonPop, animeShake, animeCardHover } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ReadinessQuestion {
  id: number;
  category: "Pengenalan Bentuk" | "Pemahaman Aturan" | "Penerapan Konteks";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TheoryReadinessCheckProps {
  questions?: ReadinessQuestion[];
  rules?: Array<Record<string, string> | string>;
  commonTrap?: {
    trapTitle?: string;
    explanation: string;
    wrong: string;
    correct: string;
  };
  vocabItems?: VocabItem[];
  onNext: () => void;
  onCompleteStep?: () => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onPenalizeWrong?: () => void;
}

export function TheoryReadinessCheck({
  questions,
  rules = [],
  commonTrap,
  vocabItems = [],
  onNext,
  onCompleteStep,
  onAwardXp,
  onPenalizeWrong,
}: TheoryReadinessCheckProps) {
  const activeQuestions: ReadinessQuestion[] = React.useMemo(() => {
    if (questions && questions.length > 0) {
      return questions;
    }

    // Dynamic Generation Engine for any module
    const generated: ReadinessQuestion[] = [];

    // Q1: Pengenalan Bentuk (Form Recognition)
    let q1Prompt = "Manakah pasangan subjek dan kata kerja bantu (to be) yang tepat?";
    let q1Options = ["I are", "She is", "They is"];
    let q1Explanation = "Subjek 'She' berpasangan dengan 'is', 'I' dengan 'am', dan 'They' dengan 'are'.";

    if (rules.length > 0) {
      const firstRule = typeof rules[0] === "string" ? rules[0] : (rules[0] as any).rule || "";
      if (firstRule.toLowerCase().includes("not") || firstRule.toLowerCase().includes("negative")) {
        q1Prompt = "Bagaimana pola kalimat negatif yang benar?";
        q1Options = ["Subject + to be + not + complement", "Subject + not + to be + complement", "To be + subject + not"];
        q1Explanation = "Dalam bentuk negatif, kata 'not' diletakkan tepat setelah kata kerja bantu (to be).";
      }
    }

    generated.push({
      id: 1,
      category: "Pengenalan Bentuk",
      prompt: q1Prompt,
      options: q1Options,
      correctIndex: 1,
      explanation: q1Explanation,
    });

    // Q2: Pemahaman Aturan / Common Trap
    if (commonTrap?.correct && commonTrap?.wrong) {
      generated.push({
        id: 2,
        category: "Pemahaman Aturan",
        prompt: `Manakah kalimat yang benar dan menghindari kesalahan umum pada modul ini?`,
        options: [commonTrap.wrong, commonTrap.correct, "She don't from Japan"],
        correctIndex: 1,
        explanation: commonTrap.explanation || "Perhatikan pasangan subjek dan kata bantu yang sesuai aturan.",
      });
    } else {
      generated.push({
        id: 2,
        category: "Pemahaman Aturan",
        prompt: "Kapan pola kalimat ini paling tepat digunakan?",
        options: [
          "Menceritakan identitas, asal, atau fakta dasar",
          "Membicarakan rencana yang sudah pasti di masa depan",
          "Mengungkapkan perintah tegas kepada orang lain",
        ],
        correctIndex: 0,
        explanation: "Simple Present dengan to be digunakan untuk menyatakan fakta, identitas diri, dan kondisi saat ini.",
      });
    }

    // Q3: Penerapan Konteks (Context Application)
    generated.push({
      id: 3,
      category: "Penerapan Konteks",
      prompt: `Lengkapi dialog: "Are you from Jakarta?" : "No, [...]"`,
      options: [
        "I'm from Bandung.",
        "I is from Bandung.",
        "I are from Bandung.",
      ],
      correctIndex: 0,
      explanation: "Jawaban yang tepat menggunakan subjek 'I' dan to be 'am' (I'm).",
    });

    return generated;
  }, [questions, rules, commonTrap, vocabItems]);

  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleSelect = (qId: number, optIdx: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const isFirstAttempt = answers[qId] === undefined;
    const question = activeQuestions.find((q) => q.id === qId);

    if (question) {
      if (optIdx === question.correctIndex) {
        animeButtonPop(e.currentTarget);
      } else {
        animeShake(e.currentTarget);
      }
    }

    if (isFirstAttempt && question) {
      if (optIdx === question.correctIndex) {
        onAwardXp?.(15, "Jawaban Benar!");
      } else {
        onPenalizeWrong?.();
      }
    }

    setAnswers((prev) => {
      const updated = { ...prev, [qId]: optIdx };
      if (Object.keys(updated).length >= activeQuestions.length) {
        onCompleteStep?.();
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Container Card using shadcn Card */}
      <Card className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/50 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cek Kesiapan Belajar (3 Pertanyaan Kilat)</span>
          </div>
          <Badge variant="primary" className="font-semibold text-xs">
            {Object.keys(answers).length} dari {activeQuestions.length} Terjawab
          </Badge>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Uji pemahamanmu sebelum melangkah ke latihan mandiri dan Speaking Lab bersama Mr. Khoirul:
        </p>

        {/* 3 Questions Flow */}
        <div className="space-y-4 pt-1">
          {activeQuestions.map((q) => {
            const selectedOpt = answers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = isAnswered && selectedOpt === q.correctIndex;

            return (
              <Card
                key={q.id}
                onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
                onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
                className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm space-y-3 will-change-transform"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" size="sm" className="font-bold uppercase tracking-wider">
                    Soal {q.id} • {q.category}
                  </Badge>
                  {isAnswered && (
                    <span
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Benar
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Pelajari Penjelasan
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {q.prompt}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {q.options.map((opt, idx) => {
                    const isOptionSelected = selectedOpt === idx;
                    const isOptionCorrect = idx === q.correctIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleSelect(q.id, idx, e)}
                        className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between gap-2 select-none cursor-pointer border-b-4 will-change-transform ${
                          isOptionSelected
                            ? isOptionCorrect
                              ? "border-emerald-500 border-b-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/40 animate-pop-bounce"
                              : "border-amber-500 border-b-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 animate-tactile-shake"
                            : isAnswered && isOptionCorrect
                            ? "border-emerald-400 border-b-emerald-600 bg-emerald-50/40 text-emerald-800 font-bold"
                            : "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-400 active:border-b-0 active:translate-y-0.5 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isOptionSelected && (
                          isOptionCorrect ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Educational Feedback */}
                {isAnswered && (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
                      isCorrect
                        ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        {isCorrect ? "Mantap! Alasan kamu benar: " : "Yuk pelajari konsepnya: "}
                      </span>
                      <p className="leading-relaxed opacity-95">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-end">
        <Button
          onClick={onNext}
          className="gap-2 px-5 py-2.5 shadow-sm"
        >
          <span>Lanjut ke Uji Mandiri (Writing & Speaking)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const Phase1ReadinessCheck = TheoryReadinessCheck;
export type { TheoryReadinessCheckProps as Phase1ReadinessCheckProps };
