export interface PracticumQuestion {
  id: number;
  type: "dictation" | "arrange";
  audioText: string;
  instruction: string;
  // For dictation:
  promptSentence?: string;
  targetWord?: string;
  // For arrange:
  targetSentence?: string;
  words?: string[];
  explanation: string;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "is", "am", "are", "was", "were", "it", "its", "it's", "he", "she", "they",
  "we", "you", "i", "my", "your", "his", "her", "their", "our", "me", "him", "them", "us"
]);

function cleanWord(w: string): string {
  return (w || "").replace(/^[\s"'()[\]{}.,!?:;]+|[\s"'()[\]{}.,!?:;]+$/g, "");
}

function cleanSentence(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

function makeBlankToken(token: string): string {
  const leading = token.match(/^[\s"'()[\]{}]+/)?.[0] || "";
  const trailing = token.match(/[\s"'()[\]{}.,!?:;]+$/)?.[0] || "";
  return `${leading}_____${trailing}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.length > 2 && result.every((val, idx) => val === arr[idx])) {
    const temp = result[0];
    result[0] = result[1];
    result[1] = temp;
  }
  return result;
}

function splitIntoCleanSentences(text: string): string[] {
  const normalized = (text || "")
    .replace(/(Mr|Mrs|Ms|Dr)\./g, "$1_DOT_")
    .replace(/([.!?])\s+/g, "$1|SPLIT|");
  const rawSentences = normalized
    .split("|SPLIT|")
    .map((s) => s.replace(/_DOT_/g, ".").trim())
    .filter((s) => s.length > 0);

  const result: string[] = [];
  for (const s of rawSentences) {
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length <= 8) {
      result.push(s);
    } else {
      // Split by comma or conjunction if sentence is long
      const clauses = s.split(/,\s*/).map((c) => c.trim()).filter((c) => c.length > 0);
      for (const clause of clauses) {
        const cWords = clause.split(/\s+/).filter(Boolean);
        if (cWords.length >= 3 && cWords.length <= 8) {
          result.push(clause);
        }
      }
    }
  }
  return result;
}

export function generateListeningQuestionsForModule(moduleData: any): PracticumQuestion[] {
  const listening = moduleData.subModules?.find((s: any) => s.skillType === "listening");
  const dialogue = listening?.sections?.find((s: any) => s.sectionType === "dialogue");
  const theory = listening?.sections?.find((s: any) => s.sectionType === "theory");

  const lines = dialogue?.content?.lines || [];
  const keyPhrases = theory?.content?.keyPhrases || [];

  // Collect all speaker names
  const allSpeakerNames = new Set<string>();
  lines.forEach((l: any) => {
    (l.speaker || "").split(/[\s,()]+/).forEach((part: string) => {
      const clean = part.toLowerCase().trim();
      if (clean) allSpeakerNames.add(clean);
    });
  });

  // Extract individual crisp sentences (3 to 8 words)
  const candidateSentences: Array<{ speaker: string; text: string }> = [];

  for (const line of lines) {
    const speaker = line.speaker || "Speaker";
    const rawText = line.text || line.en || "";
    const splitSentences = splitIntoCleanSentences(rawText);

    for (const sent of splitSentences) {
      const words = sent.split(/\s+/).map(cleanWord).filter(Boolean);
      if (words.length >= 3 && words.length <= 8) {
        candidateSentences.push({ speaker, text: sent });
      }
    }
  }

  // Also add key phrases if candidateSentences is short
  for (const kp of keyPhrases) {
    const phrase = cleanSentence(kp.phrase || "");
    const words = phrase.split(/\s+/).map(cleanWord).filter(Boolean);
    if (words.length >= 3 && words.length <= 7) {
      candidateSentences.push({ speaker: "Speaker", text: phrase });
    }
  }

  const questions: PracticumQuestion[] = [];

  // 1. Generate 5 Dictation Questions
  const usedTargetWords = new Set<string>();
  const usedDictationTexts = new Set<string>();
  let dictationCount = 0;

  for (const item of candidateSentences) {
    if (dictationCount >= 5) break;

    const fullText = cleanSentence(item.text);
    if (usedDictationTexts.has(fullText.toLowerCase())) continue;

    const tokens = fullText.split(/\s+/).filter(Boolean);
    if (tokens.length < 3 || tokens.length > 8) continue;

    // Pick target word
    let bestIdx = -1;
    let fallbackIdx = -1;

    for (let t = tokens.length - 1; t >= 0; t--) {
      const w = cleanWord(tokens[t]);
      const wLower = w.toLowerCase();
      if (w.length >= 3) {
        // Count occurrences of this word in the sentence to avoid spoiler duplicates
        const occurrences = tokens.filter(
          (tok) => cleanWord(tok).toLowerCase() === wLower
        ).length;

        if (
          occurrences === 1 &&
          !STOP_WORDS.has(wLower) &&
          !usedTargetWords.has(wLower) &&
          !allSpeakerNames.has(wLower)
        ) {
          bestIdx = t;
          break;
        } else if (
          occurrences === 1 &&
          !usedTargetWords.has(wLower) &&
          !allSpeakerNames.has(wLower) &&
          fallbackIdx === -1
        ) {
          fallbackIdx = t;
        }
      }
    }

    const chosenIdx = bestIdx !== -1 ? bestIdx : fallbackIdx;
    if (chosenIdx === -1) continue;

    const targetWord = cleanWord(tokens[chosenIdx]);
    if (!targetWord || targetWord.length < 2) continue;

    // Build sentence with blank
    const promptTokens = [...tokens];
    promptTokens[chosenIdx] = makeBlankToken(tokens[chosenIdx]);
    const blankSentence = promptTokens.join(" ");

    // Ensure promptSentence genuinely contains _____
    if (!blankSentence.includes("_____")) continue;

    usedTargetWords.add(targetWord.toLowerCase());
    usedDictationTexts.add(fullText.toLowerCase());

    const speakerPrefix = item.speaker ? `${item.speaker}: ` : "";

    questions.push({
      id: dictationCount + 1,
      type: "dictation",
      audioText: fullText,
      instruction: "Listen to the audio clip and type the missing word:",
      promptSentence: `${speakerPrefix}"${blankSentence}"`,
      targetWord: targetWord,
      explanation: `Full audio: "${fullText}". The missing word is "${targetWord}".`,
    });

    dictationCount++;
  }

  // 2. Generate 5 Arrange Questions (No duplicate words allowed in sentence)
  const usedArrangeTexts = new Set<string>();
  let arrangeCount = 0;

  for (const item of candidateSentences) {
    if (arrangeCount >= 5) break;

    const fullText = cleanSentence(item.text);
    if (usedDictationTexts.has(fullText.toLowerCase())) continue;
    if (usedArrangeTexts.has(fullText.toLowerCase())) continue;

    const rawWords = fullText
      .split(/\s+/)
      .map(cleanWord)
      .filter(Boolean);

    // Limit to 3 to 8 words for clean mobile UI
    if (rawWords.length < 3 || rawWords.length > 8) continue;

    // CHECK: Disallow sentences with duplicate words (e.g. no "I'm ... I'm" or "please ... please")
    const lowerWords = rawWords.map((w) => w.toLowerCase());
    const uniqueWordCount = new Set(lowerWords).size;
    if (uniqueWordCount !== rawWords.length) continue;

    const targetSentence = rawWords.join(" ");
    const scrambledWords = shuffleArray(rawWords);

    usedArrangeTexts.add(fullText.toLowerCase());

    questions.push({
      id: dictationCount + arrangeCount + 1,
      type: "arrange",
      audioText: fullText,
      instruction: "Listen to the sentence and arrange the words in the correct order:",
      targetSentence: targetSentence,
      words: scrambledWords,
      explanation: `Correct sentence order: "${fullText}".`,
    });

    arrangeCount++;
  }

  return questions;
}
