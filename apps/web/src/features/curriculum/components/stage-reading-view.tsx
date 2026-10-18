"use client";

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
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step 2 · Key Vocabulary ({vocabItems.length} Words)
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Master Key Vocabulary Before Reading
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Tap each card to flip for Indonesian meaning and listen to native English pronunciation:
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
        <div className="space-y-4 animate-in fade-in duration-300" onClick={() => onStepComplete?.()}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step 3 · Guided Reading Passage
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {passageTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Follow along with the passage while listening to word-by-word synchronized audio:
            </p>
          </div>
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step 4 · Vocabulary Match Game
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Match Words with Their Correct Meanings
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Connect the English word pin on the left with its matching Indonesian meaning on the right:
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step 5 · {theorySec?.content?.contractionsLabel || "Contraction Morpher"}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {theorySec?.content?.contractionsTitle || `Natural Spoken Contractions (${theorySec?.content?.linguisticTarget?.grammar || "Grammar Focus"})`}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step 6 · {grammarFormulas?.label || "Sentence Patterns"}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {grammarFormulas?.title || `Sentence Structure (${theorySec?.content?.linguisticTarget?.grammar || "Grammar Formula"})`}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
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
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Step 7 · Comprehension Quiz ({postTestQuestions.length} Questions)
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {quizSec?.title || "Reading Comprehension Quiz"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Answer the following comprehension questions to complete your reading mission:
            </p>
          </div>
          <ConceptChecksCard
            conceptChecks={postTestQuestions}
            accentColor="blue"
            embedded={true}
            onCompleted={onStepComplete}
          />
        </div>
      )}
    </div>
  );
}
