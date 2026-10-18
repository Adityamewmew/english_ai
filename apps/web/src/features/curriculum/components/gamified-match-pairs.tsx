"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, RefreshCw, Trophy, Zap, Cable } from "lucide-react";
import { animeButtonPop, animeShake, animeFloatingXp } from "@/lib/anime-effects";
import {
  playPopSound,
  playMatchSuccessSound,
  playErrorSound,
  playFanfareSound,
} from "@/lib/sound-fx";

const ROPE_COLORS = [
  "#0D3B66", // Navy
  "#D97706", // Amber
  "#059669", // Emerald
  "#7C3AED", // Violet
  "#E11D48", // Crimson
  "#0284C7", // Sky
];

export interface MatchPairItem {
  id: string;
  word?: string;
  meaning?: string;
}

interface GamifiedMatchPairsProps {
  items: Array<{ word: string; meaning: string; phonetic?: string; example?: string }>;
  onRewardXp: (amount: number) => void;
  onIncrementCombo: () => void;
  onResetCombo: () => void;
  embedded?: boolean;
  onCompleted?: () => void;
}

export function GamifiedMatchPairs({
  items,
  onRewardXp,
  onIncrementCombo,
  onResetCombo,
  embedded = false,
  onCompleted,
}: GamifiedMatchPairsProps) {
  const [shuffledWords, setShuffledWords] = useState<Array<{ id: string; text: string }>>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [floatingScore, setFloatingScore] = useState<string | null>(null);
  const [errorPair, setErrorPair] = useState<{ wordId: string; meaningId: string } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSide, setDragSide] = useState<"left" | "right" | null>(null);
  const [, setResizeTick] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const floatingXpRef = useRef<HTMLDivElement>(null);

  const initializeGame = () => {
    const rawPairs = (items || []).slice(0, 6).map((item, idx) => ({
      id: `pair-${idx}-${(item.word || "").toLowerCase()}`,
      word: item.word || `Kata ${idx + 1}`,
      meaning: item.meaning || `Arti ${idx + 1}`,
    }));

    const pairs =
      rawPairs.length >= 4
        ? rawPairs
        : [
            { id: "pair-0", word: "athlete", meaning: "atlet / olahragawan" },
            { id: "pair-1", word: "country", meaning: "negara" },
            { id: "pair-2", word: "nationality", meaning: "kewarganegaraan" },
            { id: "pair-3", word: "swimmer", meaning: "perenang" },
            { id: "pair-4", word: "amazing", meaning: "luar biasa / mengagumkan" },
            { id: "pair-5", word: "favourite", meaning: "favorit / kesukaan" },
          ];

    setShuffledWords(pairs.map((p) => ({ id: p.id, text: p.word })).sort(() => Math.random() - 0.5));
    setShuffledMeanings(pairs.map((p) => ({ id: p.id, text: p.meaning })).sort(() => Math.random() - 0.5));
    setSelectedWordId(null);
    setSelectedMeaningId(null);
    setMatchedIds(new Set());
    setIsCompleted(false);
    setErrorPair(null);
    setMousePos(null);
    setIsDragging(false);
  };

  useEffect(() => {
    initializeGame();
  }, [items]);

  useEffect(() => {
    const handleResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPinPos = useCallback((id: string, side: "left" | "right") => {
    if (!boardRef.current) return null;
    const pinEl = document.getElementById(`${side}-pin-${id}`);
    if (!pinEl) return null;
    const boardRect = boardRef.current.getBoundingClientRect();
    const pinRect = pinEl.getBoundingClientRect();
    return {
      x: pinRect.left + pinRect.width / 2 - boardRect.left,
      y: pinRect.top + pinRect.height / 2 - boardRect.top,
    };
  }, []);

  const checkMatch = (wId: string, mId: string) => {
    if (wId === mId) {
      playMatchSuccessSound();
      const updated = new Set(matchedIds);
      updated.add(wId);
      setMatchedIds(updated);
      setSelectedWordId(null);
      setSelectedMeaningId(null);
      setErrorPair(null);
      setMousePos(null);
      setIsDragging(false);
      onRewardXp(10);
      onIncrementCombo();

      setFloatingScore("+10 XP!");
      setTimeout(() => {
        if (floatingXpRef.current) {
          animeFloatingXp(floatingXpRef.current, () => setFloatingScore(null));
        }
      }, 20);

      if (updated.size === shuffledWords.length) {
        setIsCompleted(true);
        playFanfareSound();
        onRewardXp(30);
        onCompleted?.();
      }
    } else {
      playErrorSound();
      setErrorPair({ wordId: wId, meaningId: mId });
      onResetCombo();
      const elW = document.getElementById(`word-card-${wId}`);
      const elM = document.getElementById(`meaning-card-${mId}`);
      if (elW) animeShake(elW);
      if (elM) animeShake(elM);

      setTimeout(() => {
        setSelectedWordId(null);
        setSelectedMeaningId(null);
        setErrorPair(null);
        setMousePos(null);
        setIsDragging(false);
      }, 500);
    }
  };

  const handleWordClick = (id: string, e?: React.MouseEvent) => {
    if (matchedIds.has(id)) return;
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setSelectedWordId(id);
    if (selectedMeaningId) checkMatch(id, selectedMeaningId);
  };

  const handleMeaningClick = (id: string, e?: React.MouseEvent) => {
    if (matchedIds.has(id)) return;
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setSelectedMeaningId(id);
    if (selectedWordId) checkMatch(selectedWordId, id);
  };

  const handleBoardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boardRef.current || (!isDragging && !selectedWordId && !selectedMeaningId)) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - boardRect.left, y: e.clientY - boardRect.top });
  };

  const handleBoardPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const targetEl = document.elementFromPoint(e.clientX, e.clientY);
    if (targetEl) {
      if (dragSide === "left" && selectedWordId) {
        const meaningCard = targetEl.closest("[data-meaning-id]");
        const mId = meaningCard?.getAttribute("data-meaning-id");
        if (mId) checkMatch(selectedWordId, mId);
      } else if (dragSide === "right" && selectedMeaningId) {
        const wordCard = targetEl.closest("[data-word-id]");
        const wId = wordCard?.getAttribute("data-word-id");
        if (wId) checkMatch(wId, selectedMeaningId);
      }
    }
    setIsDragging(false);
  };

  const startDrag = (id: string, side: "left" | "right", e: React.PointerEvent) => {
    if (matchedIds.has(id)) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    setDragSide(side);
    if (side === "left") {
      setSelectedWordId(id);
      handleWordClick(id);
    } else {
      setSelectedMeaningId(id);
      handleMeaningClick(id);
    }
  };

  const makeBezier = (p1: { x: number; y: number }, p2: { x: number; y: number }, dir = "ltr") => {
    const dx = Math.max(35, Math.abs(p2.x - p1.x) * 0.45);
    const cx1 = dir === "ltr" ? p1.x + dx : p1.x - dx;
    const cx2 = dir === "ltr" ? p2.x - dx : p2.x + dx;
    return `M ${p1.x} ${p1.y} C ${cx1} ${p1.y}, ${cx2} ${p2.y}, ${p2.x} ${p2.y}`;
  };

  const liveRope = (() => {
    if (selectedWordId) {
      const p1 = getPinPos(selectedWordId, "left");
      if (!p1) return null;
      return { path: makeBezier(p1, mousePos || { x: p1.x + 45, y: p1.y + 10 }, "ltr") };
    }
    if (selectedMeaningId) {
      const p1 = getPinPos(selectedMeaningId, "right");
      if (!p1) return null;
      return { path: makeBezier(p1, mousePos || { x: p1.x - 45, y: p1.y + 10 }, "rtl") };
    }
    return null;
  })();

  const renderCard = (item: { id: string; text: string }, side: "left" | "right") => {
    const isLeft = side === "left";
    const isMatched = matchedIds.has(item.id);
    const isSelected = isLeft ? selectedWordId === item.id : selectedMeaningId === item.id;
    const isError = isLeft ? errorPair?.wordId === item.id : errorPair?.meaningId === item.id;
    const pairIndex = shuffledWords.findIndex((x) => x.id === item.id);
    const ropeColor = ROPE_COLORS[Math.max(0, pairIndex) % ROPE_COLORS.length];

    return (
      <div
        key={item.id}
        id={`${isLeft ? "word" : "meaning"}-card-${item.id}`}
        {...(isLeft ? { "data-word-id": item.id } : { "data-meaning-id": item.id })}
        onClick={() => (isLeft ? handleWordClick(item.id) : handleMeaningClick(item.id))}
        className={`relative w-full text-left px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-between cursor-pointer border select-none min-h-[48px] min-w-0 touch-manipulation ${
          isMatched
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 cursor-default"
            : isError
            ? "bg-[#9E1B1B]/10 border-[#9E1B1B] text-[#9E1B1B] border-b-2 ring-2 ring-[#9E1B1B]/30"
            : isSelected
            ? "btn-skeuo-navy scale-[1.02] shadow-md ring-2 ring-[#0D3B66]/30 dark:ring-[#F4B41A]/50"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 border-b-2 border-b-slate-300 dark:border-b-slate-700 hover:border-[#0D3B66]/40 active:translate-y-[1px]"
        }`}
      >
        <span className={`line-clamp-2 leading-tight ${isLeft ? "sm:pr-4" : "sm:pl-3"}`}>{item.text}</span>
        {isMatched && (
          <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}

        {/* Cable Connector Pin (Visible on desktop for dragging, hidden on mobile for clean tap-to-match) */}
        <div
          id={`${side}-pin-${item.id}`}
          data-pin-id={item.id}
          data-pin-side={side}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag(item.id, side, e);
          }}
          className={`absolute ${isLeft ? "-right-3" : "-left-3"} top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 transition-all items-center justify-center shadow-xs z-30 cursor-grab active:cursor-grabbing hidden sm:flex ${
            isMatched
              ? "bg-white dark:bg-slate-900"
              : isSelected
              ? "bg-[#0D3B66] dark:bg-[#F4B41A] border-white scale-110 shadow-md ring-4 ring-[#0D3B66]/20"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:scale-110"
          }`}
          style={isMatched ? { borderColor: ropeColor } : undefined}
        >
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              isSelected ? "bg-white scale-125" : isMatched ? "" : "bg-slate-400 dark:bg-slate-500"
            }`}
            style={isMatched ? { backgroundColor: ropeColor } : undefined}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        embedded
          ? "relative space-y-6"
          : "relative card-skeuo bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6"
      }
    >
      {/* 1. Header Toolbar with Generous Whitespace */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-[#0D3B66]/10 dark:bg-[#0D3B66]/30 text-[#0D3B66] dark:text-[#F4B41A] border border-[#0D3B66]/20 font-bold text-xs flex items-center gap-1.5 font-mono">
            <Cable className="w-3.5 h-3.5 text-[#F4B41A]" />
            <span className="hidden sm:inline">Cable Match Wiring</span>
            <span className="sm:hidden inline">Tap to Match</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Drag or click pins to connect English words with their Indonesian meanings
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 sm:hidden inline">
            Sentuh kata kiri lalu artinya di kanan
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 border-b-2 border-b-slate-300 dark:border-b-slate-700 shadow-2xs font-mono">
            {matchedIds.size} / {shuffledWords.length} Cocok
          </span>
          <button
            type="button"
            onClick={initializeGame}
            title="Reset Game"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-b-2 border-b-slate-300 dark:border-b-slate-700 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all active:translate-y-[1px] cursor-pointer shadow-2xs min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {floatingScore && (
        <div
          ref={floatingXpRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none px-4 py-2 rounded-full bg-[#F4B41A] text-[#0D3B66] font-black text-lg border-b-2 border-[#DDA012] shadow-xl shadow-amber-500/30 flex items-center gap-1.5"
        >
          <Zap className="w-5 h-5 fill-[#0D3B66]" />
          <span>{floatingScore}</span>
        </div>
      )}

      {/* 2. Interactive Wire-Board Container */}
      <div
        ref={boardRef}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={handleBoardPointerUp}
        className="relative pt-2 pb-4 select-none touch-none"
      >
        {/* SVG Cable Connection Overlay (Visible on desktop for drag-and-drop cable wiring) */}
        <svg className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          {/* A. Permanently Matched Ropes */}
          {Array.from(matchedIds).map((id) => {
            const p1 = getPinPos(id, "left");
            const p2 = getPinPos(id, "right");
            if (!p1 || !p2) return null;
            const pairIndex = shuffledWords.findIndex((w) => w.id === id);
            const color = ROPE_COLORS[Math.max(0, pairIndex) % ROPE_COLORS.length];
            const pathD = makeBezier(p1, p2, "ltr");

            return (
              <g key={id} className="animate-in fade-in duration-300">
                <path d={pathD} fill="none" stroke={color} strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                <path d={pathD} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
                <path d={pathD} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 4" />
              </g>
            );
          })}

          {/* B. Mismatch Error Rope */}
          {errorPair && (() => {
            const p1 = getPinPos(errorPair.wordId, "left");
            const p2 = getPinPos(errorPair.meaningId, "right");
            if (!p1 || !p2) return null;
            return (
              <path
                d={makeBezier(p1, p2, "ltr")}
                fill="none"
                stroke="#9E1B1B"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })()}

          {/* C. Live In-Progress Rope (Tarik Tali) */}
          {liveRope && (
            <g>
              <path d={liveRope.path} fill="none" stroke="#F4B41A" strokeWidth="6" strokeOpacity="0.35" strokeLinecap="round" />
              <path d={liveRope.path} fill="none" stroke="#0D3B66" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="5 3" />
              {mousePos && (
                <circle cx={mousePos.x} cy={mousePos.y} r="6" fill="#F4B41A" stroke="#0D3B66" strokeWidth="2.5" className="animate-pulse" />
              )}
            </g>
          )}
        </svg>

        {/* Two-Column Grid with responsive gap */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-14 md:gap-20 relative">
          <div className="space-y-3">
            <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider px-1">
              English Words
            </div>
            <div className="space-y-2.5">
              {shuffledWords.map((w) => renderCard(w, "left"))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider px-1">
              Indonesian Meaning
            </div>
            <div className="space-y-2.5">
              {shuffledMeanings.map((m) => renderCard(m, "right"))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Completion Banner */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-[#0D3B66] text-white border-b-2 border-[#082542] card-skeuo shadow-md flex items-center justify-between flex-wrap gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-[#F4B41A] fill-[#F4B41A]" />
            </div>
            <div>
              <h4 className="font-black text-lg">All Wires Connected!</h4>
              <p className="text-xs text-white/90">
                You have matched all vocabulary pairs correctly! (+30 Bonus XP)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={initializeGame}
            className="btn-skeuo-yellow px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
