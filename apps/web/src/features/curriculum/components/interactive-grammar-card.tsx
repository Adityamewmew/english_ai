"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Volume2, Layers, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound, playErrorSound } from "@/lib/sound-fx";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";

export interface SubjectOption {
  label: string;
  pronoun: string;
  correctToBe: string;
  role: string;
}

export interface VerbOption {
  base: string;
  thirdPerson?: string;
  continuous?: string;
}

export interface GrammarFormulasData {
  title?: string;
  description?: string;
  subjects?: SubjectOption[];
  verbs?: VerbOption[];
  complements?: any[];
}

interface InteractiveGrammarCardProps {
  rules?: any[];
  formulas?: GrammarFormulasData | null;
  onPlayAudio?: (text: string) => void;
  embedded?: boolean;
}

type GrammarMode = "affirmative" | "negative" | "question";

const DEFAULT_SUBJECTS: SubjectOption[] = [
  { label: "I", pronoun: "I", correctToBe: "am", role: "First Person Singular (I)" },
  { label: "He", pronoun: "He", correctToBe: "is", role: "Third Person Singular (He)" },
  { label: "She", pronoun: "She", correctToBe: "is", role: "Third Person Singular (She)" },
  { label: "We", pronoun: "We", correctToBe: "are", role: "First Person Plural (We)" },
  { label: "They", pronoun: "They", correctToBe: "are", role: "Third Person Plural (They)" },
  { label: "You", pronoun: "You", correctToBe: "are", role: "Second Person (You)" },
];

const DEFAULT_GENERIC_COMPLEMENTS = [
  "happy today",
  "at home",
  "a student",
  "ready to learn",
];

export function InteractiveGrammarCard({
  rules,
  formulas,
  onPlayAudio,
  embedded = false,
}: InteractiveGrammarCardProps) {
  const subjects = useMemo(() => {
    return formulas?.subjects && formulas.subjects.length > 0 ? formulas.subjects : DEFAULT_SUBJECTS;
  }, [formulas?.subjects]);

  const complements = useMemo(() => {
    return formulas?.complements && formulas.complements.length > 0
      ? formulas.complements
      : DEFAULT_GENERIC_COMPLEMENTS;
  }, [formulas?.complements]);

  // Dynamically extract verb/auxiliary options from subject options
  const availableVerbs = useMemo(() => {
    const list = subjects
      .map((s) => s.correctToBe)
      .filter((v): v is string => Boolean(v && v !== "—"));
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique : ["am", "is", "are"];
  }, [subjects]);

  const isHaveHas = useMemo(() => {
    return availableVerbs.some((v) => ["have", "has", "had"].includes(v.toLowerCase()));
  }, [availableVerbs]);

  const isPastToBe = useMemo(() => {
    return availableVerbs.some((v) => ["was", "were"].includes(v.toLowerCase()));
  }, [availableVerbs]);

  const isModal = useMemo(() => {
    return availableVerbs.some((v) =>
      ["can", "could", "will", "would", "should", "must", "may", "might"].includes(v.toLowerCase())
    );
  }, [availableVerbs]);

  const verbSlotName = isHaveHas
    ? "Auxiliary Verb"
    : isPastToBe
    ? "Past To Be"
    : isModal
    ? "Modal Verb"
    : "Verb To Be";

  const [activeMode, setActiveMode] = useState<GrammarMode>("affirmative");
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption>(subjects[0] || DEFAULT_SUBJECTS[0]);
  const [selectedToBe, setSelectedToBe] = useState<string>(subjects[0]?.correctToBe || availableVerbs[0] || "am");
  const [complementIndex, setComplementIndex] = useState(0);
  const [useContraction, setUseContraction] = useState(false);

  // Sync state if subjects or available verbs change
  useEffect(() => {
    if (subjects[0]) {
      setSelectedSubject(subjects[0]);
      setSelectedToBe(subjects[0].correctToBe || availableVerbs[0] || "am");
    }
  }, [subjects, availableVerbs]);

  const rawComplement = complements[complementIndex] || complements[0] || "";
  const complementText =
    typeof rawComplement === "object" && rawComplement !== null
      ? (rawComplement as any).text || (rawComplement as any).label || ""
      : String(rawComplement || "");
  const complementType =
    typeof rawComplement === "object" && rawComplement !== null
      ? (rawComplement as any).type || ""
      : "";

  const isAgreementValid =
    selectedToBe.toLowerCase().trim() === (selectedSubject?.correctToBe || "").toLowerCase().trim();

  const activeVerbObj = formulas?.verbs?.[0];

  const getMainVerb = () => {
    if (!activeVerbObj) return "";
    const lowerVerb = selectedToBe.toLowerCase();
    // Present perfect / past perfect: uses past participle (stored in continuous or base)
    if (lowerVerb === "have" || lowerVerb === "has" || lowerVerb === "had") {
      return activeVerbObj.continuous || activeVerbObj.base;
    }
    // Continuous tense (be + V-ing)
    if (activeVerbObj.continuous && activeVerbObj.continuous.endsWith("ing")) {
      return activeVerbObj.continuous;
    }
    // Simple present
    const isThirdPerson = ["He", "She", "It"].includes(selectedSubject?.pronoun || "");
    return isThirdPerson ? (activeVerbObj.thirdPerson || activeVerbObj.base) : activeVerbObj.base;
  };

  useEffect(() => {
    return () => {
      stopTutorSpeech();
    };
  }, []);

  const speakText = (text: string) => {
    if (onPlayAudio) {
      onPlayAudio(text);
      return;
    }
    speakTutorText(text);
  };

  const handleModeChange = (mode: GrammarMode) => {
    playPopSound();
    setActiveMode(mode);
  };

  const handleSelectSubject = (s: SubjectOption, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setSelectedSubject(s);
    if (s.correctToBe && s.correctToBe !== "—") {
      setSelectedToBe(s.correctToBe);
    }
  };

  const handleSelectToBe = (toBe: string, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    if (toBe.toLowerCase() === selectedSubject.correctToBe.toLowerCase()) {
      playMatchSuccessSound();
    } else {
      playErrorSound();
    }
    setSelectedToBe(toBe);
  };

  const getAssembledSentence = () => {
    const sub = selectedSubject?.pronoun || selectedSubject?.label || "They";
    const comp = complementText.trim().replace(/[.?!]+$/, "");
    const mainVerb = getMainVerb().trim();
    const mainVerbStr = mainVerb
      ? comp.toLowerCase().startsWith(mainVerb.toLowerCase())
        ? ""
        : `${mainVerb} `
      : "";

    const lowerVerb = selectedToBe.toLowerCase();

    if (activeMode === "affirmative") {
      if (useContraction && isAgreementValid) {
        if (lowerVerb === "have") {
          const contracted = sub === "I" ? "I've" : sub === "We" ? "We've" : sub === "They" ? "They've" : `${sub}'ve`;
          return `${contracted} ${mainVerbStr}${comp}.`;
        }
        if (lowerVerb === "has") {
          const contracted = sub === "He" ? "He's" : sub === "She" ? "She's" : sub === "It" ? "It's" : `${sub}'s`;
          return `${contracted} ${mainVerbStr}${comp}.`;
        }
        if (lowerVerb === "am") return `I'm ${mainVerbStr}${comp}.`;
        if (lowerVerb === "is") return `${sub}'s ${mainVerbStr}${comp}.`;
        if (lowerVerb === "are") return `${sub}'re ${mainVerbStr}${comp}.`;
      }
      return `${sub} ${selectedToBe} ${mainVerbStr}${comp}.`;
    }

    if (activeMode === "negative") {
      if (useContraction && isAgreementValid) {
        if (lowerVerb === "have") return `${sub} haven't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "has") return `${sub} hasn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "had") return `${sub} hadn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "am") return `I'm not ${mainVerbStr}${comp}.`;
        if (lowerVerb === "is") return `${sub} isn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "are") return `${sub} aren't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "was") return `${sub} wasn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "were") return `${sub} weren't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "can") return `${sub} can't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "could") return `${sub} couldn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "will") return `${sub} won't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "would") return `${sub} wouldn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "should") return `${sub} shouldn't ${mainVerbStr}${comp}.`;
        if (lowerVerb === "must") return `${sub} mustn't ${mainVerbStr}${comp}.`;
      }
      return `${sub} ${selectedToBe} not ${mainVerbStr}${comp}.`;
    }

    // Question
    const capitalizedVerb = selectedToBe.charAt(0).toUpperCase() + selectedToBe.slice(1);
    const subStr = sub.toLowerCase() === "i" ? "I" : sub.toLowerCase();
    return `${capitalizedVerb} ${subStr} ${mainVerbStr}${comp}?`;
  };

  const getBlockStructure = () => {
    const verbLabel = isHaveHas
      ? "[HAVE/HAS]"
      : isPastToBe
      ? "[WAS/WERE]"
      : isModal
      ? "[MODAL]"
      : "[TO BE]";
    const mainVerbLabel = activeVerbObj ? " + [VERB]" : "";
    if (activeMode === "question") {
      return `${verbLabel} + [SUBJECT]${mainVerbLabel} + [COMPLEMENT]?`;
    }
    if (activeMode === "negative") {
      return `[SUBJECT] + ${verbLabel} + [NOT]${mainVerbLabel} + [COMPLEMENT]`;
    }
    return `[SUBJECT] + ${verbLabel}${mainVerbLabel} + [COMPLEMENT]`;
  };

  return (
    <div
      className={
        embedded
          ? "relative space-y-6"
          : "relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
      }
    >
      {/* 1. Header Toolbar with Mode Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 font-bold text-xs flex items-center gap-2 font-mono">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Slot & Swap Formula Lab</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Swap subject and verb blocks to observe sentence patterns
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleModeChange("affirmative")}
            className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center touch-manipulation ${
              activeMode === "affirmative"
                ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-500"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            + Affirmative
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("negative")}
            className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center touch-manipulation ${
              activeMode === "negative"
                ? "bg-rose-600 text-white shadow-xs dark:bg-rose-500"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            − Negative
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("question")}
            className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] flex items-center justify-center touch-manipulation ${
              activeMode === "question"
                ? "bg-sky-600 text-white shadow-xs dark:bg-sky-500"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ? Question
          </button>
        </div>
      </div>

      {/* 2. Physical-Style Puzzle Sentence Builder Blocks */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-indigo-700 dark:text-indigo-300">
            BLOCK STRUCTURE: {getBlockStructure()}
          </span>
          <button
            type="button"
            onClick={() => setUseContraction(!useContraction)}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer flex items-center gap-1.5"
          >
            <span className={`w-2 h-2 rounded-full ${useContraction ? "bg-amber-500" : "bg-slate-300"}`} />
            <span>Contraction Mode: {useContraction ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Puzzle Blocks Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* SLOT A: In Question mode this is AUX/TO BE, else SUBJECT */}
          {activeMode === "question" ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/60 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block font-mono">
                Slot 1 · {verbSlotName} (Front)
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableVerbs.map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={(e) => handleSelectToBe(verb, e)}
                    className={`flex-1 min-w-[65px] py-2.5 rounded-xl text-xs font-black capitalize transition-all border cursor-pointer min-h-[42px] touch-manipulation active:scale-95 ${
                      selectedToBe.toLowerCase() === verb.toLowerCase()
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs dark:bg-indigo-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {verb}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block font-mono">
                Slot 1 · Subject ({selectedSubject?.role ? selectedSubject.role.split(" ")[0] : "Subject"})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {subjects.map((sub, sIdx) => (
                  <button
                    key={sub.pronoun || sub.label || sIdx}
                    type="button"
                    onClick={(e) => handleSelectSubject(sub, e)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer min-h-[40px] touch-manipulation active:scale-95 ${
                      selectedSubject?.pronoun === sub.pronoun
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs dark:bg-indigo-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {sub.pronoun || sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SLOT B: In Question mode this is SUBJECT, else AUX/TO BE */}
          {activeMode === "question" ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block font-mono">
                Slot 2 · Subject
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {subjects.map((sub) => (
                  <button
                    key={sub.pronoun}
                    type="button"
                    onClick={(e) => handleSelectSubject(sub, e)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer min-h-[40px] touch-manipulation active:scale-95 ${
                      selectedSubject.pronoun === sub.pronoun
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs dark:bg-indigo-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {sub.pronoun}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 shadow-xs space-y-2 ${
                isAgreementValid ? "border-emerald-500/80" : "border-rose-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 block font-mono">
                  Slot 2 · {verbSlotName} {activeMode === "negative" ? "+ NOT" : ""}
                </span>
                {isAgreementValid ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Matches
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Mismatch
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableVerbs.map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={(e) => handleSelectToBe(verb, e)}
                    className={`flex-1 min-w-[65px] py-2.5 rounded-xl text-xs font-black capitalize transition-all border cursor-pointer min-h-[42px] touch-manipulation active:scale-95 ${
                      selectedToBe.toLowerCase() === verb.toLowerCase()
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs dark:bg-indigo-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200 hover:border-slate-300"
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
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 block font-mono">
                Slot 3 · Complement ({complementIndex + 1}/{complements.length})
              </span>
              {complementType && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 font-mono">
                  {complementType}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setComplementIndex((prev) => (prev + 1) % complements.length)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer hover:border-indigo-500 min-h-[44px] touch-manipulation"
              >
                <span className="truncate">{complementText}</span>
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Assembled Sentence Preview Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Assembled Sentence:
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {getAssembledSentence()}
            </p>
            {!isAgreementValid && (
              <p className="text-xs text-rose-600 font-semibold">
                ⚠️ Grammar Note: The correct verb for "{selectedSubject.pronoun}" is "{selectedSubject.correctToBe}".
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => speakText(getAssembledSentence())}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto min-h-[44px] touch-manipulation active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Listen to Sentence</span>
          </button>
        </div>
      </div>
    </div>
  );
}
