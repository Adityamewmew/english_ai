import { TIER_EASY_BANK } from "../../../../db/generator/exam-tiers/tier-easy";
import { TIER_MEDIUM_BANK } from "../../../../db/generator/exam-tiers/tier-medium";
import { TIER_HARD_BANK } from "../../../../db/generator/exam-tiers/tier-hard";

export interface BuildAssessmentParams {
  unitId: string;
  title: string;
  cefr: string;
  existingSubmodules?: any[];
  dbQuestions?: {
    reading?: any[];
    listening?: any[];
    writing?: any[];
    speaking?: any[];
  };
}

export function resolveCefrTier(cefr: string) {
  const upper = (cefr || "A1").toUpperCase();
  if (upper.startsWith("C1") || upper.startsWith("C2")) {
    return {
      tier: "hard" as const,
      passingScore: 80,
      bank: TIER_HARD_BANK,
    };
  }
  if (upper.startsWith("B1") || upper.startsWith("B2")) {
    return {
      tier: "medium" as const,
      passingScore: 75,
      bank: TIER_MEDIUM_BANK,
    };
  }
  return {
    tier: "easy" as const,
    passingScore: 70,
    bank: TIER_EASY_BANK,
  };
}

export function rotateSlice<T>(arr: T[], offset: number, count: number): T[] {
  if (!arr || arr.length === 0) return [];
  const result: T[] = [];
  const len = arr.length;
  for (let i = 0; i < count; i++) {
    const idx = (offset + i) % len;
    result.push(arr[idx]);
  }
  return result;
}

export function buildAssessmentSubmodule(params: BuildAssessmentParams) {
  const { unitId, title, cefr, existingSubmodules = [], dbQuestions } = params;
  const tierInfo = resolveCefrTier(cefr);

  const cleanId = (unitId || "custom-module").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const unitNumMatch = unitId.match(/M?(\d+)/i);
  const unitNum = unitNumMatch ? parseInt(unitNumMatch[1], 10) : 1;
  const offset = (unitNum * 3) % 15;

  const unitReadingQs: any[] = [...(dbQuestions?.reading || [])];
  const unitListeningQs: any[] = [...(dbQuestions?.listening || [])];
  const unitWritingQs: any[] = [...(dbQuestions?.writing || [])];
  const unitSpeakingQs: any[] = [...(dbQuestions?.speaking || [])];

  for (const sub of existingSubmodules) {
    const quizSec = sub.sections?.find((s: any) => s.sectionType === "quiz");
    const content = quizSec?.content;
    if (!content) continue;

    if (sub.skillType === "reading") {
      unitReadingQs.push(...(content.questions || []));
    } else if (sub.skillType === "listening") {
      unitListeningQs.push(...(content.practicumQuestions || content.questions || []));
    } else if (sub.skillType === "writing") {
      unitWritingQs.push(...(content.practicumQuestions || content.questions || []));
    } else if (sub.skillType === "speaking") {
      unitSpeakingQs.push(...(content.practicumQuestions || content.questions || []));
    }
  }

  // 1. Reading Pool (15 Qs)
  const readingPool = [...unitReadingQs, ...rotateSlice(tierInfo.bank.reading, offset, 15)];
  const finalReading = rotateSlice(readingPool, 0, 15).map((q, idx) => ({
    ...q,
    id: `q-${cleanId}-r-${idx + 1}`,
    part: "reading",
    partIndex: idx + 1,
    sourceModule: unitId,
  }));

  // 2. Listening Pool (15 Qs)
  const listeningPool = [...unitListeningQs, ...rotateSlice(tierInfo.bank.listening, offset, 15)];
  const finalListening = rotateSlice(listeningPool, 0, 15).map((q, idx) => ({
    ...q,
    id: `q-${cleanId}-l-${idx + 1}`,
    part: "listening",
    partIndex: idx + 1,
    sourceModule: unitId,
  }));

  // 3. Writing Pool (10 Qs)
  const writingPool = [...unitWritingQs, ...rotateSlice(tierInfo.bank.writing, offset, 10)];
  const finalWriting = rotateSlice(writingPool, 0, 10).map((q, idx) => ({
    ...q,
    id: `q-${cleanId}-w-${idx + 1}`,
    part: "writing",
    partIndex: idx + 1,
    sourceModule: unitId,
  }));

  // 4. Speaking Pool (15 Qs)
  const speakingPool = [...unitSpeakingQs, ...rotateSlice(tierInfo.bank.speaking, offset, 15)];
  const finalSpeaking = rotateSlice(speakingPool, 0, 15).map((q, idx) => ({
    ...q,
    id: `q-${cleanId}-s-${idx + 1}`,
    part: "speaking",
    partIndex: idx + 1,
    sourceModule: unitId,
  }));

  const allQuestions = [
    ...finalReading,
    ...finalListening,
    ...finalWriting,
    ...finalSpeaking,
  ];

  const subModuleId = `sub-${cleanId}-assessment`;

  return {
    id: subModuleId,
    moduleId: unitId,
    skillType: "assessment",
    title: `Final Mission: Unit Assessment (55 Soal)`,
    theme: `All-Skills Mastery Evaluation (${tierInfo.tier.toUpperCase()})`,
    orderIndex: 5,
    sections: [
      {
        id: `sec-${cleanId}-theory`,
        moduleId: unitId,
        subModuleId,
        sectionType: "theory",
        title: "Unit Final Mission Guidelines & Criteria",
        orderIndex: 1,
        content: {
          summary: `Official unit assessment for ${title}. Tests 4 integrated competencies: Reading (15), Listening (15), Writing (10), Speaking (15).`,
          totalQuestions: 55,
          passingScore: tierInfo.passingScore,
          estimatedMinutes: 40,
          difficultyTier: tierInfo.tier,
          parts: [
            { part: 1, name: "Reading Comprehension & Lexicogrammar", count: 15 },
            { part: 2, name: "Listening Auditory Synthesis", count: 15 },
            { part: 3, name: "Written Production & Discourse", count: 10 },
            { part: 4, name: "Spoken Fluency & Oral Interaction", count: 15 },
          ],
        },
      },
      {
        id: `sec-${cleanId}-quiz`,
        moduleId: unitId,
        subModuleId,
        sectionType: "quiz",
        title: `Unit Mastery Quiz: 55 Items`,
        orderIndex: 2,
        content: {
          passingScore: tierInfo.passingScore,
          totalQuestions: 55,
          difficultyTier: tierInfo.tier,
          parts: {
            reading: finalReading,
            listening: finalListening,
            writing: finalWriting,
            speaking: finalSpeaking,
          },
          questions: allQuestions,
          practicumQuestions: allQuestions,
        },
      },
    ],
  };
}
