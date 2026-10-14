"use client";

import React, { useState } from "react";
import { Volume2, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound, playErrorSound } from "@/lib/sound-fx";

export interface SubjectOption {
  label: string;
  pronoun: string;
  correctToBe: "am" | "is" | "are";
  role: string;
}

export interface GrammarFormulasData {
  subjects: SubjectOption[];
  complements: string[];
}

interface InteractiveGrammarCardProps {
  rules?: any[];
  formulas?: GrammarFormulasData | null;
  onPlayAudio?: (text: string) => void;
  embedded?: boolean;
}

type GrammarMode = "affirmative" | "negative" | "question";

const DEFAULT_SUBJECTS: SubjectOption[] = [
  { label: "I", pronoun: "I", correctToBe: "am", role: "First Person (Saya)" },
  { label: "He", pronoun: "He", correctToBe: "is", role: "Third Person (Dia lk)" },
  { label: "She", pronoun: "She", correctToBe: "is", role: "Third Person (Dia pr)" },
  { label: "We", pronoun: "We", correctToBe: "are", role: "Plural (Kita / Kami)" },
  { label: "They", pronoun: "They", correctToBe: "are", role: "Plural (Mereka)" },
  { label: "You", pronoun: "You", correctToBe: "are", role: "Second Person (Kamu)" },
];

const DEFAULT_COMPLEMENTS = [
  "from Spain",
  "sixteen years old",
  "a Brazilian swimmer",
  "a fan of FC Barcelona",
];

export function InteractiveGrammarCard({
  rules,
  formulas,
  onPlayAudio,
  embedded = false,
}: InteractiveGrammarCardProps) {
  const subjects = formulas?.subjects && formulas.subjects.length > 0 ? formulas.subjects : DEFAULT_SUBJECTS;
  const complements = formulas?.complements && formulas.complements.length > 0 ? formulas.complements : DEFAULT_COMPLEMENTS;

  const [activeMode, setActiveMode] = useState<GrammarMode>("affirmative");
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption>(subjects[0]);
  const [selectedToBe, setSelectedToBe] = useState<"am" | "is" | "are">(subjects[0]?.correctToBe || "am");
  const [complementIndex, setComplementIndex] = useState(0);
  const [useContraction, setUseContraction] = useState(false);

  const complement = complements[complementIndex] || complements[0];
  const isAgreementValid = selectedToBe === selectedSubject.correctToBe;

  const speakText = (text: string) => {
    if (onPlayAudio) {
      onPlayAudio(text);
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleModeChange = (mode: GrammarMode) => {
    playPopSound();
    setActiveMode(mode);
  };

  const handleSelectSubject = (s: SubjectOption, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setSelectedSubject(s);
    setSelectedToBe(s.correctToBe);
  };

  const handleSelectToBe = (toBe: "am" | "is" | "are", e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    if (toBe === selectedSubject.correctToBe) {
      playMatchSuccessSound();
    } else {
      playErrorSound();
    }
    setSelectedToBe(toBe);
  };

  const getAssembledSentence = () => {
    const sub = selectedSubject.pronoun;
    const comp = complement;

    if (activeMode === "affirmative") {
      if (useContraction && isAgreementValid) {
        const contracted =
          sub === "I" ? "I'm" : sub === "He" ? "He's" : sub === "She" ? "She's" : sub === "We" ? "We're" : sub === "They" ? "They're" : "You're";
        return `${contracted} ${comp}.`;
      }
      return `${sub} ${selectedToBe} ${comp}.`;
    }

    if (activeMode === "negative") {
      if (useContraction && isAgreementValid) {
        if (sub === "I") return `I'm not ${comp}.`;
        const contractedVerb = selectedToBe === "is" ? "isn't" : "aren't";
        return `${sub} ${contractedVerb} ${comp}.`;
      }
      return `${sub} ${selectedToBe} not ${comp}.`;
    }

    const capitalizedToBe = selectedToBe.charAt(0).toUpperCase() + selectedToBe.slice(1);
    return `${capitalizedToBe} ${sub.toLowerCase() === "i" ? "I" : sub.toLowerCase()} ${comp}?`;
  };

  return (
    <div
      className={
        embedded
          ? "relative space-y-6"
          : "relative card-skeuo bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6"
      }
    >
      {/* 1. Header Toolbar with Mode Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-full bg-[#0D3B66]/10 dark:bg-[#0D3B66]/30 text-[#0D3B66] dark:text-[#F4B41A] border border-[#0D3B66]/20 font-bold text-xs flex items-center gap-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#F4B41A]" />
            <span>Slot & Swap Formula Lab</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Tukar balok subjek dan verb to be untuk mengamati rumus kalimat
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => handleModeChange("affirmative")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === "affirmative"
                ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            + Positif
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("negative")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === "negative"
                ? "bg-[#9E1B1B] text-white border-b-2 border-[#841515] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            − Negatif
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("question")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === "question"
                ? "bg-[#1B4965] text-white border-b-2 border-[#123348] shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ? Tanya
          </button>
        </div>
      </div>

      {/* 2. Physical-Style Puzzle Sentence Builder Blocks */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 border-b-2 border-b-slate-300 dark:border-b-slate-700 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#0D3B66] dark:text-[#F4B41A]">
            STRUKTUR BALOK: {activeMode === "question" ? "[TO BE] + [SUBJECT] + [COMPLEMENT]?" : "[SUBJECT] + [TO BE] + [COMPLEMENT]"}
          </span>
          <button
            type="button"
            onClick={() => setUseContraction(!useContraction)}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0D3B66] cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-[#F4B41A]" />
            <span>Mode Singkatan: {useContraction ? "AKTIF" : "NONAKTIF"}</span>
          </button>
        </div>

        {/* Puzzle Blocks Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* SLOT A: In Question mode this is TO BE, else SUBJECT */}
          {activeMode === "question" ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#F4B41A] shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-[#855e05] dark:text-[#F4B41A] block font-mono">
                Slot 1 · Verb To Be (Di Depan)
              </span>
              <div className="flex items-center gap-1.5">
                {(["am", "is", "are"] as const).map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={(e) => handleSelectToBe(verb, e)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black capitalize transition-all border cursor-pointer ${
                      selectedToBe === verb
                        ? "bg-[#0D3B66] text-white border-[#082542] border-b-2 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {verb}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-[#0D3B66] dark:text-sky-300 block font-mono">
                Slot 1 · Subjek ({selectedSubject.role.split(" ")[0]})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {subjects.map((sub) => (
                  <button
                    key={sub.pronoun}
                    type="button"
                    onClick={(e) => handleSelectSubject(sub, e)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedSubject.pronoun === sub.pronoun
                        ? "bg-[#0D3B66] text-white border-[#082542] border-b-2 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {sub.pronoun}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SLOT B: In Question mode this is SUBJECT, else TO BE */}
          {activeMode === "question" ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-[#0D3B66] dark:text-sky-300 block font-mono">
                Slot 2 · Subjek
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {subjects.map((sub) => (
                  <button
                    key={sub.pronoun}
                    type="button"
                    onClick={(e) => handleSelectSubject(sub, e)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedSubject.pronoun === sub.pronoun
                        ? "bg-[#0D3B66] text-white border-[#082542] border-b-2 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {sub.pronoun}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 shadow-xs space-y-2 ${
              isAgreementValid ? "border-emerald-500/80" : "border-[#9E1B1B]/80"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#855e05] dark:text-[#F4B41A] block font-mono">
                  Slot 2 · To Be {activeMode === "negative" ? "+ NOT" : ""}
                </span>
                {isAgreementValid ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Cocok
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#9E1B1B] flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Mismatch
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {(["am", "is", "are"] as const).map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={(e) => handleSelectToBe(verb, e)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black capitalize transition-all border cursor-pointer ${
                      selectedToBe === verb
                        ? "bg-[#0D3B66] text-white border-[#082542] border-b-2 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {verb} {activeMode === "negative" ? "not" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SLOT C: Complement */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block font-mono">
              Slot 3 · Keterangan (Complement)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setComplementIndex((prev) => (prev + 1) % complements.length)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer hover:border-[#0D3B66]"
              >
                <span className="truncate">{complement}</span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Assembled Sentence Preview Box */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Hasil Rakitan Kalimat:
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
              {getAssembledSentence()}
            </p>
            {!isAgreementValid && (
              <p className="text-xs text-[#9E1B1B] font-semibold">
                ⚠️ Catatan: Pasangan baku untuk subjek "{selectedSubject.pronoun}" adalah "{selectedSubject.correctToBe}".
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => speakText(getAssembledSentence())}
            className="px-4 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Volume2 className="w-4 h-4 text-[#F4B41A]" />
            <span>Dengarkan Pelafalan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
