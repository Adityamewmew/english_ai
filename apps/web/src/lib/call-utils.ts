// Universal phonetic distance calculator (Levenshtein)
export function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Universal name reconciliation for ANY user profile name (Adit, Budi, Sarah, Dimas, etc.)
export function reconcileUniversalName(text: string, rawProfileName: string): string {
  if (!rawProfileName || !text) return text;
  const targetName = rawProfileName.split(" ")[0].trim();
  if (targetName.length < 3) return text;

  return text.replace(
    /\b(my name is|name is|i am|i'm|call me|nama saya|namaku|panggil aku|panggil saya)\s+([A-Za-z]+)\b/gi,
    (fullMatch, prefix, candidate) => {
      const candLower = candidate.toLowerCase();
      const targetLower = targetName.toLowerCase();
      if (candLower === targetLower) return fullMatch;
      if (
        ["not", "mr", "mister", "here", "today", "ready", "fine", "good", "a", "the"].includes(
          candLower
        )
      ) {
        return fullMatch;
      }

      const dist = getLevenshteinDistance(candLower, targetLower);
      const isPrefixOrSuffix =
        targetLower.startsWith(candLower) || candLower.startsWith(targetLower);

      if (dist <= 2 || (isPrefixOrSuffix && Math.abs(candLower.length - targetLower.length) <= 2)) {
        return `${prefix} ${targetName}`;
      }
      return fullMatch;
    }
  );
}

// Detect if student is trailing or still formulating thoughts vs finished speaking
export function isThoughtIncomplete(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  // Trailing thinking sounds, hesitation, pauses
  if (
    /(?:\b(?:uh|um|umm|uhh|eh|em|ahh|ah|wait|sebentar|tunggu|apa ya|kayak|anu|hmm|mikir|gimana ya|bentar|terus)\b|\.{2,}|…|-)$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // Trailing connectives, prepositions, conjunctions, auxiliary verbs, or modal particles
  if (
    /\b(?:because|and|or|so|that|to|my|the|a|an|is|are|am|was|were|like|with|for|about|in|on|at|by|from|as|if|when|while|since|though|although|then|karena|dan|atau|jadi|yang|di|ke|pada|untuk|bahwa|mau|ingin|lagi|coba|terus|tapi|namun|sedang|akan|bisa|dapat|belum)$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // Brief utterance (<= 2 words) that isn't a stand-alone greeting/confirmation
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (
    words.length <= 2 &&
    !/^(?:yes|no|fine|good|halo|hai|hi|hello|ok|okay|bye|sure|yep|nope|great|thanks|thank you|terima kasih|siap)$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  return false;
}

// Strict signal validation: filters out phantom mic pops, breathing, and non-speech sounds
export function isValidStudentUtterance(text: string): boolean {
  const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;

  const validSingleWords = new Set([
    "yes", "no", "yeah", "yep", "nope", "sure", "fine", "good",
    "okay", "ok", "hello", "hi", "hey", "halo", "bye", "goodbye",
    "thanks", "siap", "iya", "tidak", "ya"
  ]);

  if (words.length === 1) {
    return validSingleWords.has(words[0].toLowerCase());
  }

  // If 2 words, reject if both are just fillers or single-letter noises like "um uh" or "a the"
  if (words.length === 2) {
    const fillers = new Set(["um", "uh", "eh", "ah", "a", "the", "an", "oh", "er"]);
    if (fillers.has(words[0].toLowerCase()) && fillers.has(words[1].toLowerCase())) {
      return false;
    }
  }

  return true;
}

// Format duration in mm:ss
export function formatCallDuration(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
