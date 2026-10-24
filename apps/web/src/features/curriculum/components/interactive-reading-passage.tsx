"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Volume2, Play, Pause, Eye, Info } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface ReadingPassage {
  title: string;
  paragraphs: string[];
  audioText?: string;
}

interface InteractiveReadingPassageProps {
  passage: ReadingPassage;
  onPlayAudio?: (text: string) => void;
  embedded?: boolean;
  linguisticTarget?: any;
}

const CORE_GRAMMAR_SPOTLIGHT: Record<string, { type: "grammar" | "vocab"; label: string; desc: string }> = {
  "am": { type: "grammar", label: "To Be (1st Person)", desc: "Subject complement for 'I'" },
  "i'm": { type: "grammar", label: "Contraction", desc: "Short for 'I am'" },
  "is": { type: "grammar", label: "To Be (Singular)", desc: "Subject complement for 'He / She / It'" },
  "he's": { type: "grammar", label: "Contraction", desc: "Short for 'He is'" },
  "she's": { type: "grammar", label: "Contraction", desc: "Short for 'She is'" },
  "are": { type: "grammar", label: "To Be (Plural)", desc: "Subject complement for 'We / They' or 'You'" },
  "we're": { type: "grammar", label: "Contraction", desc: "Short for 'We are'" },
  "they're": { type: "grammar", label: "Contraction", desc: "Short for 'They are'" },
  "isn't": { type: "grammar", label: "Negative Contraction", desc: "Short for 'is not'" },
  "aren't": { type: "grammar", label: "Negative Contraction", desc: "Short for 'are not'" },
};

export function InteractiveReadingPassage({
  passage,
  onPlayAudio,
  embedded = false,
  linguisticTarget,
}: InteractiveReadingPassageProps) {
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [spotlightEnabled, setSpotlightEnabled] = useState(true);
  const [activeTokenHint, setActiveTokenHint] = useState<{ word: string; label: string; desc: string } | null>(null);

  const spotlightDict = useMemo(() => {
    const dict: Record<string, { type: "grammar" | "vocab"; label: string; desc: string }> = {
      ...CORE_GRAMMAR_SPOTLIGHT,
    };

    const vocabList: any[] =
      (Array.isArray((passage as any)?.vocabTargets) ? (passage as any).vocabTargets : null) ||
      (Array.isArray(linguisticTarget?.vocabTargets) ? linguisticTarget.vocabTargets : null) ||
      (Array.isArray((passage as any)?.vocabulary) ? (passage as any).vocabulary : null) ||
      [];

    vocabList.forEach((v: any) => {
      const word = (v.word || v.en || v.term || "").trim().toLowerCase();
      if (word) {
        dict[word] = {
          type: "vocab",
          label: v.type || "Key Vocabulary",
          desc: v.meaning || v.transformed || v.desc || "Target vocabulary",
        };
      }
      const transformed = (v.transformed || "").trim().toLowerCase();
      if (transformed && !transformed.includes("/") && !transformed.includes(" ")) {
        dict[transformed] = {
          type: "vocab",
          label: v.type || "Key Vocabulary",
          desc: v.meaning || v.desc || `Key word form: ${word}`,
        };
      }
    });

    return dict;
  }, [passage, linguisticTarget]);

  const safeParagraphs = Array.isArray(passage?.paragraphs)
    ? passage.paragraphs
    : typeof (passage as any)?.text === "string"
    ? [(passage as any).text]
    : [];

  // Split all paragraphs into individual sentences
  const sentences = safeParagraphs
    .flatMap((p) => p.match(/[^.!?]+[.!?]+(\s+|$)/g) || [p])
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playQueue = (index: number) => {
    if (index >= sentences.length) {
      setIsPlayingFull(false);
      setActiveSentenceIndex(null);
      return;
    }
    setActiveSentenceIndex(index);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(sentences[index]);
      utt.lang = "en-US";
      utt.rate = 0.92;
      utt.onend = () => {
        playQueue(index + 1);
      };
      utt.onerror = () => {
        setIsPlayingFull(false);
        setActiveSentenceIndex(null);
      };
      window.speechSynthesis.speak(utt);
    } else {
      onPlayAudio?.(sentences[index]);
      setIsPlayingFull(false);
    }
  };

  const handlePlaySentence = (idx: number, text: string, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    if (isPlayingFull) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingFull(false);
    }
    setActiveSentenceIndex(idx);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      utt.rate = 0.92;
      window.speechSynthesis.speak(utt);
    } else {
      onPlayAudio?.(text);
    }
  };

  const handlePlayFull = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    if (isPlayingFull) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingFull(false);
      setActiveSentenceIndex(null);
      return;
    }
    if (sentences.length === 0) return;
    setIsPlayingFull(true);
    playQueue(0);
  };

  return (
    <div
      className={
        embedded
          ? "space-y-5"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-2 rounded-[22px] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5"
      }
    >
      {/* Header with Title and Full Audio Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0D3B66] text-[#F4B41A] flex items-center justify-center shrink-0 border-b-2 border-[#082542] shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#0D3B66] dark:text-[#F4B41A] tracking-wider font-mono">
                Step 3 · Guided Reading
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4B41A]/20 text-[#0D3B66] dark:text-[#F4B41A] border border-[#F4B41A]/40">
                Karaoke Audio
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {passage.title || (passage as any).passageTitle || "Reading Passage"}
            </h3>
          </div>
        </div>

        {passage.audioText && (
          <button
            type="button"
            onClick={handlePlayFull}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer min-h-[44px] touch-manipulation w-full sm:w-auto ${
              isPlayingFull
                ? "btn-skeuo-navy text-white animate-pulse"
                : "btn-skeuo-yellow text-[#0F172A]"
            }`}
          >
            {isPlayingFull ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlayingFull ? "Playing Audio..." : "Play Entire Passage"}</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Tap any sentence to listen. Tap highlighted words for explanations.</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSpotlightEnabled(!spotlightEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer min-h-[38px] touch-manipulation ${
              spotlightEnabled
                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{spotlightEnabled ? "Word Highlight: On" : "Word Highlight: Off"}</span>
          </button>
          {activeSentenceIndex !== null && (
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-xs">
              {activeSentenceIndex + 1}/{sentences.length}
            </span>
          )}
        </div>
      </div>

      {/* Floating active token hint: Tactile bottom card on mobile, static on desktop */}
      {activeTokenHint && (
        <div className="fixed bottom-24 sm:bottom-auto inset-x-3 sm:inset-x-auto sm:static z-50 p-3.5 sm:p-4 rounded-2xl bg-[#0D3B66] text-white flex items-center justify-between gap-3 shadow-2xl sm:shadow-xs border border-white/20 sm:border-[#082542] animate-in slide-in-from-bottom-3 sm:fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                animeButtonPop(e.currentTarget);
                onPlayAudio?.(activeTokenHint.word);
              }}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-[#F4B41A] flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 border border-white/10"
              title={`Listen to pronunciation of "${activeTokenHint.word}"`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div className="text-xs min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F4B41A] text-slate-950">
                  {activeTokenHint.label}
                </span>
                <span className="font-bold text-sm text-white">
                  &ldquo;{activeTokenHint.word}&rdquo;
                </span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {activeTokenHint.desc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTokenHint(null)}
            className="text-xs px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold cursor-pointer shrink-0 transition-colors touch-manipulation active:scale-95"
          >
            Close
          </button>
        </div>
      )}

      {/* Interactive Sentence-by-Sentence Board */}
      <div className="space-y-2 sm:space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-3.5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        {sentences.map((sentence, sIdx) => {
          const isActive = activeSentenceIndex === sIdx;

          // Tokenize sentence for soft spotlight
          const words = sentence.split(/(\s+|[.,!?;:()]+)/);

          return (
            <div
              key={sIdx}
              onClick={(e) => handlePlaySentence(sIdx, sentence, e)}
              className={`p-3 sm:p-3.5 rounded-xl transition-all flex items-start gap-2.5 sm:gap-3 cursor-pointer select-none border border-b-2 min-h-[48px] touch-manipulation ${
                isActive
                  ? "bg-[#0D3B66]/10 dark:bg-[#0D3B66]/30 border-[#0D3B66] dark:border-[#F4B41A] shadow-xs"
                  : "bg-white dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-colors shrink-0 mt-0.5 border-b-2 ${
                  isActive
                    ? "bg-[#0D3B66] text-[#F4B41A] border-[#082542]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#0D3B66]"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              <span
                className={`text-sm leading-relaxed ${
                  isActive
                    ? "text-[#0D3B66] dark:text-[#F4B41A] font-medium"
                    : "text-slate-700 dark:text-slate-300 font-medium"
                }`}
              >
                {!spotlightEnabled
                  ? sentence
                  : words.map((token: string, wIdx: number) => {
                      const cleanWord = token.trim().toLowerCase().replace(/[.,!?;:()]/g, "");
                      const match = spotlightDict[cleanWord];

                      if (!match) {
                        return <React.Fragment key={wIdx}>{token}</React.Fragment>;
                      }

                      const isGrammar = match.type === "grammar";

                      return (
                        <span
                          key={wIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            animeButtonPop(e.currentTarget as HTMLElement);
                            setActiveTokenHint({
                              word: token,
                              label: match.label,
                              desc: match.desc,
                            });
                          }}
                          title={`${match.label}: ${match.desc}`}
                          className={`inline-block px-1 py-0.5 rounded-md cursor-pointer transition-all ${
                            isGrammar
                              ? "bg-[#0D3B66]/15 dark:bg-[#0D3B66]/35 text-[#0D3B66] dark:text-[#F4B41A] font-bold border-b border-[#0D3B66]/40 dark:border-[#F4B41A]/50 hover:bg-[#0D3B66]/25"
                              : "bg-emerald-500/15 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold border-b border-emerald-500/40 hover:bg-emerald-500/25"
                          }`}
                        >
                          {token}
                        </span>
                      );
                    })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
