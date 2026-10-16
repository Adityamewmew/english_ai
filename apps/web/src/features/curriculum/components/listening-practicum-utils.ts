export interface PracticumQuestion {
  id: number;
  type: "arrange" | "dictation" | "true_false";
  audioText: string;
  instruction: string;
  // For arrange:
  targetSentence?: string;
  words?: string[];
  // For dictation:
  promptSentence?: string;
  targetWord?: string;
  explanation: string;
}

export function cleanWord(w: string): string {
  return (w || "").replace(/^[\s"'()[\]{}.,!?:;]+|[\s"'()[\]{}.,!?:;]+$/g, "");
}

export function cleanSentence(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

export function makeBlankToken(token: string): string {
  const leading = token.match(/^[\s"'()[\]{}]+/)?.[0] || "";
  const trailing = token.match(/[\s"'()[\]{}.,!?:;]+$/)?.[0] || "";
  return `${leading}_____${trailing}`;
}

export function normalizeWord(w: string): string {
  return (w || "").trim().toLowerCase().replace(/^[\s"'()[\]{}.,!?:;]+|[\s"'()[\]{}.,!?:;]+$/g, "");
}

export function normalizeSentence(s: string): string {
  return (s || "")
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean)
    .join(" ");
}

export function cleanAlphanumeric(s: string): string {
  return (s || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

