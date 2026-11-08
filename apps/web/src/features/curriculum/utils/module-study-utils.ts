import type { PlaylistStepItem } from "../components/module-stage-playlist";

/**
 * Returns the sequence of learning stages for a given skill type.
 */
export function getPlaylistSteps(
  skillType: string,
  completedSteps: number[]
): PlaylistStepItem[] {
  if (skillType === "assessment" || skillType === "exam") {
    return [
      { id: 1, title: "1. Assessment Guide & Criteria", type: "Overview", duration: "3 min", isCompleted: completedSteps.includes(1) },
      { id: 2, title: "2. Part 1: Reading Comprehension (15 Questions)", type: "Reading", duration: "12 min", isCompleted: completedSteps.includes(2) },
      { id: 3, title: "3. Part 2: Auditory Listening (15 Questions)", type: "Listening", duration: "12 min", isCompleted: completedSteps.includes(3) },
      { id: 4, title: "4. Part 3: Written Production (10 Questions)", type: "Writing", duration: "10 min", isCompleted: completedSteps.includes(4) },
      { id: 5, title: "5. Part 4: Spoken Fluency (15 Questions)", type: "Speaking", duration: "12 min", isCompleted: completedSteps.includes(5) },
      { id: 6, title: "6. Scorecard & Official Certificate", type: "Certificate", duration: "3 min", isCompleted: completedSteps.includes(6) },
    ];
  }

  if (skillType === "listening") {
    return [
      { id: 1, title: "1. Scenario & Briefing", type: "Context", duration: "3 min", isCompleted: completedSteps.includes(1) },
      { id: 2, title: "2. Multi-Speaker Audio Player", type: "Dialogue", duration: "6 min", isCompleted: completedSteps.includes(2) },
      { id: 3, title: "3. Spoken Contraction Trainer", type: "Ear Trainer", duration: "4 min", isCompleted: completedSteps.includes(3) },
      { id: 4, title: "4. Audio Dictation & Echo", type: "Practice", duration: "5 min", isCompleted: completedSteps.includes(4) },
      { id: 5, title: "5. Listening Practicum (10 Tasks)", type: "Practicum", duration: "6 min", isCompleted: completedSteps.includes(5) },
    ];
  }

  if (skillType === "writing") {
    return [
      { id: 1, title: "1. Sentence Anatomy Formula", type: "Mechanics", duration: "3 min", isCompleted: completedSteps.includes(1) },
      { id: 2, title: "2. Spot & Fix Writing Mechanics", type: "Interactive", duration: "4 min", isCompleted: completedSteps.includes(2) },
      { id: 3, title: "3. Word Chip Sentence Builder", type: "Mini-Game", duration: "5 min", isCompleted: completedSteps.includes(3) },
      { id: 4, title: "4. Profile Writing Lab", type: "Writing Lab", duration: "6 min", isCompleted: completedSteps.includes(4) },
      { id: 5, title: "5. Writing Syntax Evaluation", type: "Evaluation", duration: "5 min", isCompleted: completedSteps.includes(5) },
    ];
  }

  if (skillType === "speaking") {
    return [
      { id: 1, title: "1. Intonation & Pitch Guide", type: "Phonetics", duration: "3 min", isCompleted: completedSteps.includes(1) },
      { id: 2, title: "2. Syllable Stress Rhythm Drills", type: "Rhythm Pads", duration: "4 min", isCompleted: completedSteps.includes(2) },
      { id: 3, title: "3. Oral Reflex Sentence Drills", type: "Listen & Repeat", duration: "5 min", isCompleted: completedSteps.includes(3) },
      { id: 4, title: "4. Live AI Tutor Roleplay", type: "Voice Call", duration: "6 min", isCompleted: completedSteps.includes(4) },
      { id: 5, title: "5. Speaking Mastery Evaluation", type: "Assessment", duration: "4 min", isCompleted: completedSteps.includes(5) },
    ];
  }

  // Default: reading (Natural Pedagogical Flow: Vocab -> Story -> Puzzle -> Grammar -> Quiz)
  return [
    { id: 1, title: "1. Mission Briefing & Story Context", type: "Overview", duration: "3 min", isCompleted: completedSteps.includes(1) },
    { id: 2, title: "2. 3D Key Vocab Flashcards", type: "Interactive", duration: "4 min", isCompleted: completedSteps.includes(2) },
    { id: 3, title: "3. Guided Karaoke Reading", type: "Audio Read", duration: "6 min", isCompleted: completedSteps.includes(3) },
    { id: 4, title: "4. Match Madness Game", type: "Mini-Game", duration: "5 min", isCompleted: completedSteps.includes(4) },
    { id: 5, title: "5. Contraction Morpher Machine", type: "Grammar Lab", duration: "4 min", isCompleted: completedSteps.includes(5) },
    { id: 6, title: "6. Grammar Rules & Formulas", type: "Theory", duration: "5 min", isCompleted: completedSteps.includes(6) },
    { id: 7, title: "7. Reading Comprehension Quiz", type: "Evaluation", duration: "5 min", isCompleted: completedSteps.includes(7) },
  ];
}

/**
 * Counts total answered questions in an exam state object.
 */
export function countExamAnswers(answers: Record<string, any> | undefined | null): number {
  if (!answers) return 0;
  return Object.keys(answers).filter(
    (k) => !k.startsWith("__") && answers[k] !== undefined && answers[k] !== "" && answers[k] !== null
  ).length;
}
