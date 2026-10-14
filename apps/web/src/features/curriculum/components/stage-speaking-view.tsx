"use client";

import React from "react";
import { SpeakingOverviewStage } from "./speaking-overview-stage";
import { SpeakingSyllableStage } from "./speaking-syllable-stage";
import { SpeakingReflexDrills } from "./speaking-reflex-drills";
import { SpeakingRoleplayStage } from "./speaking-roleplay-stage";
import { SpeakingPracticumStage } from "./speaking-practicum-stage";

interface StageSpeakingViewProps {
  activeStepId: number;
  theorySec: any;
  practiceSec: any;
  quizSec?: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onNextStep?: () => void;
  cefr?: string;
}

export function StageSpeakingView({
  activeStepId,
  theorySec,
  practiceSec,
  quizSec,
  tutor,
  onRewardXp,
  onNextStep,
  cefr = "A1.1",
}: StageSpeakingViewProps) {
  return (
    <div className="space-y-6">
      {/* STEP 1: Overview & 3 Pronunciation Pillars */}
      {activeStepId === 1 && (
        <SpeakingOverviewStage
          theorySec={theorySec}
          tutor={tutor}
          onRewardXp={onRewardXp}
          onNextStep={onNextStep}
        />
      )}

      {/* STEP 2: Syllable Stress Shift Drills (Backend TTS & 6 Pairs) */}
      {activeStepId === 2 && (
        <SpeakingSyllableStage
          practiceSec={practiceSec}
          tutor={tutor}
          onRewardXp={onRewardXp}
        />
      )}

      {/* STEP 3: Oral Reflex Drills (Listen, Repeat & Compare Audio) */}
      {activeStepId === 3 && (
        <SpeakingReflexDrills
          practiceSec={practiceSec}
          tutor={tutor}
          onRewardXp={onRewardXp}
        />
      )}

      {/* STEP 4: Live AI Roleplay Call with Mr. Khoirul */}
      {activeStepId === 4 && (
        <SpeakingRoleplayStage
          practiceSec={practiceSec}
          tutor={tutor}
          onRewardXp={onRewardXp}
          onNextStep={onNextStep}
        />
      )}

      {/* STEP 5: Speaking Practicum (10 Combination Oral Questions) */}
      {activeStepId === 5 && (
        <SpeakingPracticumStage
          quizSec={quizSec}
          tutor={tutor}
          onRewardXp={onRewardXp}
          onNextStep={onNextStep}
        />
      )}
    </div>
  );
}
