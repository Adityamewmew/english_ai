"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { GamifiedMatchPairs } from "./gamified-match-pairs";
import { InteractiveContractionMorpher } from "./interactive-contraction-morpher";
import { InteractiveVocabCard } from "./interactive-vocab-card";
import { InteractiveVocabDeckMobile } from "./interactive-vocab-deck-mobile";
import { InteractiveReadingPassage } from "./interactive-reading-passage";
import { InteractiveGrammarCard } from "./interactive-grammar-card";
import { ConceptChecksCard } from "./concept-checks-card";
import { StageReadingOnboarding } from "./stage-reading-onboarding";

interface StageReadingViewProps {
  activeStepId: number;
  theorySec: any;
  vocabSec: any;
  dialogueSec?: any;
  practiceSec?: any;
  quizSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onIncrementCombo: () => void;
  onResetCombo: () => void;
  cefr?: string;
  onNextStep?: () => void;
  onStepComplete?: () => void;
  initialAnswers?: Record<string, any>;
  onAnswersChange?: (answers: Record<string, any>) => void;
}

export function StageReadingView({
  activeStepId,
  theorySec,
  vocabSec,
  dialogueSec,
  practiceSec,
  quizSec,
  tutor,
  onRewardXp,
  onIncrementCombo,
  onResetCombo,
  cefr = "A1.1",
  onNextStep,
  onStepComplete,
  initialAnswers,
  onAnswersChange,
}: StageReadingViewProps) {
  const vocabItems = vocabSec?.content?.items || theorySec?.content?.items || [];
  const readingPassage = dialogueSec?.content || theorySec?.content?.readingPassage || theorySec?.content;
  const rules = theorySec?.content?.rules || [];
  const contractions = theorySec?.content?.contractions || [];
  const grammarFormulas = theorySec?.content?.grammarFormulas || null;
  const postTestQuestions =
    quizSec?.content?.questions ||
    theorySec?.content?.postTestQuestions ||
    theorySec?.content?.conceptChecks ||
    [];

  const summaryText =
    theorySec?.content?.summary ||
    "In this session, you will read a simple self-introduction passage. You will learn to identify names, countries of origin, and use the verb 'to be' accurately in context.";
  const passageTitle =
    readingPassage?.passageTitle || readingPassage?.title || "Guided Reading Passage";

  const [showPassageHint, setShowPassageHint] = useState(false);

  const passageParagraphs: string[] = Array.isArray(readingPassage?.paragraphs)
    ? readingPassage.paragraphs
    : typeof readingPassage?.text === "string"
    ? [readingPassage.text]
    : typeof readingPassage?.content === "string"
    ? [readingPassage.content]
    : [];

  return (
    <div className="space-y-6">
      {/* Step 1: Onboarding & Detailed Mission Briefing */}
      {activeStepId === 1 && (
        <StageReadingOnboarding
          passageTitle={passageTitle}
          summaryText={summaryText}
          vocabItems={vocabItems}
          linguisticTarget={theorySec?.content?.linguisticTarget}
          warmupData={theorySec?.content?.contextWarmup}
          onPlayAudio={tutor.playTutorAudio}
          onNextStep={onNextStep}
          onRewardXp={onRewardXp}
        />
      )}

      {/* Step 2: Interactive 3D Flashcards */}
      {activeStepId === 2 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-2">
            <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Step 2 · Key Vocabulary ({vocabItems.length} Words)
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Master Key Vocabulary Before Reading
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              Tap each card to flip for the English definition and listen to native English pronunciation:
            </p>
          </div>

          {/* Mobile 1-by-1 Deck View (<sm): Zero vertical scroll, thumb-friendly navigation */}
          <div className="sm:hidden" onClick={() => onStepComplete?.()}>
            <InteractiveVocabDeckMobile items={vocabItems} onPlayAudio={(t) => { tutor.playTutorAudio(t); onStepComplete?.(); }} />
          </div>

          {/* Desktop Multi-Card Grid (>=sm) */}
          <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onClick={() => onStepComplete?.()}>
            {vocabItems.map((item: any, idx: number) => (
              <InteractiveVocabCard key={idx} item={item} onPlayAudio={(t) => { tutor.playTutorAudio(t); onStepComplete?.(); }} />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Guided Karaoke Reading */}
      {activeStepId === 3 && (
        <div className="space-y-5 animate-in fade-in duration-300" onClick={() => onStepComplete?.()}>
          <div className="space-y-1.5 pb-2">
            <span className="text-xs font-heading font-bold text-[#10375C] dark:text-[#F4B41A] uppercase tracking-wider">
              Step 3 · Guided Reading Passage
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              {passageTitle}
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              Read comfortably. Tap any sentence to listen, or tap underlined words to view explanations.
            </p>
          </div>

          {/* Grammar in Use Banner */}
          {theorySec?.content?.linguisticTarget?.grammar && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-heading text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-[#F4B41A] text-slate-900 shrink-0">
                  Grammar in Use
                </span>
                <span className="font-sans text-slate-800 dark:text-slate-200 font-semibold">
                  {theorySec.content.linguisticTarget.grammar}
                </span>
              </div>
              <span className="font-sans text-amber-800 dark:text-amber-300 text-[11px] hidden sm:inline">
                Key patterns are highlighted with subtle dotted underlines
              </span>
            </div>
          )}
          {readingPassage && (
            <InteractiveReadingPassage
              passage={readingPassage}
              linguisticTarget={theorySec?.content?.linguisticTarget}
              onPlayAudio={(t) => { tutor.playTutorAudio(t); onStepComplete?.(); }}
              embedded={true}
            />
          )}
        </div>
      )}

      {/* Step 4: Cable Connection Mini-Game */}
      {activeStepId === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Step 4 · Vocabulary Match Game
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Match Words with Their Correct Meanings
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              Connect the English word pin on the left with its matching definition on the right:
            </p>
          </div>
          <GamifiedMatchPairs
            items={vocabItems}
            onRewardXp={onRewardXp}
            onIncrementCombo={onIncrementCombo}
            onResetCombo={onResetCombo}
            onCompleted={onStepComplete}
            embedded={true}
          />
        </div>
      )}

      {/* Step 5: Contraction Morpher Machine */}
      {activeStepId === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300" onClick={() => onStepComplete?.()}>
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Step 5 · {theorySec?.content?.contractionsLabel || "Contraction Morpher"}
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              {theorySec?.content?.contractionsTitle || `Natural Spoken Contractions (${theorySec?.content?.linguisticTarget?.grammar || "Grammar Focus"})`}
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              {theorySec?.content?.contractionsSubtitle || "Observe how subjects and verbs smoothly merge in natural spoken English:"}
            </p>
          </div>
          <InteractiveContractionMorpher contractions={contractions} embedded={true} />
        </div>
      )}

      {/* Step 6: Interactive Grammar Sentence Builder */}
      {activeStepId === 6 && (
        <div className="space-y-6 animate-in fade-in duration-300" onClick={() => onStepComplete?.()}>
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Step 6 · {grammarFormulas?.label || "Sentence Patterns"}
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              {grammarFormulas?.title || `Sentence Patterns (${theorySec?.content?.linguisticTarget?.grammar || "Grammar Formula"})`}
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              {grammarFormulas?.description || "Assemble sentence blocks to explore affirmative, negative, and question patterns:"}
            </p>
          </div>
          <InteractiveGrammarCard
            rules={rules}
            formulas={grammarFormulas}
            onPlayAudio={(t) => { tutor.playTutorAudio(t); onStepComplete?.(); }}
            embedded={true}
          />
        </div>
      )}

      {/* Step 7: Reading Comprehension Checkpoint Quiz */}
      {activeStepId === 7 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-2">
            <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Step 7 · Comprehension Quiz ({postTestQuestions.length} Questions)
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              {quizSec?.title || "Reading Comprehension Quiz"}
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              Answer the following comprehension questions to complete your reading mission:
            </p>
          </div>

          {/* Hint Banner: Refers back to Step 3 with expandable drawer */}
          <div className="rounded-2xl border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                    Reading Passage Hint
                  </h4>
                  <p className="text-xs sm:text-sm font-sans text-amber-900/90 dark:text-amber-300/90 leading-relaxed mt-0.5">
                    All answers to these questions are drawn directly from the reading text in <strong>Step 3 (Guided Reading)</strong>.
                  </p>
                </div>
              </div>

              {passageParagraphs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassageHint((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-[#10375C] dark:text-[#F4B41A] text-xs font-heading font-bold border border-amber-300/80 dark:border-amber-700/80 hover:bg-amber-100/50 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 shadow-2xs self-start sm:self-center"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{showPassageHint ? "Hide Passage" : "Open Reading Passage (Step 3)"}</span>
                  {showPassageHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Expandable Passage Drawer */}
            {showPassageHint && passageParagraphs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200/80 dark:border-amber-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-amber-200/60 dark:border-slate-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#10375C] dark:text-[#F4B41A]">
                      Step 3 Reference Passage: {passageTitle}
                    </span>
                    <span className="text-[11px] font-sans text-slate-500">
                      Reading Reference
                    </span>
                  </div>
                  <div className="space-y-3 font-sans text-sm sm:text-base leading-[1.85] text-slate-800 dark:text-slate-200">
                    {passageParagraphs.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <ConceptChecksCard
            conceptChecks={postTestQuestions}
            accentColor="blue"
            embedded={true}
            onCompleted={onStepComplete}
            initialAnswers={initialAnswers}
            onAnswersChange={onAnswersChange}
          />
        </div>
      )}
    </div>
  );
}
