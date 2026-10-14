"use client";

import React from "react";
import { WritingOverviewStage } from "./writing-overview-stage";
import { WritingMechanicsStage } from "./writing-mechanics-stage";
import { WritingSentenceBuilder } from "./writing-sentence-builder";
import { WritingGuidedLab } from "./writing-guided-lab";
import { WritingPracticumStage } from "./writing-practicum-stage";

interface StageWritingViewProps {
  activeStepId: number;
  theorySec?: any;
  practiceSec?: any;
  quizSec?: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onNextStep?: () => void;
  cefr?: string;
}

export function StageWritingView({
  activeStepId,
  theorySec,
  practiceSec,
  quizSec,
  tutor,
  onRewardXp,
  onNextStep,
}: StageWritingViewProps) {
  return (
    <div className="space-y-6">
      {/* STEP 1: Sentence Blueprint Formula & Mechanics Overview */}
      {activeStepId === 1 && (
        <WritingOverviewStage
          theorySec={theorySec}
          tutor={tutor}
          onGoToNext={() => onNextStep?.()}
        />
      )}

      {/* STEP 2: Spot & Fix Mechanics (Real typing sentence rewrite) */}
      {activeStepId === 2 && (
        <WritingMechanicsStage
          practiceSec={practiceSec}
          onRewardXp={onRewardXp}
          tutor={tutor}
          onGoToNext={() => onNextStep?.()}
        />
      )}

      {/* STEP 3: Word Chip Sentence Builder (Sentence building from database/json) */}
      {activeStepId === 3 && (
        <WritingSentenceBuilder
          practiceSec={practiceSec}
          onRewardXp={onRewardXp}
          tutor={tutor}
          onGoToNext={() => onNextStep?.()}
        />
      )}

      {/* STEP 4: Guided Profile Writing Lab (Progressive writing lab from database/json) */}
      {activeStepId === 4 && (
        <WritingGuidedLab
          practiceSec={practiceSec}
          onRewardXp={onRewardXp}
          onGoToNext={() => onNextStep?.()}
        />
      )}

      {/* STEP 5: Writing Mastery Practicum (10 authentic typing questions from database/json) */}
      {activeStepId === 5 && (
        <WritingPracticumStage
          quizSec={quizSec}
          onRewardXp={onRewardXp}
          tutor={tutor}
          onFinish={() => onNextStep?.()}
        />
      )}
    </div>
  );
}
