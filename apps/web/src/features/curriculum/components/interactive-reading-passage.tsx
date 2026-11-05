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

  // Group sentences by paragraph for natural editorial flow while maintaining global indexing
  const paragraphSentences: Array<Array<{ sentence: string; index: number }>> = useMemo(() => {
    let globalIndex = 0;
    return safeParagraphs.map((paragraphText: string) => {
      const pStr = typeof paragraphText === "string" ? paragraphText : String(paragraphText ?? "");
      const matches = pStr.match(/[^.!?]+[.!?]+(\s+|$)/g);
      const pSentences = (matches || [pStr])
        .map((s: string) => s.trim())
        .filter(Boolean);
      return pSentences.map((sentence: string) => {
        const item = { sentence, index: globalIndex };
        globalIndex++;
        return item;
      });
    });
  }, [safeParagraphs]);

  // Flattened array of all sentences for playback queue
  const sentences = useMemo(
    () => paragraphSentences.flat().map((item) => item.sentence),
    [paragraphSentences]
  );

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
          ? "space-y-6"
          : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 max-w-3xl mx-auto"
      }
    >
      {/* Clean Editorial Audio & Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {passage.audioText && (
            <button
              type="button"
              onClick={handlePlayFull}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-heading font-bold transition-all shadow-xs cursor-pointer min-h-[40px] touch-manipulation ${
                isPlayingFull
                  ? "btn-skeuo-navy text-white animate-pulse"
                  : "btn-skeuo-yellow text-[#0F172A]"
              }`}
            >
              {isPlayingFull ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingFull ? "Playing Audio..." : "Play Entire Passage"}</span>
            </button>
          )}

          {activeSentenceIndex !== null && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-heading font-semibold text-xs border border-slate-200 dark:border-slate-700">
              <Volume2 className="w-3.5 h-3.5 text-[#10375C] dark:text-[#F4B41A]" />
              <span>
                Sentence {activeSentenceIndex + 1} of {sentences.length}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSpotlightEnabled(!spotlightEnabled)}
            className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all flex items-center gap-1.5 border cursor-pointer min-h-[36px] touch-manipulation ${
              spotlightEnabled
                ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-2xs"
                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
            }`}
            title="Toggle vocabulary and grammar underlines"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{spotlightEnabled ? "Underlines: On" : "Underlines: Off"}</span>
          </button>
        </div>
      </div>

      {/* Floating active token hint: Tactile bottom card on mobile, neat bar on desktop */}
      {activeTokenHint && (
        <div className="fixed bottom-24 sm:bottom-auto inset-x-3 sm:inset-x-auto sm:static z-50 p-4 rounded-2xl bg-[#10375C] text-white flex items-center justify-between gap-3 shadow-xl sm:shadow-sm border border-white/20 sm:border-[#092238] animate-in slide-in-from-bottom-3 sm:fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                animeButtonPop(e.currentTarget);
                onPlayAudio?.(activeTokenHint.word);
              }}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-[#F3C623] flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 border border-white/10"
              title={`Listen to pronunciation of "${activeTokenHint.word}"`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div className="text-xs min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F3C623] text-slate-950">
                  {activeTokenHint.label}
                </span>
                <span className="font-heading font-bold text-sm text-white">
                  &ldquo;{activeTokenHint.word}&rdquo;
                </span>
              </div>
              <p className="font-sans text-slate-200 text-xs leading-relaxed">
                {activeTokenHint.desc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTokenHint(null)}
            className="text-xs px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-heading font-bold cursor-pointer shrink-0 transition-colors touch-manipulation active:scale-95"
          >
            Close
          </button>
        </div>
      )}

      {/* Natural Editorial Book / Story Passage Canvas */}
      <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-10 border border-slate-200/70 dark:border-slate-800 shadow-xs max-w-2xl mx-auto">
        <div className="space-y-6 sm:space-y-7">
          {paragraphSentences.map((pItems, pIdx) => (
            <p
              key={pIdx}
              className="font-sans text-[17px] sm:text-[19px] leading-[2.0] text-slate-800 dark:text-slate-100 font-normal tracking-normal"
            >
              {pItems.map(({ sentence, index: sIdx }: { sentence: string; index: number }) => {
                const isActive = activeSentenceIndex === sIdx;
                const words = sentence.split(/(\s+|[.,!?;:()]+)/);

                return (
                  <span
                    key={sIdx}
                    onClick={(e) => handlePlaySentence(sIdx, sentence, e)}
                    className={`inline cursor-pointer transition-all duration-200 rounded-lg px-1.5 py-0.5 mr-1 ${
                      isActive
                        ? "bg-amber-100/90 dark:bg-amber-950/60 text-slate-950 dark:text-amber-100 ring-2 ring-amber-300/70 shadow-xs"
                        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                    }`}
                    title="Tap sentence to listen"
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
                              className={`inline cursor-pointer transition-colors border-b-2 border-dotted ${
                                isGrammar
                                  ? "border-sky-600/80 dark:border-sky-400 text-sky-950 dark:text-sky-200 font-medium hover:border-solid hover:border-sky-800"
                                  : "border-emerald-600/80 dark:border-emerald-400 text-emerald-950 dark:text-emerald-200 font-medium hover:border-solid hover:border-emerald-800"
                              }`}
                            >
                              {token}
                            </span>
                          );
                        })}
                  </span>
                );
              })}
            </p>
          ))}
        </div>

        {/* Quiet footer hint */}
        <div className="pt-6 mt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
            Tap any sentence to listen · Tap underlined words for grammar &amp; vocabulary explanations
          </p>
        </div>
      </div>
    </div>
  );
}
