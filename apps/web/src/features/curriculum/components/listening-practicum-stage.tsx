"use client";

import React, { useState, useMemo } from "react";
import {
  Volume2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound, playSnapSound } from "@/lib/sound-fx";
import {
  PracticumQuestion,
  cleanWord,
  normalizeSentence,
  cleanAlphanumeric,
} from "./listening-practicum-utils";

export type { PracticumQuestion };

interface ListeningPracticumStageProps {
  quizSec?: any;
  practiceSec?: any;
  questions?: PracticumQuestion[];
  tutor: any;
  onRewardXp: (amount: number) => void;
  onFinish?: () => void;
}

const MAX_AUDIO_PLAYS = 3;

export function ListeningPracticumStage({
  quizSec,
  practiceSec,
  questions: passedQuestions,
  tutor,
  onRewardXp,
  onFinish,
}: ListeningPracticumStageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [dictationInput, setDictationInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [checkedStatus, setCheckedStatus] = useState<Record<number, boolean>>({});
  const [isCorrectStatus, setIsCorrectStatus] = useState<Record<number, boolean>>({});
  const [audioPlayCounts, setAudioPlayCounts] = useState<Record<number, number>>({});
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  // Load questions strictly from module JSON (via quizSec or practiceSec)
  const questions: PracticumQuestion[] = useMemo(() => {
    if (passedQuestions && passedQuestions.length > 0) return passedQuestions;

    return (
      quizSec?.content?.questions ||
      quizSec?.content?.practicumQuestions ||
      practiceSec?.content?.practicumQuestions ||
      []
    );
  }, [passedQuestions, quizSec, practiceSec]);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No listening practicum questions available for this module yet.
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];
  const isChecked = Boolean(checkedStatus[currentQ.id]);
  const isCorrect = Boolean(isCorrectStatus[currentQ.id]);

  const isMC = Boolean(currentQ.options && currentQ.options.length > 0);
  const isArrange = !isMC && (currentQ.type === "arrange" || Boolean(currentQ.words && currentQ.words.length > 0));
  const isDictation = !isMC && !isArrange;

  const currentPlays = audioPlayCounts[currentQ.id] || 0;
  const playsRemaining = Math.max(0, MAX_AUDIO_PLAYS - currentPlays);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    if (playsRemaining <= 0) return;
    setAudioPlayCounts((prev) => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + 1,
    }));
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const textToSpeak = (
      currentQ.audioText ||
      (currentQ as any).audio ||
      currentQ.targetSentence ||
      currentQ.promptSentence ||
      (currentQ as any).question ||
      ""
    )
      .replace(/_{2,}/g, "blank")
      .replace(/[\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (textToSpeak) {
      tutor?.playTutorAudio?.(textToSpeak);
    }
  };

  const handleTapWord = (word: string) => {
    if (isChecked) return;
    playSnapSound();
    setAssembledWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (wordIdx: number) => {
    if (isChecked) return;
    playPopSound();
    setAssembledWords((prev) => prev.filter((_, idx) => idx !== wordIdx));
  };

  const handleCheckAnswer = () => {
    let correct = false;

    if (isArrange) {
      const sentence = normalizeSentence(assembledWords.join(" "));
      const target = normalizeSentence(currentQ.targetSentence || "");
      correct = cleanAlphanumeric(sentence) === cleanAlphanumeric(target);
    } else if (isMC) {
      const expected = ((currentQ as any).answer || (currentQ as any).correctAnswer || "").trim().toLowerCase();
      correct = selectedOption.trim().toLowerCase() === expected;
    } else {
      const inputClean = cleanAlphanumeric(dictationInput);
      const targetClean = cleanAlphanumeric(currentQ.targetWord || (currentQ as any).answer || "");
      const fullClean = cleanAlphanumeric(currentQ.audioText || currentQ.targetSentence || "");

      // 1. Direct target word match (e.g. "tshirt" === "t-shirt")
      let match = inputClean === targetClean;

      // 2. Full sentence match (if learner typed full sentence)
      if (!match && fullClean && (inputClean === fullClean || inputClean.includes(targetClean))) {
        match = true;
      }

      // 3. Suffix match (e.g. "this t-shirt")
      if (!match && targetClean && inputClean.endsWith(targetClean)) {
        match = true;
      }

      correct = match;
    }

    if (correct) {
      playMatchSuccessSound();
      onRewardXp(15);
    } else {
      playPopSound();
    }

    setCheckedStatus((prev) => ({ ...prev, [currentQ.id]: true }));
    setIsCorrectStatus((prev) => ({ ...prev, [currentQ.id]: correct }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setAssembledWords([]);
      setDictationInput("");
      setSelectedOption("");
    } else {
      setIsCompletedAll(true);
      playMatchSuccessSound();
      onRewardXp(50);
      onFinish?.();
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAssembledWords([]);
    setDictationInput("");
    setSelectedOption("");
    setCheckedStatus({});
    setIsCorrectStatus({});
    setAudioPlayCounts({});
    setIsCompletedAll(false);
  };

  const typeLabels = {
    arrange: "Sentence Assembly (Tap & Arrange)",
    dictation: "Audio Dictation (Fill-in-the-Blank)",
    true_false: "True or False",
  };

  const correctCount = Object.values(isCorrectStatus).filter(Boolean).length;

  // Render prompt sentence with highlighted glowing blank badge
  const renderedPrompt = useMemo(() => {
    let raw = currentQ.promptSentence || "";

    // Safeguard: if _____ is missing but targetWord exists, insert _____
    if (!raw.includes("_____") && currentQ.targetWord) {
      const cleanTarget = cleanWord(currentQ.targetWord);
      const idx = raw.toLowerCase().indexOf(cleanTarget.toLowerCase());
      if (idx !== -1) {
        raw = raw.slice(0, idx) + "_____" + raw.slice(idx + cleanTarget.length);
      }
    }

    const parts = raw.split("_____");
    if (parts.length < 2) {
      return <span>{raw}</span>;
    }

    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-flex items-center justify-center px-3 py-1 mx-1.5 rounded-lg border-2 border-dashed border-[#0D3B66] dark:border-[#F4B41A] bg-amber-100/80 dark:bg-amber-950/80 text-[#0D3B66] dark:text-[#F4B41A] font-mono font-black text-xs sm:text-sm tracking-wider shadow-2xs align-middle">
                [ _____ ]
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  }, [currentQ.promptSentence, currentQ.targetWord]);

  if (isCompletedAll) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Listening Practicum Complete!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You completed all 10 interactive listening tasks:
          </p>
          <div className="text-3xl font-black text-[#0D3B66] dark:text-[#F4B41A] pt-2">
            {correctCount} / {questions.length} Correct
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Practicum</span>
          </button>
          {onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
            >
              <span>Complete Mission</span>
              <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Available words for arrange
  const availableWords = (currentQ.words || []).filter((w: string, idx: number) => {
    const timesUsed = assembledWords.filter((used: string) => used === w).length;
    const occurrencesBefore = (currentQ.words || [])
      .slice(0, idx + 1)
      .filter((orig: string) => orig === w).length;
    return timesUsed < occurrencesBefore;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Progress Bar */}
      <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#0D3B66] dark:text-[#F4B41A] font-mono uppercase tracking-wider">
            Soal {currentIdx + 1} dari {questions.length}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-semibold">
            {isArrange
              ? "Susun Kalimat"
              : isDictation
              ? "Dikte Kosakata"
              : "Pilihan Ganda"}
          </span>
        </div>

        {/* 10-Step Progress Track */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex gap-0.5">
          {questions.map((_: any, i: number) => (
            <div
              key={i}
              className={`flex-1 h-full transition-all ${
                i < currentIdx
                  ? isCorrectStatus[questions[i].id]
                    ? "bg-emerald-500"
                    : "bg-amber-400"
                  : i === currentIdx
                  ? "bg-[#0D3B66] dark:bg-[#F4B41A]"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Question Prompt & Audio Player Card with 3-Play Limiter */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
            {currentQ.instruction || "Dengarkan audio dan lengkapi latihan di bawah ini:"}
          </p>

          {/* Audio Button with Visual Replay Limit Counter (Max 3) */}
          <button
            type="button"
            disabled={playsRemaining === 0}
            onClick={handlePlayAudio}
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer min-h-[46px] select-none ${
              playsRemaining === 0
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75"
                : "bg-[#0D3B66] hover:bg-[#1B4965] text-white active:scale-95 border-b-3 border-b-[#082542]"
            }`}
          >
            <Volume2
              className={`w-4 h-4 ${playsRemaining === 0 ? "text-slate-400" : "text-[#F4B41A]"}`}
            />
            <span>{playsRemaining === 0 ? "Batas Putar Habis" : "Putar Audio Soal"}</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-tight font-black ${
                playsRemaining === 0
                  ? "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  : playsRemaining === 1
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-white/20 text-white"
              }`}
            >
              Sisa {playsRemaining}/3
            </span>
          </button>
        </div>

        {/* 3. Interactive Inputs based on Question Type */}
        <div className="pt-2">
          {/* TYPE A: Tap & Arrange */}
          {isArrange && (
            <div className="space-y-3.5">
              {/* Assembled Word Slot */}
              <div className="p-3.5 sm:p-4 rounded-2xl min-h-[58px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 shadow-inner">
                {assembledWords.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Ketuk kata-kata di bank kata bawah untuk menyusun kalimat...
                  </span>
                ) : (
                  assembledWords.map((w, wIdx) => (
                    <button
                      key={wIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => handleRemoveWord(wIdx)}
                      className="px-3.5 py-2 rounded-xl bg-[#0D3B66] text-white text-xs font-bold transition-all hover:bg-rose-600 cursor-pointer border-b-2 border-b-[#082542] active:scale-95 select-none min-h-[38px] flex items-center gap-1"
                      title="Ketuk untuk membatalkan kata"
                    >
                      <span>{w}</span>
                      <span className="text-[10px] opacity-70 ml-0.5">✕</span>
                    </button>
                  ))
                )}
              </div>

              {/* Available Word Bank (Tactile >=44px touch targets on mobile) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {availableWords.map((w: string, wIdx: number) => (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={isChecked}
                    onClick={() => handleTapWord(w)}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-3 border-b-slate-300 dark:border-b-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:border-[#0D3B66] transition-all cursor-pointer shadow-2xs active:border-b active:translate-y-0.5 min-h-[44px] select-none"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TYPE B: Dictation */}
          {isDictation && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {renderedPrompt}
              </div>

              <input
                type="text"
                disabled={isChecked}
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isChecked && dictationInput.trim()) {
                    handleCheckAnswer();
                  }
                }}
                placeholder="Ketik kata yang hilang di sini..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] min-h-[48px]"
              />
            </div>
          )}

          {/* TYPE C: Multiple Choice */}
          {isMC && (
            <div className="space-y-3">
              {(currentQ as any).question && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {(currentQ as any).question}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options?.map((opt: string, optIdx: number) => {
                  const isSelected = selectedOption === opt;
                  const isAnswer =
                    isChecked &&
                    opt.trim().toLowerCase() ===
                      ((currentQ as any).answer || (currentQ as any).correctAnswer || "").trim().toLowerCase();
                  const isWrongSelected = isChecked && isSelected && !isAnswer;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => setSelectedOption(opt)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all cursor-pointer min-h-[48px] flex items-center justify-between gap-3 ${
                        isAnswer
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                          : isWrongSelected
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200"
                          : isSelected
                          ? "bg-[#0D3B66]/10 dark:bg-amber-400/10 border-[#0D3B66] dark:border-amber-400 text-[#0D3B66] dark:text-amber-300 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <span>{opt}</span>
                      {isChecked && isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isChecked && isWrongSelected && <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Feedback & Explanation Box */}
        {isChecked && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 animate-in fade-in duration-200 ${
              isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Jawaban Tepat! (+15 XP)</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Kurang Tepat</span>
                </>
              )}
            </div>
            <p className="font-normal">{currentQ.explanation}</p>
          </div>
        )}

        {/* 5. Action Row */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {!isChecked ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={
                (isArrange && assembledWords.length === 0) ||
                (isDictation && !dictationInput.trim()) ||
                (isMC && !selectedOption)
              }
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] border-b-3 border-b-[#082542] active:border-b-0 active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs min-h-[46px]"
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl btn-skeuo-yellow text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ml-auto min-h-[46px]"
            >
              <span>
                {currentIdx < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil Latihan"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
