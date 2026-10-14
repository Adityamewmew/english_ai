"use client";

import React, { useState } from "react";
import {
  Volume2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound, playSnapSound } from "@/lib/sound-fx";

export interface PracticumQuestion {
  id: number;
  type: "arrange" | "dictation" | "true_false";
  audioText: string;
  instruction: string;
  // For arrange:
  targetSentence?: string;
  words?: string[];
  // For dictation:
  promptSentence?: string;
  targetWord?: string;
  hint?: string;
  // For true_false:
  statement?: string;
  isTrue?: boolean;
  explanation: string;
}

const DEFAULT_PRACTICUM_QUESTIONS: PracticumQuestion[] = [
  // Soal 1-4: Susun Kata (Tap & Arrange)
  {
    id: 1,
    type: "arrange",
    audioText: "Nice shirt.",
    instruction: "Dengarkan audio, lalu susun kata-kata berikut sesuai urutan yang diucapkan Jamie:",
    targetSentence: "Nice shirt.",
    words: ["shirt.", "Nice", "jacket.", "Good"],
    explanation: "Jamie memulai percakapan dengan pujian singkat: 'Nice shirt.' (Bagus kausmu).",
  },
  {
    id: 2,
    type: "arrange",
    audioText: "What's your name?",
    instruction: "Dengarkan audio, lalu susun kalimat tanya yang diucapkan penutur:",
    targetSentence: "What's your name?",
    words: ["name?", "your", "What's", "Where's"],
    explanation: "Bentuk singkatan dari 'What is your name?' diucapkan alami menjadi 'What's your name?'.",
  },
  {
    id: 3,
    type: "arrange",
    audioText: "I'm a Barcelona fan too.",
    instruction: "Dengarkan audio, lalu susun pernyataan Jamie tentang klub sepak bola favoritnya:",
    targetSentence: "I'm a Barcelona fan too.",
    words: ["too.", "Barcelona", "a", "fan", "I'm", "Madrid"],
    explanation: "Jamie menyatakan bahwa ia juga fans Barcelona: 'I'm a Barcelona fan too.'",
  },
  {
    id: 4,
    type: "arrange",
    audioText: "Spain is a beautiful country!",
    instruction: "Dengarkan audio, lalu susun kalimat penutup dari Marta tentang Spanyol:",
    targetSentence: "Spain is a beautiful country!",
    words: ["country!", "beautiful", "Spain", "is", "a", "big"],
    explanation: "Marta merespons asal Jamie dengan: 'Spain is a beautiful country!'.",
  },

  // Soal 5-7: Dengar & Ketik (Audio Dictation)
  {
    id: 5,
    type: "dictation",
    audioText: "Where are you from, Jamie?",
    instruction: "Dengarkan klip audio, lalu ketik kata yang hilang untuk melengkapi kalimat tanya:",
    promptSentence: "Marta: \"Where are you _____, Jamie?\"",
    targetWord: "from",
    hint: "Kata depan (preposition) penunjuk asal negara",
    explanation: "Kata yang tepat adalah 'from' untuk menanyakan negara asal: 'Where are you from?'.",
  },
  {
    id: 6,
    type: "dictation",
    audioText: "It's the new Barcelona shirt.",
    instruction: "Dengarkan audio, lalu ketik kata benda terakhir yang diucapkan Marta:",
    promptSentence: "Marta: \"It's the new Barcelona _____.\"",
    targetWord: "shirt",
    hint: "Pakaian atasan / kaus",
    explanation: "Marta menyebutkan kaus Barcelona miliknya: 'shirt'.",
  },
  {
    id: 7,
    type: "dictation",
    audioText: "I live in a town called Teruel.",
    instruction: "Dengarkan audio, lalu ketik nama kota tempat tinggal Jamie:",
    promptSentence: "Jamie: \"I live in a town called _____.\"",
    targetWord: "teruel",
    hint: "Nama kota di Spanyol yang disebutkan Jamie",
    explanation: "Jamie tinggal di kota bernama Teruel: 'a town called Teruel'.",
  },

  // Soal 8-10: Benar atau Salah (Audio True/False)
  {
    id: 8,
    type: "true_false",
    audioText: "I know. I'm a Barcelona fan too. What's your name?",
    instruction: "Dengarkan potongan audio, lalu tentukan apakah pernyataan berikut Benar atau Salah:",
    statement: "Pernyataan: Baik Jamie maupun Marta sama-sama penggemar klub sepak bola Barcelona.",
    isTrue: true,
    explanation: "Benar. Marta memakai kaus baru Barcelona, dan Jamie merespons: 'I'm a Barcelona fan too.'",
  },
  {
    id: 9,
    type: "true_false",
    audioText: "I'm from Spain. I live in a town called Teruel.",
    instruction: "Dengarkan potongan audio, lalu tentukan apakah pernyataan berikut Benar atau Salah:",
    statement: "Pernyataan: Jamie menyatakan bahwa ia berasal dari Italia.",
    isTrue: false,
    explanation: "Salah. Jamie dengan jelas mengatakan 'I'm from Spain', bukan dari Italia.",
  },
  {
    id: 10,
    type: "true_false",
    audioText: "Nice shirt. Thank you! It's the new Barcelona shirt.",
    instruction: "Dengarkan potongan audio, lalu tentukan apakah pernyataan berikut Benar atau Salah:",
    statement: "Pernyataan: Jamie mengawali percakapan dengan memuji sepatu baru Marta.",
    isTrue: false,
    explanation: "Salah. Jamie memuji kaus Marta ('Nice shirt'), bukan sepatunya.",
  },
];

interface ListeningPracticumStageProps {
  tutor: any;
  onRewardXp: (amount: number) => void;
}

export function ListeningPracticumStage({
  tutor,
  onRewardXp,
}: ListeningPracticumStageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [dictationInput, setDictationInput] = useState("");
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null);

  const [checkedStatus, setCheckedStatus] = useState<Record<number, boolean>>({});
  const [isCorrectStatus, setIsCorrectStatus] = useState<Record<number, boolean>>({});
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  const questions = DEFAULT_PRACTICUM_QUESTIONS;
  const currentQ = questions[currentIdx];
  const isChecked = Boolean(checkedStatus[currentQ.id]);
  const isCorrect = Boolean(isCorrectStatus[currentQ.id]);

  const handlePlayAudio = (e?: React.MouseEvent) => {
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
      const sentence = assembledWords.join(" ");
      correct = sentence.trim().toLowerCase() === currentQ.targetSentence?.toLowerCase();
    } else if (currentQ.type === "dictation") {
      correct = dictationInput.trim().toLowerCase() === currentQ.targetWord?.toLowerCase();
    } else if (currentQ.type === "true_false") {
      correct = selectedTrueFalse === currentQ.isTrue;
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
      setSelectedTrueFalse(null);
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
    setSelectedTrueFalse(null);
    setCheckedStatus({});
    setIsCorrectStatus({});
    setIsCompletedAll(false);
  };

  const typeLabels = {
    arrange: "Susun Kata (Tap & Arrange)",
    dictation: "Dikte Kata (Fill-in-the-Blank)",
    true_false: "Benar atau Salah (True / False)",
  };

  const correctCount = Object.values(isCorrectStatus).filter(Boolean).length;

  if (isCompletedAll) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Praktikum Menyimak Selesai!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Kamu berhasil menyelesaikan seluruh 10 tantangan menyimak dengan skor:
          </p>
          <div className="text-3xl font-black text-[#0D3B66] dark:text-[#F4B41A] pt-2">
            {correctCount} / 10 Benar
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Praktikum</span>
          </button>
        </div>
      </div>
    );
  }

  // Available words for arrange
  const availableWords = (currentQ.words || []).filter((w, idx) => {
    const timesUsed = assembledWords.filter((used) => used === w).length;
    const occurrencesBefore = (currentQ.words || []).slice(0, idx + 1).filter((orig) => orig === w).length;
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
            {typeLabels[currentQ.type]}
          </span>
        </div>

        {/* 10-Step Progress Track */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex gap-0.5">
          {questions.map((_, i) => (
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

      {/* 2. Question Prompt & Audio Player Card */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {currentQ.instruction}
          </p>

          <button
            type="button"
            onClick={handlePlayAudio}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Volume2 className="w-4 h-4 text-[#F4B41A]" />
            <span>Putar Audio Soal</span>
          </button>
        </div>

        {/* 3. Interactive Inputs based on Question Type */}
        <div className="pt-2">
          {/* TYPE A: Susun Kata (Tap & Arrange) */}
          {currentQ.type === "arrange" && (
            <div className="space-y-4">
              {/* Assembled Word Slot */}
              <div className="p-4 rounded-xl min-h-[56px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                {assembledWords.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Ketuk kata di bawah untuk menyusun kalimat...
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
                {availableWords.map((w, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={isChecked}
                    onClick={() => handleTapWord(w)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-[#0D3B66] transition-all cursor-pointer shadow-2xs"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TYPE B: Dikte Kata (Dictation) */}
          {currentQ.type === "dictation" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentQ.promptSentence}
                </span>
                {currentQ.hint && (
                  <span className="block text-xs text-slate-400 mt-1">
                    Petunjuk: {currentQ.hint}
                  </span>
                )}
              </div>

              <input
                type="text"
                disabled={isChecked}
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                placeholder="Ketik kata yang kamu dengar..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
              />
            </div>
          )}

          {/* TYPE C: Benar atau Salah (True / False) */}
          {currentQ.type === "true_false" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                {currentQ.statement}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isChecked}
                  onClick={() => setSelectedTrueFalse(true)}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedTrueFalse === true
                      ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300"
                  }`}
                >
                  Benar (True)
                </button>
                <button
                  type="button"
                  disabled={isChecked}
                  onClick={() => setSelectedTrueFalse(false)}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedTrueFalse === false
                      ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300"
                  }`}
                >
                  Salah (False)
                </button>
              </div>
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
                  <span>Jawaban Tepat! (+15 XP)</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Kurang tepat</span>
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
                (currentQ.type === "dictation" && !dictationInput.trim()) ||
                (currentQ.type === "true_false" && selectedTrueFalse === null)
              }
              className="px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs ml-auto"
            >
              <span>{currentIdx < questions.length - 1 ? "Soal Selanjutnya" : "Lihat Hasil Praktikum"}</span>
              <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
