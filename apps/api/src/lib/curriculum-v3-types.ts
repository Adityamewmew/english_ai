/**
 * Eddys AI — Universal Learning Module Framework (v3)
 * Teaching Skeleton for All Module Types
 * Reference: data/Eddys_AI_Universal_Learning_Module_Framework_v3.md
 */

export interface LearningMapNodeV3 {
  step: number;
  title: string;
  subtitle: string;
  tag: string;
}

export interface ComponentAnatomyItemV3 {
  name: string;
  desc: string;
  badge?: string;
}

export interface ThreeTierExampleV3 {
  level: "simple" | "contextual" | "applied";
  sentence: string;
  meaning: string;
  note?: string;
}

export interface ReadinessQuestionV3 {
  id: number;
  category: "Pengenalan Bentuk" | "Pemahaman Aturan" | "Penerapan Konteks";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VocabItemV3 {
  word: string;
  ipa: string;
  meaning: string;
  collocation: string;
}

export interface DialogueLineV3 {
  speaker: string;
  text: string;
  translation: string;
}

export interface ContextualAnalysisV3 {
  keySentence: string;
  breakdown: string[];
  takeaway: string;
}

export interface ModuleSectionsV3 {
  theory: {
    summary: string;
    whatIsIt?: string;
    whyMatter?: string;
    components?: ComponentAnatomyItemV3[];
    rules: Array<Record<string, string> | string>;
    threeTierExamples?: ThreeTierExampleV3[];
    commonTrap: {
      trapTitle?: string;
      explanation: string;
      wrong: string;
      correct: string;
    };
    readinessQuestions?: ReadinessQuestionV3[];
  };
  vocab: VocabItemV3[];
  dialogue: {
    context: string;
    lines: DialogueLineV3[];
    contextualAnalysis?: ContextualAnalysisV3;
  };
  speakingLab: {
    scenario: string;
    role: string;
    partnerRole: string;
    starterPrompt: string;
    targetPhrases: string[];
  };
  quiz: {
    questions: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
  };
}

export interface CurriculumModuleV3 {
  id: string; // e.g. "C1.1-M01"
  levelId: string; // e.g. "C1.1"
  title: string;
  cefr: string; // e.g. "C1"
  group: string;
  objective: string;
  orderIndex: number;
  isExam?: boolean;
  passingScore?: number;
  sections: ModuleSectionsV3;
}

export const FRAMEWORK_V3_TEACHING_SKELETON_PROMPT = `
Eddys AI Universal Learning Module Framework (v3) - Teaching Skeleton:
1. Module Orientation & Learning Map: What are we learning + visual roadmap from concept to practicum.
2. What Is It & Why Does It Matter: Clear conceptual definition + purpose/value in real-world English.
3. What Does It Include: Anatomy breakdown of the topic's key components.
4. How Does It Work & Structure: Visual grammatical formula and patterns.
5. Progression of Examples (3-Tier Ladder):
   - Simple: fundamental pattern
   - Contextual: enriched with adjectives/location
   - Applied: natural compound discourse in realistic scenario
6. Key Knowledge & Vocab: 6-8 contextual vocabulary cards with IPA, Indonesian meaning, and real-life collocation.
7. Contextual Dialogue & Let's Analyze: Realistic two-party dialogue + deep breakdown of sentence construction.
8. Common Mistakes: Wrong vs Correct sentence with actionable linguistic explanation.
9. 3-Question Readiness Check:
   - Question 1: Recognize form
   - Question 2: Understand rule
   - Question 3: Apply in situation
   - Instant feedback format: Acknowledge -> Correct -> Explain -> Retry.
10. Mini Trial: Writing fill-in & Speaking microphone practice bridging into Phase 2.
11. Phase 2 (Speaking Lab & 5-question comprehensive evaluation quiz).
`;
