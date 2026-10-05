export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const SUBLEVELS_PER_CEFR: Record<CefrLevel, string[]> = {
  A1: ["A1.1", "A1.2", "A1.3"],
  A2: ["A2.1", "A2.2", "A2.3"],
  B1: ["B1.1", "B1.2", "B1.3", "B1.4", "B1.5"],
  B2: ["B2.1", "B2.2", "B2.3", "B2.4", "B2.5"],
  C1: ["C1.1", "C1.2", "C1.3", "C1.4", "C1.5", "C1.6", "C1.7"],
  C2: ["C2.1", "C2.2", "C2.3", "C2.4", "C2.5", "C2.6", "C2.7"],
};

export const DEFAULT_PASSING_SCORE = 75;
