/**
 * Pure speech-to-text text normalization, phonetic tolerance, and token-level fuzzy matching.
 * Shared across frontend (drills, speaking UI) and backend (grading service).
 */

const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am",
  "i've": "i have",
  "i'll": "i will",
  "i'd": "i would",
  "you're": "you are",
  "you've": "you have",
  "you'll": "you will",
  "you'd": "you would",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "we're": "we are",
  "we've": "we have",
  "we'll": "we will",
  "they're": "they are",
  "they've": "they have",
  "they'll": "they will",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "haven't": "have not",
  "hasn't": "has not",
  "hadn't": "had not",
  "won't": "will not",
  "wouldn't": "would not",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "can't": "can not",
  "couldn't": "could not",
  "shouldn't": "should not",
  "gonna": "going to",
  "wanna": "want to",
  "gotta": "got to",
};

const NUMBER_WORDS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
  "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
  "10": "ten", "11": "eleven", "12": "twelve", "13": "thirteen", "14": "fourteen",
  "15": "fifteen", "16": "sixteen", "17": "seventeen", "18": "eighteen", "19": "nineteen",
  "20": "twenty", "30": "thirty", "40": "forty", "50": "fifty",
  "55": "fifty five", "60": "sixty", "70": "seventy", "80": "eighty", "90": "ninety",
  "100": "one hundred",
};

/**
 * Normalizes speech transcript: lowercases, expands contractions, maps common digits,
 * strips filler words and punctuation without breaking words.
 */
export function normalizeSpokenText(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  let norm = text.toLowerCase().trim();

  // 1. Expand contractions
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    const regex = new RegExp(`\\b${contraction}\\b`, "gi");
    norm = norm.replace(regex, expansion);
  }

  // 2. Strip punctuation but preserve internal spaces
  norm = norm.replace(/['’]/g, ""); // strip apostrophes first
  norm = norm.replace(/[^a-z0-9\s]/g, " ");

  // 3. Convert standalone digits (e.g. "55" -> "fifty five")
  const tokens = norm.split(/\s+/).filter(Boolean);
  const mapped = tokens.map((token) => NUMBER_WORDS[token] || token);

  // 4. Strip common speech hesitation fillers at start
  while (mapped.length > 0 && /^(um|uh|well|like|so|actually|er)$/i.test(mapped[0] ?? "")) {
    mapped.shift();
  }

  return mapped.join(" ").trim();
}

/**
 * Calculates normalized Levenshtein similarity [0.0, 1.0].
 */
export function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;

  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0] ?? 0;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j] ?? 0;
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        const curJ = dp[j] ?? 0;
        const prevJ = dp[j - 1] ?? 0;
        dp[j] = 1 + Math.min(prev, curJ, prevJ);
      }
      prev = temp;
    }
  }

  const distance = dp[n] ?? 0;
  const maxLen = Math.max(m, n);
  return (maxLen - distance) / maxLen;
}

/**
 * Matches two words with tolerance for accents, plural/tense suffixes, and minor typos.
 */
export function fuzzyWordMatch(w1: string, w2: string, threshold = 0.75): boolean {
  if (!w1 || !w2) return false;
  if (w1 === w2) return true;

  // Substring tolerance for inflectional suffixes (e.g. require vs requires, plan vs plans)
  if (w1.length >= 4 && w2.length >= 4) {
    if (w1.startsWith(w2) || w2.startsWith(w1)) return true;
    if (w1.endsWith(w2) || w2.endsWith(w1)) return true;
  }

  // Edit distance similarity tolerance (e.g. discipline vs disiplin, shape vs shave)
  return levenshteinSimilarity(w1, w2) >= threshold;
}

export interface SpokenEvaluationResult {
  score: number;
  isPassed: boolean;
  matchedKeywords: string[];
  tokenOverlapRatio: number;
}

/**
 * Evaluates spoken transcript against target sentence and optional expected keywords.
 */
export function evaluateSpokenAccuracy(
  userSpoken: string,
  targetSentence: string,
  expectedKeywords?: string[]
): SpokenEvaluationResult {
  const normUser = normalizeSpokenText(userSpoken);
  const normTarget = normalizeSpokenText(targetSentence);

  const userTokens = normUser.split(/\s+/).filter(Boolean);
  const targetTokens = normTarget.split(/\s+/).filter((w) => w.length > 2);

  if (userTokens.length === 0 || targetTokens.length === 0) {
    return { score: 0, isPassed: false, matchedKeywords: [], tokenOverlapRatio: 0 };
  }

  // 1. Token-level fuzzy overlap against target sentence
  let tokenMatches = 0;
  for (const targetWord of targetTokens) {
    if (userTokens.some((userWord) => fuzzyWordMatch(userWord, targetWord))) {
      tokenMatches++;
    }
  }
  const tokenRatio = targetTokens.length > 0 ? tokenMatches / targetTokens.length : 0;

  // 2. Expected keywords match (if provided)
  const matchedKeywords: string[] = [];
  if (Array.isArray(expectedKeywords) && expectedKeywords.length > 0) {
    for (const rawKw of expectedKeywords) {
      const cleanKw = normalizeSpokenText(rawKw);
      const kwTokens = cleanKw.split(/\s+/).filter(Boolean);
      // Keyword could be multi-word e.g. "give up", "fifty five"
      const allFound = kwTokens.every((kwToken) =>
        userTokens.some((userWord) => fuzzyWordMatch(userWord, kwToken))
      );
      if (allFound) {
        matchedKeywords.push(rawKw);
      }
    }
  }

  const keywordRatio =
    expectedKeywords && expectedKeywords.length > 0
      ? matchedKeywords.length / expectedKeywords.length
      : tokenRatio;

  // Final score weighted by token overlap & keywords
  const combinedRatio =
    expectedKeywords && expectedKeywords.length > 0
      ? tokenRatio * 0.5 + keywordRatio * 0.5
      : tokenRatio;

  const score = Math.min(100, Math.round(combinedRatio * 100));
  // Passing threshold: 65% token/keyword overlap
  const isPassed = score >= 65 || (expectedKeywords && matchedKeywords.length >= Math.ceil(expectedKeywords.length * 0.5));

  return {
    score,
    isPassed: Boolean(isPassed),
    matchedKeywords,
    tokenOverlapRatio: tokenRatio,
  };
}
