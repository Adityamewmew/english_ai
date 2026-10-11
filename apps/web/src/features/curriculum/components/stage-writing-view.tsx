"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Check,
  Send,
} from "lucide-react";
import { TutorAudioStage } from "./tutor-audio-stage";
import { KeyConceptsGrid, type KeyConceptItem } from "./key-concepts-grid";
import { SpotAndFixMechanics } from "./spot-and-fix-mechanics";

interface StageWritingViewProps {
  activeStepId: number;
  theorySec: any;
  practiceSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  cefr?: string;
}

export function StageWritingView({
  activeStepId,
  theorySec,
  practiceSec,
  tutor,
  onRewardXp,
  cefr = "A1.1",
}: StageWritingViewProps) {
  const rules = theorySec?.content?.rules || [];
  const sentenceTargets = practiceSec?.content?.sentenceBuilderTargets || [
    "I am from Indonesia.",
    "They are students at London University.",
    "She is not from Spain but Italy.",
  ];
  const questions = practiceSec?.content?.questions || [];

  // Step 3: Interactive Builder state
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const activeTargetSentence = sentenceTargets[currentTargetIdx] || sentenceTargets[0];
  const targetWords = activeTargetSentence.replace(/[.?!]/g, "").split(/\s+/);
  
  // Scramble words
  const [availableWords, setAvailableWords] = useState<string[]>(() => {
    return [...targetWords].sort(() => Math.random() - 0.5);
  });
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [builderStatus, setBuilderStatus] = useState<"idle" | "correct" | "wrong">("idle");

  // Step 4: Writing challenge state
  const [writtenBio, setWrittenBio] = useState("");
  const [bioSubmitted, setBioSubmitted] = useState(false);

  // Step 5: Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const handleWordClick = (word: string, fromSelected: boolean) => {
    if (fromSelected) {
      setSelectedWords((prev) => prev.filter((_, i) => i !== prev.indexOf(word)));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      setAvailableWords((prev) => prev.filter((_, i) => i !== prev.indexOf(word)));
      setSelectedWords((prev) => [...prev, word]);
    }
    setBuilderStatus("idle");
  };

  const handleCheckSentence = () => {
    const built = selectedWords.join(" ").toLowerCase();
    const target = targetWords.join(" ").toLowerCase();
    if (built === target) {
      setBuilderStatus("correct");
      onRewardXp(25);
    } else {
      setBuilderStatus("wrong");
    }
  };

  const handleNextTargetSentence = () => {
    if (currentTargetIdx + 1 < sentenceTargets.length) {
      const nextIdx = currentTargetIdx + 1;
      setCurrentTargetIdx(nextIdx);
      const nextWords = sentenceTargets[nextIdx].replace(/[.?!]/g, "").split(/\s+/);
      setAvailableWords([...nextWords].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
      setBuilderStatus("idle");
    }
  };

  const wordCount = writtenBio.trim().split(/\s+/).filter(Boolean).length;
  const hasCapitalLetter = /[A-Z]/.test(writtenBio);
  const hasToBeVerb = /\b(am|is|are|'m|'s|'re)\b/i.test(writtenBio);
  const hasPeriod = /[.!?]/.test(writtenBio);

  const writingKeyConcepts: KeyConceptItem[] = [
    {
      id: "subj-verb-comp",
      title: "Subject + Verb + Complement",
      description: "Formula baku kalimat afirmatif: Liam (Subject) is (Verb) from Melbourne (Complement).",
      example: "Liam is from Melbourne, Australia.",
    },
    {
      id: "to-be-match",
      title: "Subjek-Verb Agreement",
      description: "Pasangkan subjek dengan tepat: 'I' -> am, singular (he/she/it) -> is, plural (we/they) -> are.",
      example: "She is a student. / They are here.",
    },
    {
      id: "capital-rules",
      title: "Kapitalisasi Wajib",
      description: "Huruf kapital wajib untuk awal kalimat, kata ganti 'I', nama orang, negara, dan kebangsaan.",
      example: "I am Indonesian and he is French.",
    },
    {
      id: "period-finish",
      title: "Tanda Titik Final (.)",
      description: "Setiap kalimat afirmatif lengkap harus diakhiri dengan tanda baca titik tanpa spasi sebelum titik.",
      example: "We are from Jakarta.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* STEP 1: Minimalist Demia-style Audio Hero & Key Concepts */}
      {activeStepId === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TutorAudioStage
            instructionText="Welcome to the writing lab! Every solid English sentence is built with a clear blueprint: Subject, followed by the verb to be, and completed with a complement. Review the mechanics below."
            encouragementText="Precision and clear punctuation make your writing shine!"
            skillLabel="WRITING MISSION"
          />


          {/* Lesson Recap */}
          <div className="space-y-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Lesson Recap
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              In this session, we break down the fundamental building blocks of English affirmative sentences: Subject, Verb ('to be'), and Complement. We will master capitalization rules for names, nationalities, and origins, and ensure consistent terminal punctuation.
            </p>
          </div>

          <KeyConceptsGrid
            concepts={writingKeyConcepts}
            onCheckItem={() => onRewardXp(10)}
          />
        </div>
      )}

      {/* STEP 2: Spot & Fix Mechanics (Capitalization & Punctuation) */}
      {activeStepId === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block font-mono">
              Step 2 · Interactive Writing Mechanics
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Cari & Perbaiki Huruf Kapital (*Spot & Fix*)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Kuasai aturan mekanika penulisan agar teks buatanmu profesional. Temukan kata yang perlu diperbaiki:
            </p>
          </div>

          <SpotAndFixMechanics
            rules={rules}
            onRewardXp={onRewardXp}
          />
        </div>
      )}

      {/* STEP 3: Interactive Word Chip Sentence Builder */}
      {activeStepId === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block font-mono">
                Step 3 · Word Chip Sentence Builder ({currentTargetIdx + 1}/{sentenceTargets.length})
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">
                Target {currentTargetIdx + 1} of {sentenceTargets.length}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Susun Balok Kata Menjadi Kalimat Yang Benar
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ketuk kata-kata di bawah untuk menyusunnya ke dalam slot kalimat dengan urutan yang tepat:
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Target Hint */}
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Target Meaning / Goal:</span>
              <span className="font-bold text-amber-600">Klik kata untuk memindahkan</span>
            </div>

            {/* Selected Words Canvas */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border-2 border-dashed border-amber-300 dark:border-amber-700/60 flex flex-wrap items-center gap-2.5">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Pilih balok kata dari bawah untuk menyusun kalimat...</span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWordClick(word, true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-sm hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available Word Bank */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Word Bank
              </span>
              <div className="flex flex-wrap gap-2.5">
                {availableWords.map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleWordClick(word, false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAvailableWords([...targetWords].sort(() => Math.random() - 0.5));
                  setSelectedWords([]);
                  setBuilderStatus("idle");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-3">
                {builderStatus === "correct" && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Susunan Sempurna!</span>
                  </span>
                )}
                {builderStatus === "wrong" && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    Susunan belum tepat, coba lagi!
                  </span>
                )}

                {builderStatus === "correct" && currentTargetIdx + 1 < sentenceTargets.length ? (
                  <button
                    type="button"
                    onClick={handleNextTargetSentence}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Next Target Sentence ➔
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckSentence}
                    disabled={selectedWords.length === 0}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    Check Structure
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Guided Profile Writing Lab */}
      {activeStepId === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block font-mono">
              Step 4 · Guided Self-Introduction Writing Lab
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Tulis Paragraf Perkenalan Diri (3-5 Kalimat)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Gunakan aturan huruf kapital, kata kerja 'to be', dan nama negaramu. Contoh: *"Hello! My name is Aditya. I am from Jakarta, Indonesia. I am a student."*
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <textarea
              rows={4}
              value={writtenBio}
              onChange={(e) => setWrittenBio(e.target.value)}
              placeholder="Start writing here... (Hello, my name is...)"
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            {/* Live Automated Mechanics Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${
                wordCount >= 10 ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>{wordCount} Words (Min 10)</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${
                hasCapitalLetter ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>Huruf Kapital</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${
                hasToBeVerb ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>Ada Verb 'to be'</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${
                hasPeriod ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>Tanda Baca Titik (.)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Target: 3-5 kalimat perkenalan utuh</span>
              <button
                type="button"
                onClick={() => {
                  setBioSubmitted(true);
                  onRewardXp(30);
                }}
                disabled={wordCount < 10}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & Validate Profile</span>
              </button>
            </div>

            {bioSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validasi Berhasil! (+30 XP)</span>
                </span>
                <p>Paragraf perkenalanmu memenuhi kriteria struktur sintaksis dasar bahasa Inggris tingkat CEFR A1.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: Writing Syntax Evaluation Quiz */}
      {activeStepId === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block font-mono">
              Step 5 · Writing Syntax Evaluation ({questions.length} Questions)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Evaluasi Mekanika Penulisan & Tata Bahasa
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Pilih opsi yang memiliki konstruksi kalimat, tanda baca, dan huruf kapital yang paling tepat:
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((q: any, qIdx: number) => {
              const selectedOpt = quizAnswers[q.id || `q-${qIdx}`];
              const isAnswered = Boolean(selectedOpt);

              return (
                <div
                  key={q.id || qIdx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <span className="text-xs font-black text-amber-600 uppercase font-mono">
                    Question {qIdx + 1} of {questions.length}
                  </span>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(q.options || []).map((opt: string, optIdx: number) => {
                      const isChosen = selectedOpt === opt;
                      const isCorrect = opt === q.answer;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            if (!quizAnswers[q.id || `q-${qIdx}`]) {
                              if (isCorrect) onRewardXp(20);
                            }
                            setQuizAnswers((prev) => ({ ...prev, [q.id || `q-${qIdx}`]: opt }));
                          }}
                          className={`p-4 rounded-2xl text-left text-sm font-semibold border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                            isChosen
                              ? isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm"
                                : "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200"
                              : isAnswered && isCorrect
                              ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-300"
                          }`}
                        >
                          <span>{opt}</span>
                          {isChosen && (
                            isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="text-xs font-bold text-red-600">✕</span>
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && q.explanation && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                      💡 <span className="font-bold">Penjelasan:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
