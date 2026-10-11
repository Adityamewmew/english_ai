"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Check, RefreshCw, Trophy, Zap, Flame } from "lucide-react";
import { animeButtonPop, animeShake, animeFloatingXp } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound, playErrorSound, playFanfareSound } from "@/lib/sound-fx";

export interface MatchPairItem {
  id: string;
  country: string;
  nationality: string;
  flag?: string;
  example?: string;
}

interface GamifiedMatchPairsProps {
  items: Array<{ word: string; meaning: string; phonetic?: string; example?: string }>;
  onRewardXp: (amount: number) => void;
  onIncrementCombo: () => void;
  onResetCombo: () => void;
  embedded?: boolean;
}

export function GamifiedMatchPairs({
  items,
  onRewardXp,
  onIncrementCombo,
  onResetCombo,
  embedded = false,
}: GamifiedMatchPairsProps) {
  const [shuffledCountries, setShuffledCountries] = useState<Array<{ id: string; text: string }>>([]);
  const [shuffledNationalities, setShuffledNationalities] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedNationalityId, setSelectedNationalityId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [floatingScore, setFloatingScore] = useState<string | null>(null);
  const [errorPair, setErrorPair] = useState<{ countryId: string; natId: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingXpRef = useRef<HTMLDivElement>(null);

  // Initialize pairs from curriculum data (up to 6 pairs for a crisp game loop)
  const initializeGame = () => {
    const rawPairs = items.slice(0, 6).map((item, idx) => ({
      id: `pair-${idx}-${item.word.toLowerCase()}`,
      country: item.word,
      nationality: item.meaning,
    }));

    // If less than 4, fallback to core starter pairs
    const pairs =
      rawPairs.length >= 4
        ? rawPairs
        : [
            { id: "pair-0", country: "Spain", nationality: "Spanish" },
            { id: "pair-1", country: "Japan", nationality: "Japanese" },
            { id: "pair-2", country: "Brazil", nationality: "Brazilian" },
            { id: "pair-3", country: "China", nationality: "Chinese" },
            { id: "pair-4", country: "the UK", nationality: "British" },
            { id: "pair-5", country: "the USA", nationality: "American" },
          ];

    const countries = pairs.map((p) => ({ id: p.id, text: p.country })).sort(() => Math.random() - 0.5);
    const nationalities = pairs.map((p) => ({ id: p.id, text: p.nationality })).sort(() => Math.random() - 0.5);

    setShuffledCountries(countries);
    setShuffledNationalities(nationalities);
    setSelectedCountryId(null);
    setSelectedNationalityId(null);
    setMatchedIds(new Set());
    setIsCompleted(false);
    setErrorPair(null);
  };

  useEffect(() => {
    initializeGame();
  }, [items]);

  // Handle Country selection
  const handleCountryClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (matchedIds.has(id)) return;
    animeButtonPop(e.currentTarget);
    playPopSound();
    setSelectedCountryId(id);

    // If nationality is already selected, verify match
    if (selectedNationalityId) {
      checkMatch(id, selectedNationalityId);
    }
  };

  // Handle Nationality selection
  const handleNationalityClick = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (matchedIds.has(id)) return;
    animeButtonPop(e.currentTarget);
    playPopSound();
    setSelectedNationalityId(id);

    // If country is already selected, verify match
    if (selectedCountryId) {
      checkMatch(selectedCountryId, id);
    }
  };

  // Match validation
  const checkMatch = (cId: string, nId: string) => {
    if (cId === nId) {
      // MATCH!
      playMatchSuccessSound();
      const updated = new Set(matchedIds);
      updated.add(cId);
      setMatchedIds(updated);

      setSelectedCountryId(null);
      setSelectedNationalityId(null);
      setErrorPair(null);

      onRewardXp(10);
      onIncrementCombo();

      // Trigger floating score animation
      setFloatingScore("+10 XP!");
      setTimeout(() => {
        if (floatingXpRef.current) {
          animeFloatingXp(floatingXpRef.current, () => setFloatingScore(null));
        }
      }, 20);

      // Check if all matched
      if (updated.size === shuffledCountries.length) {
        setIsCompleted(true);
        playFanfareSound();
        onRewardXp(30);
      }
    } else {
      // MISMATCH!
      playErrorSound();
      setErrorPair({ countryId: cId, natId: nId });
      onResetCombo();

      const elC = document.getElementById(`country-btn-${cId}`);
      const elN = document.getElementById(`nat-btn-${nId}`);
      if (elC) animeShake(elC);
      if (elN) animeShake(elN);

      setTimeout(() => {
        setSelectedCountryId(null);
        setSelectedNationalityId(null);
        setErrorPair(null);
      }, 500);
    }
  };

  return (
    <div
      ref={containerRef}
      className={
        embedded
          ? "relative space-y-6"
          : "relative bg-gradient-to-br from-indigo-900/10 via-blue-500/5 to-purple-500/10 dark:from-indigo-950/40 dark:via-blue-900/20 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Mini-Game · Match Madness</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Pair Countries with Their Nationalities
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Tap a country on the left, then connect its matching nationality on the right.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs font-mono">
            {matchedIds.size} / {shuffledCountries.length} Paired
          </span>
          <button
            onClick={initializeGame}
            title="Reset Game"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating XP Animation Badge */}
      {floatingScore && (
        <div
          ref={floatingXpRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none px-4 py-2 rounded-full bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-500/40 flex items-center gap-1.5"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>{floatingScore}</span>
        </div>
      )}

      {/* Game Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Countries */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider px-1">
            Country Origin
          </div>
          <div className="space-y-2">
            {shuffledCountries.map((c) => {
              const isMatched = matchedIds.has(c.id);
              const isSelected = selectedCountryId === c.id;
              const isError = errorPair?.countryId === c.id;

              return (
                <button
                  key={c.id}
                  id={`country-btn-${c.id}`}
                  disabled={isMatched}
                  onClick={(e) => handleCountryClick(c.id, e)}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-between cursor-pointer border ${
                    isMatched
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 opacity-80 cursor-default"
                      : isError
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/30"
                      : isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md ring-4 ring-blue-500/25 scale-[1.02]"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xs"
                  }`}
                >
                  <span className="truncate">{c.text}</span>
                  {isMatched && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Nationalities */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider px-1">
            Nationality
          </div>
          <div className="space-y-2">
            {shuffledNationalities.map((n) => {
              const isMatched = matchedIds.has(n.id);
              const isSelected = selectedNationalityId === n.id;
              const isError = errorPair?.natId === n.id;

              return (
                <button
                  key={n.id}
                  id={`nat-btn-${n.id}`}
                  disabled={isMatched}
                  onClick={(e) => handleNationalityClick(n.id, e)}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-between cursor-pointer border ${
                    isMatched
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 opacity-80 cursor-default"
                      : isError
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/30"
                      : isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-4 ring-indigo-500/25 scale-[1.02]"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xs"
                  }`}
                >
                  <span className="truncate">{n.text}</span>
                  {isMatched && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-between flex-wrap gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h4 className="font-black text-lg">Match Master Achieved!</h4>
              <p className="text-xs text-white/90">
                You correctly linked all countries with their nationalities! (+30 Bonus XP awarded)
              </p>
            </div>
          </div>
          <button
            onClick={initializeGame}
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
