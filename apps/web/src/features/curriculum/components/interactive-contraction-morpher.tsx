"use client";

import React, { useState, useRef } from "react";
import { Sparkles, ArrowRight, Volume2, CheckCircle2, Zap, HelpCircle } from "lucide-react";
import { animate } from "animejs";
import { animeButtonPop, animeShake, animeFloatingXp } from "@/lib/anime-effects";
import { playPopSound, playSnapSound, playMatchSuccessSound, playErrorSound } from "@/lib/sound-fx";

interface ContractionPair {
  subject: string;
  verb: string;
  vowelDropped: string;
  remainder: string;
  contracted: string;
  exampleFull: string;
  exampleContracted: string;
}

const CONTRACTION_DATA: ContractionPair[] = [
  {
    subject: "I",
    verb: "am",
    vowelDropped: "a",
    remainder: "m",
    contracted: "I'm",
    exampleFull: "I am twelve years old.",
    exampleContracted: "I'm twelve years old.",
  },
  {
    subject: "He",
    verb: "is",
    vowelDropped: "i",
    remainder: "s",
    contracted: "He's",
    exampleFull: "He is from Spain.",
    exampleContracted: "He's from Spain.",
  },
  {
    subject: "She",
    verb: "is",
    vowelDropped: "i",
    remainder: "s",
    contracted: "She's",
    exampleFull: "She is from China.",
    exampleContracted: "She's from China.",
  },
  {
    subject: "We",
    verb: "are",
    vowelDropped: "a",
    remainder: "re",
    contracted: "We're",
    exampleFull: "We are international students.",
    exampleContracted: "We're international students.",
  },
  {
    subject: "They",
    verb: "are",
    vowelDropped: "a",
    remainder: "re",
    contracted: "They're",
    exampleFull: "They are from Japan.",
    exampleContracted: "They're from Japan.",
  },
];

interface InteractiveContractionMorpherProps {
  onRewardXp: (amount: number) => void;
  embedded?: boolean;
}

export function InteractiveContractionMorpher({
  onRewardXp,
  embedded = false,
}: InteractiveContractionMorpherProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContracted, setIsContracted] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean>(false);
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  const vowelRef = useRef<HTMLSpanElement>(null);
  const apostropheRef = useRef<HTMLSpanElement>(null);
  const morpherBoxRef = useRef<HTMLDivElement>(null);
  const floatingXpRef = useRef<HTMLDivElement>(null);

  const current = CONTRACTION_DATA[currentIndex];

  const handleToggleMorph = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    const willContract = !isContracted;
    setIsContracted(willContract);

    if (willContract) {
      playSnapSound();
      // Animate vowel dropping out and apostrophe dropping in
      if (vowelRef.current) {
        animate(vowelRef.current, {
          scale: [1, 0],
          opacity: [1, 0],
          translateY: [0, -18],
          duration: 350,
          ease: "outQuad",
        });
      }
      if (apostropheRef.current) {
        animate(apostropheRef.current, {
          scale: [0, 1.3, 1],
          opacity: [0, 1],
          translateY: [-24, 0],
          duration: 400,
          ease: "outBack",
        });
      }
      if (morpherBoxRef.current) {
        animate(morpherBoxRef.current, {
          scale: [0.98, 1.02, 1],
          duration: 350,
          ease: "outBack",
        });
      }
    } else {
      playPopSound();
      if (vowelRef.current) {
        animate(vowelRef.current, {
          scale: [0, 1],
          opacity: [0, 1],
          translateY: [-18, 0],
          duration: 300,
          ease: "outBack",
        });
      }
      if (apostropheRef.current) {
        animate(apostropheRef.current, {
          scale: [1, 0],
          opacity: [1, 0],
          translateY: [0, -24],
          duration: 250,
          ease: "inQuad",
        });
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectWord = (idx: number, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setCurrentIndex(idx);
    setIsContracted(false);
    setQuizAnswer(null);
    setQuizPassed(false);
  };

  const handleQuizAnswer = (letter: string, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setQuizAnswer(letter);

    if (letter === current.vowelDropped) {
      playMatchSuccessSound();
      setQuizPassed(true);
      onRewardXp(10);

      setFloatingScore("+10 XP!");
      setTimeout(() => {
        if (floatingXpRef.current) {
          animeFloatingXp(floatingXpRef.current, () => setFloatingScore(null));
        }
      }, 20);
    } else {
      playErrorSound();
      setQuizPassed(false);
      animeShake(e.currentTarget as HTMLElement);
    }
  };

  return (
    <div
      className={
        embedded
          ? "relative space-y-6"
          : "relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
      }
    >
      {/* Floating XP */}
      {floatingScore && (
        <div
          ref={floatingXpRef}
          className="absolute top-8 right-8 z-40 pointer-events-none px-4 py-2 rounded-full bg-emerald-500 text-white font-black text-sm shadow-xl flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{floatingScore}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Grammar · The Contraction Morpher</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            How Verb 'To Be' Contracts in Real Speech
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            English speakers squash subject pronouns and verbs together. An apostrophe replaces the dropped vowel!
          </p>
        </div>
      </div>

      {/* Subject Tab Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CONTRACTION_DATA.map((item, idx) => (
          <button
            key={item.subject}
            onClick={(e) => handleSelectWord(idx, e)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 border ${
              currentIndex === idx
                ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            {item.subject} + {item.verb} ➔ {item.contracted}
          </button>
        ))}
      </div>

      {/* Morpher Squash Stage */}
      <div
        ref={morpherBoxRef}
        className="bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-blue-500/10 dark:from-violet-950/40 dark:via-purple-900/20 dark:to-blue-950/30 border border-violet-200 dark:border-violet-800/60 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
          {isContracted ? "Contracted Form (Spoken / Casual)" : "Full Form (Formal / Written)"}
        </div>

        {/* Big Morphing Visual */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-4xl sm:text-6xl font-black font-mono select-none py-2">
          {/* Subject */}
          <span className="text-slate-900 dark:text-white tracking-tight">{current.subject}</span>

          {/* Morphing Vowel & Apostrophe Zone */}
          <div className="relative inline-flex items-center justify-center mx-1">
            {/* The Vowel that drops */}
            <span
              ref={vowelRef}
              className={`text-violet-600 dark:text-violet-400 transition-colors ${
                isContracted ? "hidden" : "inline-block"
              }`}
            >
              &nbsp;{current.vowelDropped}
            </span>

            {/* The Apostrophe that drops in */}
            <span
              ref={apostropheRef}
              className={`text-amber-500 font-extrabold ${isContracted ? "inline-block" : "hidden"}`}
            >
              '
            </span>
          </div>

          {/* Remainder of the verb */}
          <span className="text-slate-900 dark:text-white">{current.remainder}</span>
        </div>

        {/* Action Button: Squash / Expand */}
        <button
          onClick={handleToggleMorph}
          className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer ${
            isContracted
              ? "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              : "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isContracted ? "Expand to Full Form" : "Squash & Morph into Contraction!"}</span>
        </button>

        {/* Spoken Context Example Card */}
        <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 border border-violet-200/60 dark:border-violet-900/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              In Real Context
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isContracted ? current.exampleContracted : current.exampleFull}
            </span>
          </div>
          <button
            onClick={() => speakText(isContracted ? current.exampleContracted : current.exampleFull)}
            className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 hover:bg-violet-200 transition-colors shrink-0"
            title="Listen to American pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Test Yourself Challenge */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <HelpCircle className="w-4 h-4 text-violet-500" />
          <span>
            Quick Check: Which vowel disappears when contracting &quot;{current.subject} {current.verb}&quot;?
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["a", "e", "i", "o", "u"].map((letter) => {
            const isSelected = quizAnswer === letter;
            const isCorrect = letter === current.vowelDropped;

            return (
              <button
                key={letter}
                onClick={(e) => handleQuizAnswer(letter, e)}
                disabled={quizPassed}
                className={`w-10 h-10 rounded-xl font-black text-sm transition-all border cursor-pointer ${
                  quizPassed && isCorrect
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                    : isSelected && !isCorrect
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400"
                }`}
              >
                {letter}
              </button>
            );
          })}

          {quizPassed && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct! The apostrophe takes the spot of &apos;{current.vowelDropped}&apos;.</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
