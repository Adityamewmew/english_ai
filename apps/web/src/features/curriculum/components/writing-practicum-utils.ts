/**
 * Normalization & Evaluation Utilities for Writing Sub-Module
 * Solves iOS/Mac curly apostrophe bugs, provides typo-tolerant fuzzy matching (>= 84%),
 * and delivers intelligent diagnostic feedback.
 */

/**
 * Normalizes user input and targets:
 * - Replaces curly/smart apostrophes (’ ‘ `) with standard ASCII '
 * - Replaces curly quotes (“ ”) with standard "
 * - Strips redundant whitespace and normalizes punctuation spacing
 */
export function normalizeWritingInput(str: string = ""): string {
  return str
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s*([,.;:?!])\s*/g, "$1 ")
    .trim();
}

/**
 * Strips non-alphanumerics except spaces and apostrophes for tolerant comparison.
 */
export function cleanAlphanumeric(str: string = ""): string {
  return normalizeWritingInput(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates Levenshtein edit distance between two strings in O(n*m) space-optimized O(min(n,m)).
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }

  return dp[n];
}

/**
 * Calculates similarity ratio between 0.0 and 1.0.
 */
export function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(a, b);
  return (maxLen - distance) / maxLen;
}

/**
 * Checks if two clauses joined by "and" or "but" are reversed in order.
 * e.g. "I am from Indonesia and I am a student" === "I am a student and I am from Indonesia"
 */
export function isCompoundClauseReversible(userClean: string, targetClean: string): boolean {
  for (const conjunction of [" and ", " but "]) {
    if (targetClean.includes(conjunction) && userClean.includes(conjunction)) {
      const targetParts = targetClean.split(conjunction).map((p) => p.trim());
      const userParts = userClean.split(conjunction).map((p) => p.trim());

      if (targetParts.length === 2 && userParts.length === 2) {
        if (targetParts[0] === userParts[0] && targetParts[1] === userParts[1]) return true;
        if (targetParts[0] === userParts[1] && targetParts[1] === userParts[0]) return true;
      }
    }
  }
  return false;
}

export interface WritingEvaluationResult {
  isCorrect: boolean;
  isNearMatch: boolean;
  feedback: string;
  matchedTarget?: string;
}

/**
 * Full 3-tier evaluator: Exact match -> Near-match (>=84% similarity / small typo) -> Diagnostic failure
 */
export function evaluateWritingAnswer(
  userInput: string,
  targets: string[]
): WritingEvaluationResult {
  const trimmed = userInput.trim();
  if (!trimmed) {
    return {
      isCorrect: false,
      isNearMatch: false,
      feedback: "Please type your sentence before submitting.",
    };
  }

  const normUser = normalizeWritingInput(trimmed);
  const cleanUser = cleanAlphanumeric(trimmed);
  const validTargets = targets.filter(
    (t): t is string => typeof t === "string" && t.trim().length > 0
  );
  const primaryTarget = validTargets[0] || "";

  // 1. Exact or normalized / compound reversal match
  for (const target of validTargets) {
    const normTarget = normalizeWritingInput(target);
    const cleanTarget = cleanAlphanumeric(target);

    if (normUser.toLowerCase() === normTarget.toLowerCase() || cleanUser === cleanTarget) {
      return {
        isCorrect: true,
        isNearMatch: false,
        feedback: "Perfect! All grammar and sentence mechanics are accurate.",
        matchedTarget: target,
      };
    }

    if (isCompoundClauseReversible(cleanUser, cleanTarget)) {
      return {
        isCorrect: true,
        isNearMatch: false,
        feedback: "Great job! Accurate compound sentence structure.",
        matchedTarget: target,
      };
    }
  }

  // 2. Near-match tolerance (Similarity >= 0.84, e.g. 1-2 letter typo or missing period)
  for (const target of validTargets) {
    const cleanTarget = cleanAlphanumeric(target);
    const similarity = calculateSimilarity(cleanUser, cleanTarget);

    if (similarity >= 0.84) {
      return {
        isCorrect: true,
        isNearMatch: true,
        feedback: `Accepted! Minor typo noted (model answer: "${target}"). Good effort!`,
        matchedTarget: target,
      };
    }
  }

  // 3. Fallback: Diagnostic feedback
  const diagnosis = diagnoseSentenceMistake(trimmed, validTargets);
  return {
    isCorrect: false,
    isNearMatch: false,
    feedback: diagnosis,
    matchedTarget: primaryTarget,
  };
}

/**
 * Legacy wrapper for backward compatibility.
 */
export function checkWritingMatch(userInput: string, targets: string[]): boolean {
  return evaluateWritingAnswer(userInput, targets).isCorrect;
}

/**
 * Diagnoses the specific reason why a user's answer didn't match.
 */
export function diagnoseSentenceMistake(userInput: string, targets: string[]): string {
  const trimmed = userInput.trim();
  if (!trimmed) return "Please type your sentence before submitting.";

  const primaryTarget = targets[0] || "";
  const normTarget = normalizeWritingInput(primaryTarget);

  // 1. Check initial capital letter
  if (!/^[A-Z]/.test(trimmed)) {
    return "Remember to capitalize the first letter of your sentence.";
  }

  // 2. Check terminal punctuation
  if (!/[.?!]$/.test(trimmed)) {
    return "Don't forget to end your sentence with a period (.) or question mark (?).";
  }

  // 3. Check proper noun capitalization
  const properNouns = normTarget
    .split(/\s+/)
    .filter((w) => /^[A-Z][a-z]+/.test(w) && w.toLowerCase() !== "the" && w.toLowerCase() !== "a");

  for (const noun of properNouns) {
    const cleanNoun = noun.replace(/[^a-zA-Z]/g, "");
    if (cleanNoun.length > 1) {
      const lower = cleanNoun.toLowerCase();
      const userWords = trimmed.split(/\s+/).map((w) => w.replace(/[^a-zA-Z]/g, ""));
      if (userWords.includes(lower) && !userWords.includes(cleanNoun)) {
        return `Remember to capitalize proper nouns or place names like "${cleanNoun}".`;
      }
    }
  }

  // 4. Check word count difference
  const userWordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const targetWordCount = normTarget.split(/\s+/).filter(Boolean).length;
  if (Math.abs(userWordCount - targetWordCount) >= 2) {
    return userWordCount < targetWordCount
      ? "Your sentence appears incomplete. Review the prompt to ensure all required details are included."
      : "Check for extra or redundant words in your sentence.";
  }

  return "Check your spelling, spacing, and word order against the prompt.";
}
