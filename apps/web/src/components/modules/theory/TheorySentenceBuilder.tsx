"use client";

import React, { useState, useEffect } from "react";
import { Volume2, RotateCcw, Bot, Sparkles, Check, X, Zap } from "lucide-react";
import { animeButtonPop, animeShake, animeStaggerChips } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SentenceBuilderChip {
  id: string;
  text: string;
}

interface TheorySentenceBuilderProps {
  targetSentence?: string;
  promptInstruction?: string;
  onPlayAudio?: (text: string) => void;
  onComplete?: () => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onPenalizeWrong?: () => void;
  onPlaySnap?: () => void;
}

export function TheorySentenceBuilder({
  targetSentence = "She is from Japan.",
  promptInstruction = "Susun balok kata di bawah menjadi kalimat bahasa Inggris yang tepat:",
  onPlayAudio,
  onComplete,
  onAwardXp,
  onPenalizeWrong,
  onPlaySnap,
}: TheorySentenceBuilderProps) {
  // Clean sentence and extract tokens
  const clean = targetSentence.replace(/[.!?]/g, "").trim();
  const rawTokens = clean.split(/\s+/);

  // Group compound chunks if short sentence (e.g. "from Japan" as a chunk or individual words)
  const targetTokens =
    rawTokens.length === 4 && rawTokens[2] === "from"
      ? [rawTokens[0], rawTokens[1], `${rawTokens[2]} ${rawTokens[3]}`]
      : rawTokens;

  // Initialize chips
  const [availableChips, setAvailableChips] = useState<SentenceBuilderChip[]>([]);
  const [placedChips, setPlacedChips] = useState<SentenceBuilderChip[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [draggedChipId, setDraggedChipId] = useState<string | null>(null);

  // Setup shuffled chips on mount with Anime.js staggered entrance
  useEffect(() => {
    const chips: SentenceBuilderChip[] = targetTokens.map((text, idx) => ({
      id: `chip-${idx}-${text}`,
      text,
    }));

    // Deterministic pseudo-shuffle so chips are scrambled but stable
    const shuffled = [...chips].reverse();
    setAvailableChips(shuffled);
    setPlacedChips([]);
    setIsChecked(false);
    setIsCorrect(false);

    setTimeout(() => {
      animeStaggerChips(".builder-chip-item");
    }, 50);
  }, [targetSentence]);

  // Click word chip to move into dropzone
  const handleChipClick = (chip: SentenceBuilderChip, e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      animeButtonPop(e.currentTarget as HTMLElement);
    }
    onPlaySnap?.();
    setAvailableChips((prev) => prev.filter((c) => c.id !== chip.id));
    setPlacedChips((prev) => [...prev, chip]);
    setIsChecked(false);
  };

  // Click placed chip to return back to pool
  const handleRemovePlacedChip = (chip: SentenceBuilderChip, e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      animeButtonPop(e.currentTarget as HTMLElement);
    }
    onPlaySnap?.();
    setPlacedChips((prev) => prev.filter((c) => c.id !== chip.id));
    setAvailableChips((prev) => [...prev, chip]);
    setIsChecked(false);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedChipId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnPlaced = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedChipId;
    if (!id) return;

    const chip = availableChips.find((c) => c.id === id);
    if (chip) {
      onPlaySnap?.();
      setAvailableChips((prev) => prev.filter((c) => c.id !== id));
      setPlacedChips((prev) => [...prev, chip]);
      setIsChecked(false);
    }
    setDraggedChipId(null);
  };

  const handleReset = () => {
    const chips: SentenceBuilderChip[] = targetTokens.map((text, idx) => ({
      id: `chip-${idx}-${text}`,
      text,
    }));
    setAvailableChips([...chips].reverse());
    setPlacedChips([]);
    setIsChecked(false);
    setIsCorrect(false);
    setTimeout(() => {
      animeStaggerChips(".builder-chip-item");
    }, 50);
  };

  const handleCheckSentence = () => {
    const currentSentence = placedChips.map((c) => c.text).join(" ").trim();
    const targetClean = targetTokens.join(" ").trim();

    const correct =
      currentSentence.toLowerCase() === targetClean.toLowerCase() ||
      currentSentence.toLowerCase() === clean.toLowerCase();

    setIsChecked(true);
    setIsCorrect(correct);

    const targetEl = document.getElementById("sentence-builder-dropzone");

    if (correct) {
      if (targetEl) {
        animeButtonPop(targetEl);
      }
      onAwardXp?.(25, "Susunan Kalimat Tepat!");
      onComplete?.();
      if (onPlayAudio) {
        onPlayAudio(clean);
      }
    } else {
      if (targetEl) {
        animeShake(targetEl);
      }
      onPenalizeWrong?.();
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Balok Kata Interaktif (Interactive Sentence Builder)</span>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          Uji Sintaksis & Susunan
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {promptInstruction}
      </p>

      {/* Assembly Dropzone */}
      <div
        id="sentence-builder-dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDropOnPlaced}
        className={`min-h-[76px] p-4 rounded-2xl border-2 border-dashed transition-all flex flex-wrap items-center gap-2.5 ${
          isChecked
            ? isCorrect
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400 ring-2 ring-emerald-300 dark:ring-emerald-800"
              : "bg-red-50/60 dark:bg-red-950/20 border-red-400 ring-2 ring-red-300 dark:ring-red-800"
            : placedChips.length > 0
            ? "bg-indigo-50/40 dark:bg-slate-800/60 border-indigo-300 dark:border-indigo-700"
            : "bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 hover:border-indigo-400"
        }`}
      >
        {placedChips.length === 0 ? (
          <div className="w-full text-center text-xs text-slate-400 dark:text-slate-500 font-medium py-2 select-none">
            Ketuk atau seret balok kata dari bawah ke sini untuk merangkai kalimat...
          </div>
        ) : (
          placedChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={(e) => handleRemovePlacedChip(chip, e)}
              className="builder-chip-item px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer select-none transition-all active:scale-95 will-change-transform"
              title="Ketuk untuk mengembalikan balok ini"
            >
              <span>{chip.text}</span>
              <span className="text-[10px] bg-white/20 rounded-full w-4 h-4 flex items-center justify-center">
                ×
              </span>
            </button>
          ))
        )}
      </div>

      {/* Available Word Chips Pool */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Pilihan Balok Kata (Ketuk atau Geser):
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {availableChips.map((chip) => (
            <div
              key={chip.id}
              draggable
              onDragStart={(e) => handleDragStart(e, chip.id)}
              className="builder-chip-item group inline-flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 border-b-4 border-b-slate-300 dark:border-b-slate-600 hover:border-indigo-400 active:border-b-0 active:translate-y-1 shadow-sm transition-all cursor-grab active:cursor-grabbing select-none will-change-transform"
            >
              <button
                type="button"
                onClick={(e) => handleChipClick(chip, e)}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {chip.text}
              </button>

              {onPlayAudio && (
                <button
                  type="button"
                  onClick={() => onPlayAudio(chip.text)}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={`Dengar "${chip.text}"`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons & Feedback */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1.5 text-xs text-slate-500"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Atur Ulang (Reset)</span>
        </Button>

        <Button
          onClick={handleCheckSentence}
          disabled={placedChips.length === 0}
          className="gap-2 shadow-md border-b-4 border-blue-800"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Periksa Susunan (+25 XP)</span>
        </Button>
      </div>

      {/* Instant Actionable Feedback */}
      {isChecked && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in duration-200 ${
            isCorrect
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
          }`}
        >
          <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold block text-sm">
              {isCorrect ? "Sempurna! Susunan Kalimatmu Tepat Sekali!" : "Hampir tepat, coba perhatikan: "}
            </span>
            <p className="leading-relaxed opacity-95">
              {isCorrect
                ? `Kalimat "${clean}." tersusun dengan urutan subjek dan pelengkap yang sangat tepat. Dengarkan audionya untuk melatih telingamu!`
                : `Pastikan subjek berada di awal kalimat, diikuti kata kerja penghubung (verb/to be), lalu keterangan asal.`}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Backward-compatible alias
export const Phase1SentenceBuilder = TheorySentenceBuilder;
