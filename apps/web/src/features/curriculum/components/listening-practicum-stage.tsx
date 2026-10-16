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
    tutor.playTutorAudio(currentQ.audioText);
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

    if (currentQ.type === "arrange") {
      const sentence = normalizeSentence(assembledWords.join(" "));
      const target = normalizeSentence(currentQ.targetSentence || "");
      correct = cleanAlphanumeric(sentence) === cleanAlphanumeric(target);
    } else if (currentQ.type === "dictation") {
      const inputClean = cleanAlphanumeric(dictationInput);
      const targetClean = cleanAlphanumeric(currentQ.targetWord || "");
      const fullClean = cleanAlphanumeric(currentQ.audioText || "");

      // 1. Direct target word match (e.g. "tshirt" === "t-shirt")
      let match = inputClean === targetClean;

      // 2. Full sentence match (if learner typed full sentence)
      if (!match && fullClean && (inputClean === fullClean || inputClean.includes(targetClean))) {
        match = true;
      }

      // 3. Suffix match (e.g. "this t-shirt")
      if (!match && inputClean.endsWith(targetClean)) {
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
    } else {
      setIsCompletedAll(true);
      playMatchSuccessSound();
      onRewardXp(50);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAssembledWords([]);
    setDictationInput("");
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
          <span className="text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-semibold">
            {typeLabels[currentQ.type as keyof typeof typeLabels] || "Listening Practicum"}
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
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {currentQ.instruction}
          </p>

          {/* Audio Button with Visual Replay Limit Counter (Max 3) */}
          <button
            type="button"
            disabled={playsRemaining === 0}
            onClick={handlePlayAudio}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer ${
              playsRemaining === 0
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75"
                : "bg-[#0D3B66] hover:bg-[#1B4965] text-white active:scale-95"
            }`}
          >
            <Volume2
              className={`w-4 h-4 ${playsRemaining === 0 ? "text-slate-400" : "text-[#F4B41A]"}`}
            />
            <span>{playsRemaining === 0 ? "No Plays Left" : "Play Question Audio"}</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-tight font-black ${
                playsRemaining === 0
                  ? "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  : playsRemaining === 1
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-white/20 text-white"
              }`}
            >
              {playsRemaining}/3 left
            </span>
          </button>
        </div>

        {/* 3. Interactive Inputs based on Question Type */}
        <div className="pt-2">
          {/* TYPE A: Tap & Arrange */}
          {currentQ.type === "arrange" && (
            <div className="space-y-4">
              {/* Assembled Word Slot */}
              <div className="p-4 rounded-xl min-h-[56px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                {assembledWords.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Tap the words below to assemble the sentence...
                  </span>
                ) : (
                  assembledWords.map((w, wIdx) => (
                    <button
                      key={wIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => handleRemoveWord(wIdx)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D3B66] text-white text-xs font-bold transition-all hover:bg-rose-600 cursor-pointer"
                    >
                      {w}
                    </button>
                  ))
                )}
              </div>

              {/* Available Word Bank */}
              <div className="flex flex-wrap items-center gap-2">
                {availableWords.map((w: string, wIdx: number) => (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={isChecked}
                    onClick={() => handleTapWord(w)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-indigo-500 transition-all cursor-pointer shadow-2xs"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TYPE B: Dictation */}
          {currentQ.type === "dictation" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
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
                placeholder="Type the missing word here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
              />
            </div>
          )}
        </div>

        {/* 4. Feedback & Explanation Box */}
        {isChecked && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 animate-in fade-in duration-200 ${
              isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Correct Answer! (+15 XP)</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Incorrect</span>
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
                (currentQ.type === "arrange" && assembledWords.length === 0) ||
                (currentQ.type === "dictation" && !dictationInput.trim())
              }
              className="px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ml-auto"
            >
              <span>
                {currentIdx < questions.length - 1 ? "Next Question" : "View Practicum Results"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
