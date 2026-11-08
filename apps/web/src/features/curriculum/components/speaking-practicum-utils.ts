export interface PracticumQuestion {
  id: number;
  category: "storytelling" | "roleplay" | "linguistic_drill" | string;
  typeLabel: string;
  instruction: string;
  audioPrompt?: string;
  themeTitle?: string;
  inspirationPoints?: string[];
  sampleStarter?: string;
  scenarioContext?: string;
  characterRole?: string;
  callTopic?: string;
  initialGreeting?: string;
  focus?: string;
  targetSentence?: string;
  phonetic?: string;
  expectedKeywords?: string[];
  hint?: string;
  explanation?: string;
  minSeconds?: number;
}

export const parseInitial = (raw?: Record<string, any>) => {
  const trans: Record<number, string> = {};
  const done: Record<number, boolean> = {};
  if (raw) {
    Object.entries(raw).forEach(([k, v]) => {
      const num = Number(k);
      if (!isNaN(num) && typeof v === "string") {
        trans[num] = v;
        if (v.trim()) done[num] = true;
      }
    });
  }
  return { trans, done };
};

