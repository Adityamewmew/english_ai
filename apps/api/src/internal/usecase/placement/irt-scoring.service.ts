export interface ItemScoreData {
  id: string;
  userAnswer?: string;
  correctAnswer: string;
  cefr: string;
  isCorrect: boolean;
}

export interface LevelBreakdownStat {
  correct: number;
  total: number;
  accuracy: number;
}

export interface IrtAssessmentResult {
  overallCefr: string;
  scorePercent: number;
  weightedScore: number;
  maxWeightedScore: number;
  mcqScore: number;
  listeningScore: number;
  writingScore: number;
  speakingScore: number;
  levelBreakdown: Record<string, LevelBreakdownStat>;
  masteryCeiling: string;
  summaryFeedback: string;
}

const CEFR_WEIGHTS: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const ALL_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/**
 * Item-Weighted Psychometric Scoring Engine (IRT & Rasch-aligned)
 * Evaluates objective items with difficulty parameters and determines CEFR mastery ceiling.
 */
export class IrtScoringService {
  static evaluate(params: {
    mcqItems: ItemScoreData[];
    listeningItems: ItemScoreData[];
    writingText?: string;
    speakingTranscript?: string;
  }): IrtAssessmentResult {
    const { mcqItems, listeningItems, writingText, speakingTranscript } = params;

    // 1. Initialize Level Breakdown
    const levelBreakdown: Record<string, LevelBreakdownStat> = {
      A1: { correct: 0, total: 0, accuracy: 0 },
      A2: { correct: 0, total: 0, accuracy: 0 },
      B1: { correct: 0, total: 0, accuracy: 0 },
      B2: { correct: 0, total: 0, accuracy: 0 },
      C1: { correct: 0, total: 0, accuracy: 0 },
      C2: { correct: 0, total: 0, accuracy: 0 },
    };

    let earnedWeighted = 0;
    let maxWeighted = 0;

    let mcqCorrect = 0;
    let mcqTotal = mcqItems.length;

    let lisCorrect = 0;
    let lisTotal = listeningItems.length;

    // 2. Score MCQ Items with Difficulty Weights
    for (const item of mcqItems) {
      const lvl = (item.cefr || "A1").toUpperCase();
      const weight = CEFR_WEIGHTS[lvl] || 1;

      if (!levelBreakdown[lvl]) {
        levelBreakdown[lvl] = { correct: 0, total: 0, accuracy: 0 };
      }
      levelBreakdown[lvl].total++;
      maxWeighted += weight;

      if (item.isCorrect) {
        mcqCorrect++;
        levelBreakdown[lvl].correct++;
        earnedWeighted += weight;
      }
    }

    // 3. Score Listening Items with Difficulty Weights
    for (const item of listeningItems) {
      const lvl = (item.cefr || "A1").toUpperCase();
      const weight = CEFR_WEIGHTS[lvl] || 1;

      if (!levelBreakdown[lvl]) {
        levelBreakdown[lvl] = { correct: 0, total: 0, accuracy: 0 };
      }
      levelBreakdown[lvl].total++;
      maxWeighted += weight;

      if (item.isCorrect) {
        lisCorrect++;
        levelBreakdown[lvl].correct++;
        earnedWeighted += weight;
      }
    }

    // 4. Calculate Accuracies per Level
    for (const lvl of ALL_LEVELS) {
      const stat = levelBreakdown[lvl];
      stat.accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) / 100 : 0;
    }

    // 5. Raw Percentage Scores for Subskills
    const mcqScore = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
    const listeningScore = lisTotal > 0 ? Math.round((lisCorrect / lisTotal) * 100) : 0;

    // 6. Objective Heuristic for Writing & Speaking Tasks
    // Validates completion, lexical engagement, and filters out repetitive gibberish
    const isQualityText = (text?: string): boolean => {
      if (!text) return false;
      const raw = text.trim();
      const words = raw.split(/\s+/).filter(Boolean);
      if (words.length < 5) return false;

      const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
      const lexicalDiversity = uniqueWords.size / words.length;

      // Repetitive spam/gibberish check (e.g. "asdf asdf asdf" or "abc abc abc")
      if (words.length >= 5 && lexicalDiversity < 0.5) return false;

      // Average word length check (e.g. "a a a a a a")
      const totalChars = words.reduce((sum, w) => sum + w.length, 0);
      const avgWordLength = totalChars / words.length;
      if (avgWordLength < 2.5) return false;

      return true;
    };

    const writingWords = (writingText || "").trim().split(/\s+/).filter(Boolean);
    const isValidWriting = isQualityText(writingText);
    let writingScore = 0;
    if (isValidWriting) {
      if (writingWords.length >= 60) writingScore = 90;
      else if (writingWords.length >= 40) writingScore = 75;
      else if (writingWords.length >= 20) writingScore = 60;
      else if (writingWords.length >= 5) writingScore = 40;
    }

    const speakingWords = (speakingTranscript || "").trim().split(/\s+/).filter(Boolean);
    const isValidSpeaking = isQualityText(speakingTranscript);
    let speakingScore = 0;
    if (isValidSpeaking) {
      if (speakingWords.length >= 30) speakingScore = 90;
      else if (speakingWords.length >= 15) speakingScore = 75;
      else if (speakingWords.length >= 5) speakingScore = 55;
    }

    // 7. Calculate Psychometric Weighted Percentage (0-100)
    const scorePercent = maxWeighted > 0
      ? Math.round((earnedWeighted / maxWeighted) * 100)
      : 0;

    // 8. Mastery Ceiling Determination (Top-Down Progressive Assessment)
    // Gated by foundational CEFR requirements and active skill participation
    let determinedCefr = "A1";

    const c2Acc = levelBreakdown.C2.accuracy;
    const c1Acc = levelBreakdown.C1.accuracy;
    const b2Acc = levelBreakdown.B2.accuracy;
    const b1Acc = levelBreakdown.B1.accuracy;
    const a2Acc = levelBreakdown.A2.accuracy;
    const a1Acc = levelBreakdown.A1.accuracy;

    const hasBasicProductiveSkill = writingScore >= 40 || speakingScore >= 55;
    const hasA1Foundation = a1Acc >= 0.5;

    // A learner CANNOT pass into A2+ if they fail A1 basics or submit empty/gibberish productive tasks
    if (hasA1Foundation && hasBasicProductiveSkill) {
      if (
        c2Acc >= 0.5 &&
        (c1Acc >= 0.5 || scorePercent >= 88) &&
        writingScore >= 75 &&
        speakingScore >= 75
      ) {
        determinedCefr = "C2";
      } else if (
        c1Acc >= 0.5 &&
        (b2Acc >= 0.5 || scorePercent >= 78) &&
        writingScore >= 60 &&
        speakingScore >= 60
      ) {
        determinedCefr = "C1";
      } else if (
        b2Acc >= 0.5 &&
        (b1Acc >= 0.5 || scorePercent >= 65) &&
        (writingScore >= 60 || speakingScore >= 60)
      ) {
        determinedCefr = "B2";
      } else if (
        b1Acc >= 0.5 &&
        (a2Acc >= 0.5 || scorePercent >= 52) &&
        (writingScore >= 40 || speakingScore >= 55)
      ) {
        determinedCefr = "B1";
      } else if (
        (a2Acc >= 0.5 || scorePercent >= 42) &&
        scorePercent >= 40
      ) {
        determinedCefr = "A2";
      } else {
        determinedCefr = "A1";
      }
    } else {
      determinedCefr = "A1";
    }

    const summaryFeedback = IrtScoringService.generateFeedback(determinedCefr, scorePercent);

    return {
      overallCefr: determinedCefr,
      scorePercent,
      weightedScore: earnedWeighted,
      maxWeightedScore: maxWeighted,
      mcqScore,
      listeningScore,
      writingScore,
      speakingScore,
      levelBreakdown,
      masteryCeiling: determinedCefr,
      summaryFeedback,
    };
  }

  private static generateFeedback(cefr: string, score: number): string {
    switch (cefr) {
      case "C2":
        return `Luar biasa! Penguasaan bahasa Inggrismu berada pada level C2 (Mastery). Kamu memiliki ketepatan struktur kalimat tingkat tinggi dan perbendaharaan kosa kata setara penutur asli.`;
      case "C1":
        return `Hebat sekali! Level kemampuanmu berada di C1 (Advanced). Kamu mampu memahami dan merespons teks dan audio kompleks dengan akurasi tata bahasa yang sangat baik.`;
      case "B2":
        return `Bagus sekali! Kamu berada di level B2 (Upper Intermediate). Struktur kalimat utamamu sudah kokoh dan siap melangkah ke materi tingkat mahir.`;
      case "B1":
        return `Kerja bagus! Levelmu berada di B1 (Intermediate). Kamu sudah mandiri dalam percakapan sehari-hari dan memahami konteks percakapan umum.`;
      case "A2":
        return `Awal yang baik! Kamu berada di level A2 (Elementary). Kamu sudah menguasai ungkapan dasar dan tata bahasa rutin.`;
      default:
        return `Selamat atas penyelesaian tes penempatan! Kamu berada di level A1 (Beginner). Kurikulum EDDY'S AI akan membimbingmu dari fondasi paling dasar secara bertahap.`;
    }
  }
}

