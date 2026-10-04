"use client";

import React, { useState, useEffect } from "react";
import { Zap, Flame, Volume2, VolumeX } from "lucide-react";
import { VocabItem } from "../SectionVocab";
import { DialogueTurn } from "../SectionDialogue";
import { TheoryStepper } from "./TheoryStepper";
import { TheoryGoalCard } from "./TheoryGoalCard";
import { TheoryConceptDeep } from "./TheoryConceptDeep";
import { TheoryThreeTierExamples } from "./TheoryThreeTierExamples";
import { TheoryVocabStep } from "./TheoryVocabStep";
import { TheoryDialogueStep, ContextualAnalysis } from "./TheoryDialogueStep";
import { TheoryReadinessCheck, ReadinessQuestion } from "./TheoryReadinessCheck";
import { TheoryMiniTrial } from "./TheoryMiniTrial";
import { useGamification } from "@/hooks/use-gamification";
import { animeCardReveal } from "@/lib/anime-effects";

export interface TheoryContent {
  summary: string;
  rules?: Array<Record<string, string> | string>;
  commonTrap?: {
    trapTitle?: string;
    explanation: string;
    wrong: string;
    correct: string;
  };
  contextualAnalysis?: ContextualAnalysis;
  readinessQuestions?: ReadinessQuestion[];
}

export interface SectionTheoryUnifiedProps {
  title: string;
  theoryContent?: TheoryContent;
  vocabItems?: VocabItem[];
  dialogueContext?: string;
  dialogueLines?: DialogueTurn[];
  onPlayAudio?: (text: string) => void;
  onAdvanceToPractice: () => void;
  isPracticeUnlocked?: boolean;
  objective?: string;
  cefr?: string;
  orderIndex?: number;
  activeStep?: number;
  onStepComplete?: (step: number) => void;
  onNextStep?: () => void;
}

export function SectionTheoryUnified({
  title,
  theoryContent,
  vocabItems = [],
  dialogueContext,
  dialogueLines = [],
  onPlayAudio,
  onAdvanceToPractice,
  isPracticeUnlocked = false,
  objective,
  cefr,
  orderIndex,
  activeStep,
  onStepComplete,
  onNextStep,
}: SectionTheoryUnifiedProps) {
  // Gamification state & Web Audio synthesizer
  const game = useGamification();

  // Progressive step tracker: 1 to 6 (Framework v3 Teaching Skeleton)
  const [unlockedStep, setUnlockedStep] = useState<number>(() => (isPracticeUnlocked ? 6 : 1));

  useEffect(() => {
    if (isPracticeUnlocked) {
      setUnlockedStep(6);
    }
  }, [isPracticeUnlocked]);

  const rawRules = theoryContent?.rules || (theoryContent as any)?.scale || [];
  const rules = Array.isArray(rawRules) ? rawRules : [];

  const rawMistakes = (theoryContent as any)?.commonMistakes;
  const commonTrap =
    theoryContent?.commonTrap ||
    (Array.isArray(rawMistakes) && rawMistakes.length > 0
      ? {
          trapTitle: "Peringatan Kesalahan Umum",
          explanation:
            rawMistakes[0].note ||
            rawMistakes[0].wrong ||
            "Perhatikan perbedaan pola berikut agar tidak tertukar dalam percakapan.",
          wrong: rawMistakes[0].wrong,
          correct: rawMistakes[0].right,
        }
      : undefined);

  const summaryText =
    theoryContent?.summary ||
    (theoryContent as any)?.concept ||
    "Pelajari konsep dasar, aturan penggunaan, dan contoh kalimat berikut dengan saksama.";

  // Dynamic target sentence extractor for Module Dossier, Sandbox & Mini-Trial
  let bestExample = "";
  let exampleMeaning = "";

  for (const r of rules) {
    if (typeof r === "string") {
      const match = r.match(/(?:Contoh|Example):\s*([^.\n]+[.!?]?)/i);
      if (match && match[1] && match[1].trim().length > 3) {
        bestExample = match[1].trim();
        break;
      }
    }
    if (r && typeof r === "object" && (r as any).example && typeof (r as any).example === "string") {
      bestExample = (r as any).example.trim();
      exampleMeaning = (r as any).meaning || (r as any).detail || "";
      break;
    }
  }

  if (!bestExample && commonTrap?.correct) {
    const firstAlt = commonTrap.correct.split(/[\/,;]/)[0]?.trim();
    bestExample = firstAlt || commonTrap.correct.trim();
    exampleMeaning = commonTrap.explanation || "";
  }
  if (!bestExample && dialogueLines.length > 0 && dialogueLines[0].text) {
    bestExample = dialogueLines[0].text.trim();
    exampleMeaning = dialogueLines[0].translation || "";
  }
  if (!bestExample && vocabItems.length > 0) {
    bestExample = vocabItems[0].collocation || `I practice with '${vocabItems[0].word}'.`;
    exampleMeaning = vocabItems[0].meaning || "";
  }
  if (!bestExample) {
    bestExample = "I study English every day.";
    exampleMeaning = "Saya belajar bahasa Inggris setiap hari.";
  }

  if (bestExample && !/[.!?]$/.test(bestExample)) {
    bestExample += ".";
  }

  const handleUnlockAndScroll = (nextStep: number) => {
    game.playSnap();
    setUnlockedStep((prev) => Math.max(prev, nextStep));
    if (nextStep === 6) {
      game.awardMilestoneCelebrate();
    }
    setTimeout(() => {
      const el = document.getElementById(`theory-step-${nextStep}`) || document.getElementById(`phase1-step-${nextStep}`);
      if (el) {
        animeCardReveal(el);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleScrollToStep = (step: number) => {
    const el = document.getElementById(`theory-step-${step}`) || document.getElementById(`phase1-step-${step}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // If activeStep is specified (Two-Column Workspace Mode), render ONLY that step!
  if (activeStep !== undefined) {
    return (
      <div className="space-y-6">
        {/* Gamification Floating HUD & Audio Toggle */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{game.xp} XP</span>
            </span>
            {game.streak > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{game.streak} Hari</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={game.toggleMute}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {game.isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                <span>Suara Mati</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Efek Suara Aktif</span>
              </>
            )}
          </button>
        </div>

        {/* Step 1: Goal & Scenario */}
        {activeStep === 1 && (
          <div className="animate-in fade-in duration-300">
            <TheoryGoalCard
              title={title}
              summary={summaryText}
              objective={objective}
              cefr={cefr}
              orderIndex={orderIndex}
              unlockedStep={unlockedStep}
              isPracticeUnlocked={isPracticeUnlocked}
              onScrollToStep={() => {}}
              onNext={onNextStep || (() => {})}
              onPlayAudio={onPlayAudio}
              rules={rules}
              targetSentence={bestExample}
              targetSentenceMeaning={exampleMeaning}
            />
          </div>
        )}

        {/* Step 2: Action Sandbox Kalimat & Common Mistakes */}
        {activeStep === 2 && (
          <div className="animate-in fade-in duration-300">
            <TheoryConceptDeep
              title={title}
              summary={summaryText}
              rules={rules}
              vocabItems={vocabItems}
              commonTrap={commonTrap}
              onNext={onNextStep || (() => {})}
              onCompleteStep={() => onStepComplete?.(2)}
              onAwardXp={game.awardXp}
              onPenalizeWrong={game.penalizeWrong}
              onPlayAudio={onPlayAudio}
              onPlaySnap={game.playSnap}
            />
          </div>
        )}

        {/* Step 3: Rumus & Tangga Contoh */}
        {activeStep === 3 && (
          <div className="animate-in fade-in duration-300">
            <TheoryThreeTierExamples
              rules={rules}
              onPlayAudio={onPlayAudio}
              onNext={onNextStep || (() => {})}
              onAwardXp={game.awardXp}
              onPenalizeWrong={game.penalizeWrong}
              onPlaySnap={game.playSnap}
              targetSentence={bestExample}
              targetSentenceMeaning={exampleMeaning}
            />
          </div>
        )}

        {/* Step 4: Kosakata Kunci */}
        {activeStep === 4 && (
          <div className="animate-in fade-in duration-300">
            <TheoryVocabStep
              vocabItems={vocabItems}
              onPlayAudio={onPlayAudio}
              onNext={onNextStep || (() => {})}
              onCompleteStep={() => onStepComplete?.(4)}
            />
          </div>
        )}

        {/* Step 5: Percakapan Nyata */}
        {activeStep === 5 && (
          <div className="animate-in fade-in duration-300">
            <TheoryDialogueStep
              context={dialogueContext}
              lines={dialogueLines}
              analysis={theoryContent?.contextualAnalysis}
              onPlayAudio={onPlayAudio}
              onNext={onNextStep || (() => {})}
            />
          </div>
        )}

        {/* Step 6: Uji Kesiapan & Mini Trial */}
        {activeStep === 6 && (
          <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
            <TheoryReadinessCheck
              questions={theoryContent?.readinessQuestions}
              rules={rules}
              commonTrap={commonTrap}
              vocabItems={vocabItems}
              dialogueLines={dialogueLines}
              moduleTitle={title}
              orderIndex={orderIndex}
              summaryText={summaryText}
              bestExample={bestExample}
              onNext={() => {}}
              onCompleteStep={() => onStepComplete?.(6)}
              onAwardXp={game.awardXp}
              onPenalizeWrong={game.penalizeWrong}
            />

            <div className="pt-12 sm:pt-16 border-t border-slate-200/80 dark:border-slate-800">
              <TheoryMiniTrial
                exampleSentence={bestExample}
                exampleMeaning={exampleMeaning}
                onPlayAudio={onPlayAudio}
                onAdvanceToPractice={() => {
                  game.awardMilestoneCelebrate();
                  onAdvanceToPractice();
                }}
                isPracticeUnlocked={isPracticeUnlocked}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Sticky 6-Milestone Progress Tracker with Gamification Live HUD */}
      <TheoryStepper
        unlockedStep={unlockedStep}
        onScrollToStep={handleScrollToStep}
        isPracticeUnlocked={isPracticeUnlocked}
        xp={game.xp}
        streak={game.streak}
        floatingList={game.floatingList}
        isMuted={game.isMuted}
        onToggleMute={game.toggleMute}
      />

      {/* 1-PAGE PROGRESSIVE VERTICAL TEACHING JOURNEY */}
      <div className="space-y-16 sm:space-y-20">
        {/* Blok 1: Orientasi & Konteks Nyata */}
        <div id="theory-step-1" className="scroll-mt-36">
          <TheoryGoalCard
            title={title}
            summary={summaryText}
            objective={objective}
            cefr={cefr}
            orderIndex={orderIndex}
            unlockedStep={unlockedStep}
            isPracticeUnlocked={isPracticeUnlocked}
            onScrollToStep={handleScrollToStep}
            onNext={() => handleUnlockAndScroll(2)}
            onPlayAudio={onPlayAudio}
            rules={rules}
            targetSentence={bestExample}
            targetSentenceMeaning={exampleMeaning}
          />
        </div>

        {/* Blok 2: Konsep, Anatomi & Sandbox */}
        {unlockedStep >= 2 && (
          <div
            id="theory-step-2"
            className="scroll-mt-36 pt-16 sm:pt-20 border-t border-slate-200/80 dark:border-slate-800 animate-spring-reveal"
          >
            <TheoryConceptDeep
              title={title}
              summary={summaryText}
              rules={rules}
              vocabItems={vocabItems}
              commonTrap={commonTrap}
              onNext={() => handleUnlockAndScroll(3)}
              onCompleteStep={() => setUnlockedStep((prev) => Math.max(prev, 2))}
              onAwardXp={game.awardXp}
              onPenalizeWrong={game.penalizeWrong}
              onPlayAudio={onPlayAudio}
              onPlaySnap={game.playSnap}
            />
          </div>
        )}

        {/* Blok 3: Rumus & 3-Tier Examples Ladder */}
        {unlockedStep >= 3 && (
          <div
            id="theory-step-3"
            className="scroll-mt-36 pt-16 sm:pt-20 border-t border-slate-200/80 dark:border-slate-800 animate-spring-reveal"
          >
            <TheoryThreeTierExamples
              rules={rules}
              onPlayAudio={onPlayAudio}
              onNext={() => handleUnlockAndScroll(4)}
              onAwardXp={game.awardXp}
              onPenalizeWrong={game.penalizeWrong}
              onPlaySnap={game.playSnap}
              targetSentence={bestExample}
              targetSentenceMeaning={exampleMeaning}
            />
          </div>
        )}

        {/* Blok 4: Kosakata & Aplikasi Percakapan */}
        {unlockedStep >= 4 && (
          <div
            id="theory-step-4"
            className="scroll-mt-36 pt-16 sm:pt-20 border-t border-slate-200/80 dark:border-slate-800 space-y-12 sm:space-y-16 animate-spring-reveal"
          >
            <TheoryVocabStep
              vocabItems={vocabItems}
              onPlayAudio={onPlayAudio}
              onNext={() => {
                const el = document.getElementById("substep-dialogue");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onCompleteStep={() => setUnlockedStep((prev) => Math.max(prev, 4))}
            />

            <div id="substep-dialogue" className="pt-12 sm:pt-16 border-t border-slate-200/70 dark:border-slate-800">
              <TheoryDialogueStep
                context={dialogueContext}
                lines={dialogueLines}
                analysis={theoryContent?.contextualAnalysis}
                onPlayAudio={onPlayAudio}
                onNext={() => handleUnlockAndScroll(5)}
              />
            </div>
          </div>
        )}

        {/* Blok 5: Cek Kesiapan Belajar */}
        {unlockedStep >= 5 && (
          <div
            id="theory-step-5"
            className="scroll-mt-36 pt-16 sm:pt-20 border-t border-slate-200/80 dark:border-slate-800 animate-spring-reveal"
          >
            <TheoryReadinessCheck
              questions={theoryContent?.readinessQuestions}
              rules={rules}
              commonTrap={commonTrap}
              vocabItems={vocabItems}
              dialogueLines={dialogueLines}
              moduleTitle={title}
              orderIndex={orderIndex}
              summaryText={summaryText}
              bestExample={bestExample}
              onNext={() => handleUnlockAndScroll(6)}
              onCompleteStep={() => setUnlockedStep((prev) => Math.max(prev, 6))}
              onAwardXp={game.awardXp}
              onPenalizeWrong={game.penalizeWrong}
            />
          </div>
        )}

        {/* Blok 6: Percobaan Pemula (Trial) */}
        {unlockedStep >= 6 && (
          <div
            id="theory-step-6"
            className="scroll-mt-36 pt-16 sm:pt-20 border-t border-slate-200/80 dark:border-slate-800 animate-spring-reveal"
          >
            <TheoryMiniTrial
              exampleSentence={bestExample}
              exampleMeaning={exampleMeaning}
              onPlayAudio={onPlayAudio}
              onAdvanceToPractice={() => {
                game.awardMilestoneCelebrate();
                onAdvanceToPractice();
              }}
              isPracticeUnlocked={isPracticeUnlocked}
            />
          </div>
        )}
      </div>
    </div>
  );
}
