/**
 * Eddys AI — Universal Module Content & Learning Framework (v2) Types
 * Reference: data/Eddys_AI_Universal_Module_Framework_v2.md
 */

export interface DiscoverNotice {
  targetSentence: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WhyPurpose {
  reason: string;
  withoutConcept: string;
  withConcept: string;
}

export interface CommonTrap {
  trapTitle?: string;
  explanation: string;
  wrong: string;
  correct: string;
}

export interface ContextualAnalysis {
  keySentence: string;
  breakdown: string[];
  takeaway: string;
}

export interface VocabItemV2 {
  word: string;
  ipa: string;
  meaning: string;
  collocation: string;
}

export interface DialogueLineV2 {
  speaker: string;
  text: string;
  translation: string;
}

export interface QuizQuestionV2 {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleSectionsV2 {
  theory: {
    summary: string;
    discoverNotice?: DiscoverNotice;
    whyPurpose?: WhyPurpose;
    rules: Array<Record<string, string> | string>;
    commonTrap: CommonTrap;
  };
  vocab: VocabItemV2[];
  dialogue: {
    context: string;
    lines: DialogueLineV2[];
    contextualAnalysis?: ContextualAnalysis;
  };
  speakingLab: {
    scenario: string;
    role: string;
    partnerRole: string;
    starterPrompt: string;
    targetPhrases: string[];
  };
  quiz: {
    questions: QuizQuestionV2[];
  };
}

export interface CurriculumModuleV2 {
  id: string; // e.g. "C1.1-M01"
  levelId: string; // e.g. "C1.1"
  title: string;
  cefr: string; // e.g. "C1"
  group: string;
  objective: string;
  orderIndex: number;
  isExam?: boolean;
  passingScore?: number;
  sections: ModuleSectionsV2;
}

export const FRAMEWORK_V2_PROMPT_GUIDELINES = `
Eddys AI Universal Module Framework v2 Architecture:
1. Discover/Notice: Present an observation question with targetSentence, question, options (3), correctIndex, and explanation before teaching rules.
2. Why & Purpose: Clarify the reason for this grammatical/lexical choice, comparing withoutConcept (confusing/wrong) vs withConcept (natural & precise).
3. Core Rules & Pattern: Clear grammatical formula and rules.
4. Common Mistakes (CommonTrap): wrong vs correct sentence with actionable explanation.
5. Vocab: 6-8 items with word, ipa, meaning, collocation in context.
6. Dialogue & Contextual Analysis: Realistic two-party dialogue + 'Let's Analyze' breakdown highlighting key sentence structures and takeaways.
7. Speaking Lab: scenario, role, partnerRole, starterPrompt, targetPhrases for live AI roleplay.
8. Quiz: 5 comprehensive multiple-choice questions with clear explanations.
`;
