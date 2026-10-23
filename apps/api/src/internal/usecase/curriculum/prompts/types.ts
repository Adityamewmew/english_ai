export interface UnitBaseData {
  id: string; // e.g. "A2.1-M01"
  levelId: string; // "A2.1"
  title: string;
  cefr: string; // "A2"
  group: string;
  objective: string;
  orderIndex: number;
  sections?: {
    theory?: {
      summary?: string;
      rules?: string[];
      commonTrap?: any;
    };
    vocab?: any[];
    dialogue?: any;
    speakingLab?: any;
    quiz?: any[];
  };
}

export function getUnitSlug(unitId: string): string {
  // "A2.1-M01" -> "a2-1-m01"
  return unitId.toLowerCase().replace(/\./g, "-");
}
