/**
 * speech-diff.ts
 * Utilitas client-side untuk pencocokan dan evaluasi akurasi ucapan siswa (0ms latency).
 * Menghitung skor akurasi (0-100%) dan status per kata (matched, similar, missing).
 */

export type WordMatchStatus = "matched" | "similar" | "missing" | "extra";

export interface EvaluatedWord {
  word: string;
  status: WordMatchStatus;
  spokenWord?: string;
}

export interface SpeechDiffResult {
  score: number; // 0 - 100
  passed: boolean; // >= 75%
  statusText: "Lancar" | "Cukup Baik" | "Perlu Latihan";
  words: EvaluatedWord[];
  missedWords: string[];
  totalWords: number;
  matchedCount: number;
}

/**
 * Normalisasi kata: hilangkan tanda baca dan ubah ke lowercase
 */
function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9']/g, "").trim();
}

/**
 * Levenshtein distance sederhana untuk mengukur kemiripan dua kata
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Menghitung kemiripan kata (0.0 s.d 1.0)
 */
function wordSimilarity(target: string, spoken: string): number {
  const t = cleanWord(target);
  const s = cleanWord(spoken);
  if (!t && !s) return 1;
  if (!t || !s) return 0;
  if (t === s) return 1;

  const maxLen = Math.max(t.length, s.length);
  const distance = levenshteinDistance(t, s);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Bandingkan kalimat target dengan transkrip ucapan siswa
 */
export function evaluateSpeechDiff(targetSentence: string, spokenTranscript: string): SpeechDiffResult {
  const targetTokens = targetSentence
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const spokenTokens = spokenTranscript
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (targetTokens.length === 0) {
    return {
      score: 100,
      passed: true,
      statusText: "Lancar",
      words: [],
      missedWords: [],
      totalWords: 0,
      matchedCount: 0,
    };
  }

  const evaluatedWords: EvaluatedWord[] = [];
  const missedWords: string[] = [];
  let matchedCount = 0;
  let similarCount = 0;

  // Track kata yang sudah dicocokkan di spoken tokens
  const spokenMatched = new Set<number>();

  // Cocokkan setiap kata target ke spoken tokens terdekat
  targetTokens.forEach((rawTarget) => {
    const cleanT = cleanWord(rawTarget);
    let bestSimilarity = 0;
    let bestIndex = -1;

    for (let i = 0; i < spokenTokens.length; i++) {
      if (spokenMatched.has(i)) continue;
      const sim = wordSimilarity(cleanT, spokenTokens[i]);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestIndex = i;
      }
    }

    if (bestSimilarity >= 0.85 && bestIndex !== -1) {
      // Exact / High Match
      spokenMatched.add(bestIndex);
      evaluatedWords.push({
        word: rawTarget,
        status: "matched",
        spokenWord: spokenTokens[bestIndex],
      });
      matchedCount++;
    } else if (bestSimilarity >= 0.55 && bestIndex !== -1) {
      // Close / Minor Miss
      spokenMatched.add(bestIndex);
      evaluatedWords.push({
        word: rawTarget,
        status: "similar",
        spokenWord: spokenTokens[bestIndex],
      });
      similarCount++;
      missedWords.push(cleanT);
    } else {
      // Missing
      evaluatedWords.push({
        word: rawTarget,
        status: "missing",
      });
      missedWords.push(cleanT);
    }
  });

  // Kalkulasi skor: matched = 1.0 poin, similar = 0.5 poin
  const rawScore = ((matchedCount * 1.0 + similarCount * 0.5) / targetTokens.length) * 100;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const passed = score >= 75;

  let statusText: "Lancar" | "Cukup Baik" | "Perlu Latihan" = "Perlu Latihan";
  if (score >= 85) {
    statusText = "Lancar";
  } else if (score >= 70) {
    statusText = "Cukup Baik";
  }

  return {
    score,
    passed,
    statusText,
    words: evaluatedWords,
    missedWords: Array.from(new Set(missedWords)),
    totalWords: targetTokens.length,
    matchedCount,
  };
}
