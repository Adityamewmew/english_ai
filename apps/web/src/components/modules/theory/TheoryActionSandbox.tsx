"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Volume2, MoveRight, Check, Zap, Play, User, Users, UserCheck } from "lucide-react";
import { AnimatedCharacter, CharacterPersona, CharacterState } from "../AnimatedCharacter";
import { VocabItem } from "../SectionVocab";
import { animeButtonPop, animeStaggerChips } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SandboxSubject {
  id: string;
  label: string;
  type: "female" | "self" | "plural";
  subjectWord: string;
  correctToBe: string;
  persona: CharacterPersona;
}

interface SandboxComplement {
  id: string;
  label: string;
  badge: string;
  complementText: string;
  cityName?: string;
  meaning?: string;
}

const DEFAULT_SUBJECTS: SandboxSubject[] = [
  { id: "she", label: "She (Dia Perempuan)", type: "female", subjectWord: "She", correctToBe: "is", persona: "student_female" },
  { id: "i", label: "I (Saya)", type: "self", subjectWord: "I", correctToBe: "am", persona: "student" },
  { id: "they", label: "They (Mereka)", type: "plural", subjectWord: "They", correctToBe: "are", persona: "student" },
];

interface TheoryActionSandboxProps {
  vocabItems?: VocabItem[];
  rules?: any[];
  onPlayAudio?: (text: string) => void;
  onAwardXp?: (amount: number, reason?: string) => void;
  onPlaySnap?: () => void;
}

export function TheoryActionSandbox({
  vocabItems = [],
  rules = [],
  onPlayAudio,
  onAwardXp,
  onPlaySnap,
}: TheoryActionSandboxProps) {
  // Dynamically generate complement options from module vocab items
  const dynamicComplements: SandboxComplement[] = React.useMemo(() => {
    if (vocabItems && vocabItems.length >= 2) {
      return vocabItems.slice(0, 3).map((v, i) => {
        const word = (v?.word || "").trim();
        const meaning = (v?.meaning || "").trim();
        const isFromOrigin = word.toLowerCase().includes("from") || meaning.toLowerCase().includes("dari");
        const cleanWord = word.replace(/^[a-z]+\s+/i, "") || word || "there";

        return {
          id: `vocab-${i}`,
          label: word || `Item ${i + 1}`,
          badge: i === 0 ? "🇯🇵" : i === 1 ? "🇮🇩" : "🇪🇸",
          complementText: isFromOrigin ? word : `from ${cleanWord}`,
          cityName: cleanWord,
          meaning: meaning,
        };
      });
    }

    return [
      { id: "japan", label: "Japan", badge: "🇯🇵", complementText: "from Japan", cityName: "Tokyo", meaning: "dari Jepang" },
      { id: "indonesia", label: "Indonesia", badge: "🇮🇩", complementText: "from Indonesia", cityName: "Jakarta", meaning: "dari Indonesia" },
      { id: "spain", label: "Spain", badge: "🇪🇸", complementText: "from Spain", cityName: "Madrid", meaning: "dari Spanyol" },
    ];
  }, [vocabItems]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("she");
  const [selectedCompId, setSelectedCompId] = useState<string>(dynamicComplements[0]?.id || "japan");
  const [testedCombinations, setTestedCombinations] = useState<Set<string>>(new Set(["she-japan"]));
  const [characterState, setCharacterState] = useState<CharacterState>("idle");

  const currentSubject = DEFAULT_SUBJECTS.find((s) => s.id === selectedSubjectId) || DEFAULT_SUBJECTS[0];
  const currentComplement = dynamicComplements.find((c) => c.id === selectedCompId) || dynamicComplements[0] || {
    id: "default",
    label: "default",
    badge: "📍",
    complementText: "here",
  };

  const constructedSentence = `${currentSubject.subjectWord} ${currentSubject.correctToBe} ${currentComplement.complementText}.`;

  const handleSelectSubject = (id: string, e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      animeButtonPop(e.currentTarget as HTMLElement);
    }
    onPlaySnap?.();
    setSelectedSubjectId(id);
    setCharacterState("speaking");
    setTimeout(() => setCharacterState("idle"), 1200);

    const comboKey = `${id}-${selectedCompId}`;
    if (!testedCombinations.has(comboKey)) {
      setTestedCombinations((prev) => new Set(prev).add(comboKey));
      onAwardXp?.(10, "Kombinasi Baru Ditemukan!");
    }
  };

  const handleSelectComplement = (id: string, e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      animeButtonPop(e.currentTarget as HTMLElement);
    }
    onPlaySnap?.();
    setSelectedCompId(id);
    setCharacterState("happy");
    setTimeout(() => setCharacterState("idle"), 1200);

    const comboKey = `${selectedSubjectId}-${id}`;
    if (!testedCombinations.has(comboKey)) {
      setTestedCombinations((prev) => new Set(prev).add(comboKey));
      onAwardXp?.(10, "Kombinasi Baru Ditemukan!");
    }
  };

  const handleSpeakSentence = (e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      animeButtonPop(e.currentTarget as HTMLElement);
    }
    setCharacterState("speaking");
    onPlayAudio?.(constructedSentence);
    setTimeout(() => setCharacterState("idle"), 2000);
  };

  useEffect(() => {
    animeStaggerChips(".sandbox-formula-pill");
  }, [selectedSubjectId, selectedCompId]);

  return (
    <div className="space-y-6">
      {/* Interactive Stage Card */}
      <Card className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/50 p-6 sm:p-8 md:p-10 shadow-xs space-y-7 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Arena Aksi Interaktif (Live Action Sandbox)</span>
          </div>
          <Badge variant="accent" className="font-extrabold text-xs px-3 py-1">
            {testedCombinations.size} / 9 Pola Dicoba (+{testedCombinations.size * 10} XP)
          </Badge>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Ubah subjek atau pelengkap di bawah untuk melihat bagaimana perubahan bentuk kata kerja bantu (to be) terjadi secara instan dan alami:
        </p>

        {/* Character Reaction Stage & Dynamic Bubble */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0 flex flex-col items-center">
            <AnimatedCharacter
              persona={currentSubject.persona}
              state={characterState}
            />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-wider">
              {currentSubject.label.split(" ")[0]}
            </span>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Kalimat Hasil Rangkaian:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeakSentence}
                className="h-8 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2.5 rounded-lg"
                title="Dengarkan pengucapan kalimat"
              >
                <Volume2 className="w-4 h-4 mr-1.5" />
                <span>Ucapkan Kalimat</span>
              </Button>
            </div>

            {/* Live Formula Display */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <span className="sandbox-formula-pill px-4 py-2 rounded-xl bg-blue-600 text-white font-mono font-bold text-sm sm:text-base shadow-xs will-change-transform">
                {currentSubject.subjectWord}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-black text-lg">+</span>
              <span className="sandbox-formula-pill px-4 py-2 rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm sm:text-base shadow-xs ring-2 ring-indigo-300 dark:ring-indigo-700 will-change-transform">
                {currentSubject.correctToBe}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-black text-lg">+</span>
              <span className="sandbox-formula-pill px-4 py-2 rounded-xl bg-emerald-600 text-white font-mono font-bold text-sm sm:text-base shadow-xs will-change-transform">
                {currentComplement.complementText}
              </span>
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono leading-relaxed pt-1">
              &ldquo;{constructedSentence}&rdquo;
            </p>
          </div>
        </div>

        {/* Selector 1: Subjek Kalimat */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            1. Pilih Subjek (Pelaku):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {DEFAULT_SUBJECTS.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={(e) => handleSelectSubject(sub.id, e)}
                  className={`p-4 sm:p-5 rounded-2xl border border-b-4 text-left transition-all flex items-center gap-3 select-none cursor-pointer will-change-transform min-h-[64px] ${
                    isSelected
                      ? "border-blue-600 border-b-blue-800 bg-blue-600 text-white shadow-md"
                      : "border-slate-200 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400 active:border-b-0 active:translate-y-1 shadow-xs"
                  }`}
                >
                  <span className="shrink-0 p-1.5 rounded-xl bg-white/10">
                    {sub.type === "female" && <User className={`w-5 h-5 ${isSelected ? "text-white" : "text-indigo-500"}`} />}
                    {sub.type === "self" && <UserCheck className={`w-5 h-5 ${isSelected ? "text-white" : "text-blue-500"}`} />}
                    {sub.type === "plural" && <Users className={`w-5 h-5 ${isSelected ? "text-white" : "text-emerald-500"}`} />}
                  </span>
                  <div className="truncate">
                    <span className="font-extrabold text-sm block truncate">{sub.subjectWord}</span>
                    <span className={`text-xs block truncate mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                      To Be: &apos;{sub.correctToBe}&apos;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector 2: Pelengkap / Kosakata Modul */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            2. Pilih Kata Target (Complement / Vocabulary):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {dynamicComplements.map((comp) => {
              const isSelected = selectedCompId === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={(e) => handleSelectComplement(comp.id, e)}
                  className={`p-4 sm:p-5 rounded-2xl border border-b-4 text-left transition-all flex items-center gap-3 select-none cursor-pointer will-change-transform min-h-[64px] ${
                    isSelected
                      ? "border-emerald-600 border-b-emerald-800 bg-emerald-600 text-white shadow-md"
                      : "border-slate-200 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-400 active:border-b-0 active:translate-y-1 shadow-xs"
                  }`}
                >
                  <span className="text-xl shrink-0">{comp.badge}</span>
                  <div className="truncate">
                    <span className="font-extrabold text-sm block truncate">{comp.label}</span>
                    <span className={`text-xs block truncate mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}>
                      {comp.cityName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Backward-compatible alias
export const Phase1ActionSandbox = TheoryActionSandbox;
