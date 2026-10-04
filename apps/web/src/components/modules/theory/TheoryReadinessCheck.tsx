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
  dialogueLines?: Array<{ speaker: string; text: string; translation?: string }>;
  moduleTitle?: string;
  orderIndex?: number;
  summaryText?: string;
  bestExample?: string;
  onNext: () => void;
  onCompleteStep?: () => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onPenalizeWrong?: () => void;
}

// Deterministic pseudo-random Fisher-Yates shuffle using numeric seed
function deterministicShuffle<T>(
  items: T[],
  correctItem: T,
  seed: number
): { shuffled: T[]; correctIndex: number } {
  const result = [...items];
  if (!result.includes(correctItem)) {
    result[0] = correctItem;
  }

  let state = Math.abs(seed) || 12345;
  const nextRand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  const foundIndex = result.indexOf(correctItem);
  return {
    shuffled: result,
    correctIndex: foundIndex >= 0 ? foundIndex : 0,
  };
}

export function TheoryReadinessCheck({
  questions,
  rules = [],
  commonTrap,
  vocabItems = [],
  dialogueLines = [],
  moduleTitle = "",
  orderIndex = 1,
  summaryText = "",
  bestExample = "",
  onNext,
  onCompleteStep,
  onAwardXp,
  onPenalizeWrong,
}: TheoryReadinessCheckProps) {
  const activeQuestions: ReadinessQuestion[] = React.useMemo(() => {
    if (questions && questions.length > 0) {
      return questions;
    }

    const cleanTitle = moduleTitle.replace(/^(A\d-M\d+:|Module \d+:)\s*/i, "").trim() || "Materi Ini";
    const generated: ReadinessQuestion[] = [];
    const baseSeed = (orderIndex || 1) * 313 + cleanTitle.length * 17;

    // Helper: extract clean first clause or short sentence
    const cleanSentence = (str: string) => {
      const first = str.split(/[\/,;\n]/)[0]?.trim() || str.trim();
      return first.replace(/[0-9.:]+$/, "").trim();
    };

    // =========================================================================
    // Q1: Pengenalan Bentuk & Pola (Form Recognition) — Unik per modul
    // =========================================================================
    const q1Seed = baseSeed + 101;
    let q1Prompt = `Berdasarkan topik "${cleanTitle}", manakah pola kalimat yang tepat?`;
    let rawQ1Options = ["Subject + Verb", "Subject + Auxiliary + Verb", "Verb + Subject"];
    let correctQ1 = "Subject + Auxiliary + Verb";
    let q1Explanation = "Perhatikan struktur dan susunan kata yang telah dipelajari pada materi ini.";

    if (rules.length > 0) {
      const r0 = rules[0] as any;
      if (typeof r0 === "object" && r0 !== null) {
        if (r0.pattern && r0.example) {
          const promptStems = [
            `Pada topik "${cleanTitle}", manakah kalimat yang benar sesuai pola "${r0.pattern}"?`,
            `Perhatikan pola "${r0.pattern}". Manakah kalimat yang tepat menerapkannya?`,
            `Berdasarkan kaidah "${cleanTitle}", manakah contoh kalimat yang benar?`,
          ];
          q1Prompt = promptStems[q1Seed % promptStems.length];

          const correctEx = cleanSentence(r0.example);
          correctQ1 = correctEx;
          const wrongCandidate = commonTrap?.wrong ? cleanSentence(commonTrap.wrong) : "";
          const distractor1 = wrongCandidate && wrongCandidate !== correctEx
            ? wrongCandidate
            : correctEx.replace(/\b(am|is|are|was|were|will|should|must)\b/i, "");
          const distractor2 = correctEx.replace(/\b([a-zA-Z]+ing|[a-zA-Z]+ed)\b/i, "to $1");

          rawQ1Options = [correctEx, distractor1 || "I studying now", distractor2 || "She to working"];
          q1Explanation = `Pola yang tepat: "${r0.pattern}". Contoh: "${r0.example}". ${r0.meaning ? `(${r0.meaning})` : ""}`;
        } else if (r0.pronoun && r0.example) {
          const promptStems = [
            `Manakah contoh penerapan yang benar untuk subjek "${r0.pronoun}"?`,
            `Bagaimana kalimat yang tepat menggunakan subjek "${r0.pronoun}" pada materi ini?`,
            `Pilihlah kalimat yang menggunakan pasangan subjek "${r0.pronoun}" secara benar:`,
          ];
          q1Prompt = promptStems[q1Seed % promptStems.length];

          const correctEx = cleanSentence(r0.example);
          correctQ1 = correctEx;
          const distractor1 = correctEx.replace(/\b(was|were|am|is|are)\b/i, (m) =>
            m.toLowerCase() === "was" ? "were" : m.toLowerCase() === "is" ? "are" : "is"
          );
          const distractor2 = commonTrap?.wrong ? cleanSentence(commonTrap.wrong) : "They was happy.";

          rawQ1Options = [correctEx, distractor1, distractor2];
          q1Explanation = `Subjek "${r0.pronoun}" ${r0.meaning ? `(${r0.meaning})` : ""} digunakan dalam kalimat: "${r0.example}".`;
        } else if (r0.example) {
          q1Prompt = `Manakah struktur kalimat yang benar pada topik "${cleanTitle}"?`;
          const correctEx = cleanSentence(r0.example);
          correctQ1 = correctEx;
          const distractor1 = commonTrap?.wrong ? cleanSentence(commonTrap.wrong) : "Bentuk kalimat tanpa kata kerja";
          const distractor2 = correctEx.replace(/\s+\w+$/, "");

          rawQ1Options = [correctEx, distractor1, distractor2];
          q1Explanation = `Bentuk yang benar: "${r0.example}".`;
        }
      } else if (typeof r0 === "string") {
        q1Prompt = `Berdasarkan kaidah pada "${cleanTitle}", manakah pernyataan kaidah yang benar?`;
        correctQ1 = r0.length > 90 ? r0.slice(0, 87) + "..." : r0;
        rawQ1Options = [
          correctQ1,
          "Kaidah ini tidak memerlukan pasangan subjek dan predikat",
          "Bentuk kalimat bebas tanpa memperhatikan pola tenses"
        ];
        q1Explanation = r0;
      }
    } else if (bestExample) {
      q1Prompt = `Manakah contoh kalimat yang tepat pada materi "${cleanTitle}"?`;
      correctQ1 = bestExample;
      rawQ1Options = [
        bestExample,
        bestExample.replace(/\b(is|are|was|were|am)\b/gi, ""),
        bestExample.replace(/\b([a-z]+ing)\b/gi, "to $1")
      ];
      q1Explanation = `Contoh kalimat yang benar: "${bestExample}".`;
    }

    const q1Shuffled = deterministicShuffle(rawQ1Options, correctQ1, q1Seed);
    generated.push({
      id: 1,
      category: "Pengenalan Bentuk",
      prompt: q1Prompt,
      options: q1Shuffled.shuffled,
      correctIndex: q1Shuffled.correctIndex,
      explanation: q1Explanation,
    });

    // =========================================================================
    // Q2: Pemahaman Aturan & Jebakan (Rule & Trap Mastery) — Unik per modul
    // =========================================================================
    const q2Seed = baseSeed + 202;
    if (commonTrap?.correct && commonTrap?.wrong) {
      const promptStems = [
        `Manakah kalimat yang BENAR dan terhindar dari jebakan kesalahan umum pada topik ini?`,
        `Di antara pilihan berikut, manakah kalimat yang menggunakan tata bahasa baku bahasa Inggris?`,
        `Perhatikan peringatan jebakan materi ini. Manakah kalimat yang SUDAH TEPAT?`,
      ];
      const q2Prompt = promptStems[q2Seed % promptStems.length];

      const correctSentence = cleanSentence(commonTrap.correct);
      const wrongParts = commonTrap.wrong.split(/[\/,;\n]/).map((s) => cleanSentence(s)).filter(Boolean);
      const wrongSentence1 = wrongParts[0] || cleanSentence(commonTrap.wrong);

      let wrongSentence2 = wrongParts[1] || "";
      if (!wrongSentence2 || wrongSentence2 === wrongSentence1) {
        if (/\b(am|is|are)\b/i.test(correctSentence)) {
          wrongSentence2 = correctSentence.replace(/\b(am|is|are)\b/gi, (m) => (m.toLowerCase() === "is" ? "are" : "is"));
        } else if (/\b(was|were)\b/i.test(correctSentence)) {
          wrongSentence2 = correctSentence.replace(/\b(was|were)\b/gi, (m) => (m.toLowerCase() === "was" ? "were" : "was"));
        } else if (/\b(should|must)\b/i.test(correctSentence)) {
          wrongSentence2 = correctSentence.replace(/\b(should|must)\b/gi, "$1 to");
        } else if (/\b(than)\b/i.test(correctSentence)) {
          wrongSentence2 = correctSentence.replace(/\bthan\b/gi, "then");
        } else if (/\b(going to)\b/i.test(correctSentence)) {
          wrongSentence2 = correctSentence.replace(/\bgoing to\b/gi, "going");
        } else {
          wrongSentence2 = wrongSentence1.length > 5 ? wrongSentence1 + " right now" : "Kalimat dengan urutan kata salah";
        }
      }

      const q2Shuffled = deterministicShuffle([correctSentence, wrongSentence1, wrongSentence2], correctSentence, q2Seed);
      generated.push({
        id: 2,
        category: "Pemahaman Aturan",
        prompt: q2Prompt,
        options: q2Shuffled.shuffled,
        correctIndex: q2Shuffled.correctIndex,
        explanation: commonTrap.explanation || "Perhatikan pasangan kata dan struktur yang sesuai aturan tata bahasa baku.",
      });
    } else {
      const summarySnippet = summaryText && summaryText.length > 20
        ? summaryText.split(".")[0] + "."
        : `Menyatakan fungsi dan pola komunikatif dari ${cleanTitle}`;

      const q2Shuffled = deterministicShuffle(
        [
          summarySnippet,
          "Hanya digunakan untuk perintah formal dan pengumuman resmi",
          "Hanya digunakan dalam penulisan sastra kuno",
        ],
        summarySnippet,
        q2Seed
      );

      generated.push({
        id: 2,
        category: "Pemahaman Aturan",
        prompt: `Kapan pola kalimat pada topik "${cleanTitle}" ini paling tepat digunakan?`,
        options: q2Shuffled.shuffled,
        correctIndex: q2Shuffled.correctIndex,
        explanation: summaryText || "Pola ini digunakan sesuai konteks dan fungsi komunikatif yang dipelajari.",
      });
    }

    // =========================================================================
    // Q3: Penerapan Konteks (Context Application) — Unik dialog & skenario per modul
    // =========================================================================
    const q3Seed = baseSeed + 303;
    let q3Prompt = `Lengkapi kalimat kontekstual berikut:`;
    let rawQ3Options = ["Option A", "Option B", "Option C"];
    let correctQ3 = "Option A";
    let q3Explanation = "Pilihlah bentuk yang paling alami dan tepat sesuai konteks percakapan.";

    if (dialogueLines && dialogueLines.length >= 2) {
      // Variasikan giliran percakapan jika dialog panjang: odd modules ambil giliran 2-3 jika ada
      const useLaterTurn = dialogueLines.length >= 4 && q3Seed % 2 === 1;
      const lineA = useLaterTurn ? dialogueLines[2] : dialogueLines[0];
      const lineB = useLaterTurn ? dialogueLines[3] : dialogueLines[1];

      const promptStems = [
        `Lengkapi dialog berikut sesuai alur percakapan:\n${lineA.speaker}: "${lineA.text}"\n${lineB.speaker}: "[...]"`,
        `Dalam situasi percakapan berikut:\n${lineA.speaker}: "${lineA.text}"\nBagaimana respon ${lineB.speaker} yang paling alami?`,
        `Pilihlah kelanjutan percakapan yang tepat:\n${lineA.speaker}: "${lineA.text}"\n${lineB.speaker}: "[...]"`,
      ];
      q3Prompt = promptStems[q3Seed % promptStems.length];

      correctQ3 = lineB.text;
      const distractorA = commonTrap?.wrong ? cleanSentence(commonTrap.wrong) : "I don't think so.";
      const distractorB = "Sorry, I am not ready.";

      rawQ3Options = [correctQ3, distractorA, distractorB];
      q3Explanation = `Respon "${correctQ3}" ${lineB.translation ? `("${lineB.translation}")` : ""} adalah jawaban yang tepat dan alami sesuai alur percakapan.`;
    } else if (vocabItems && vocabItems.length > 0) {
      const vocabIndex = q3Seed % vocabItems.length;
      const targetVocab = vocabItems.find((_, idx) => idx === vocabIndex && _.example) ||
        vocabItems.find((v) => v.example && v.example.length > 10) ||
        vocabItems[0];
      const word = targetVocab.word;
      const ex = targetVocab.example || `I practice with ${word} every day.`;
      const regex = new RegExp(`\\b${word}\\b`, "i");
      const blanked = ex.replace(regex, "[...]");

      q3Prompt = `Lengkapi kalimat dengan kosakata yang tepat:\n"${blanked}" (Petunjuk arti: ${targetVocab.meaning || word})`;
      correctQ3 = word;
      const distractorA = word.endsWith("ing") ? word.replace(/ing$/, "") : word + "s";
      const otherVocab = vocabItems.find((v) => v.word !== word);
      const distractorB = otherVocab?.word || "other";

      rawQ3Options = [correctQ3, distractorA, distractorB];
      q3Explanation = `Kata yang tepat adalah "${correctQ3}" yang bermakna "${targetVocab.meaning || ""}".`;
    } else if (bestExample) {
      const match = bestExample.match(/\b(am|is|are|was|were|will|should|must|have|has)\b/i);
      if (match) {
        const aux = match[0];
        const blanked = bestExample.replace(new RegExp(`\\b${aux}\\b`, "i"), "[...]");
        q3Prompt = `Lengkapi kalimat kontekstual berikut:\n"${blanked}"`;
        correctQ3 = aux;
        const alt1 = aux.toLowerCase() === "was" ? "were" : aux.toLowerCase() === "is" ? "are" : aux.toLowerCase() === "am" ? "is" : "be";
        const alt2 = aux.toLowerCase() === "were" ? "was" : aux.toLowerCase() === "are" ? "is" : "have";

        rawQ3Options = [aux, alt1, alt2];
        q3Explanation = `Bentuk yang benar adalah "${aux}" sesuai dengan subjek dan tata bahasa pada kalimat tersebut.`;
      } else {
        q3Prompt = `Perhatikan kalimat berikut: "${bestExample}". Manakah bentuk kalimat yang benar?`;
        correctQ3 = bestExample;
        rawQ3Options = [bestExample, bestExample.replace(/\s+\w+$/, ""), "Bentuk tata bahasa salah"];
        q3Explanation = `Kalimat yang tepat adalah "${bestExample}".`;
      }
    }

    const q3Shuffled = deterministicShuffle(rawQ3Options, correctQ3, q3Seed);
    generated.push({
      id: 3,
      category: "Penerapan Konteks",
      prompt: q3Prompt,
      options: q3Shuffled.shuffled,
      correctIndex: q3Shuffled.correctIndex,
      explanation: q3Explanation,
    });

    return generated;
  }, [questions, rules, commonTrap, vocabItems, dialogueLines, moduleTitle, orderIndex, summaryText, bestExample]);

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

    const nextAnswers = { ...answers, [qId]: optIdx };
    setAnswers(nextAnswers);

    if (Object.keys(nextAnswers).length >= activeQuestions.length) {
      onCompleteStep?.();
    }
  };

  return (
    <div className="space-y-8">
      {/* Container Card using shadcn Card */}
      <Card className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/50 p-6 sm:p-8 md:p-10 shadow-xs space-y-6 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cek Kesiapan Belajar (3 Pertanyaan Kilat)</span>
          </div>
          <Badge variant="primary" className="font-semibold text-xs px-3 py-1">
            {Object.keys(answers).length} dari {activeQuestions.length} Terjawab
          </Badge>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Uji pemahamanmu sebelum melangkah ke latihan mandiri dan Speaking Lab bersama Mr. Khoirul:
        </p>

        {/* 3 Questions Flow */}
        <div className="space-y-6 sm:space-y-8 pt-1">
          {activeQuestions.map((q) => {
            const selectedOpt = answers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = isAnswered && selectedOpt === q.correctIndex;

            return (
              <Card
                key={q.id}
                onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
                onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
                className="p-6 sm:p-7 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs space-y-4 rounded-2xl will-change-transform"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" size="sm" className="font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5">
                    Soal {q.id} • {q.category}
                  </Badge>
                  {isAnswered && (
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-4 h-4" /> Benar
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" /> Pelajari Penjelasan
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.prompt}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                  {q.options.map((opt, idx) => {
                    const isOptionSelected = selectedOpt === idx;
                    const isOptionCorrect = idx === q.correctIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleSelect(q.id, idx, e)}
                        className={`p-4 sm:p-5 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between gap-3 select-none cursor-pointer border-b-4 will-change-transform min-h-[58px] ${
                          isOptionSelected
                            ? isOptionCorrect
                              ? "border-emerald-500 border-b-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/40 animate-pop-bounce"
                              : "border-amber-500 border-b-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 animate-tactile-shake"
                            : isAnswered && isOptionCorrect
                            ? "border-emerald-400 border-b-emerald-600 bg-emerald-50/40 text-emerald-800 font-bold"
                            : "border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-400 active:border-b-0 active:translate-y-1 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isOptionSelected && (
                          isOptionCorrect ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <X className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Educational Feedback */}
                {isAnswered && (
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm animate-in fade-in ${
                      isCorrect
                        ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
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
          className="gap-2 px-6 py-3 min-h-[48px] text-sm font-bold shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
        >
          <span>Lanjut ke Uji Mandiri (Writing &amp; Speaking)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const Phase1ReadinessCheck = TheoryReadinessCheck;
export type { TheoryReadinessCheckProps as Phase1ReadinessCheckProps };
