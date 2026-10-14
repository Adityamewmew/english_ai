export type CompanionState = "roaming" | "paused" | "listening" | "thinking" | "speaking";

export type CompanionPersona = "khoirul" | "maya";

export interface ChatTurn {
  role: "user" | "tutor";
  text: string;
  timestamp: number;
}

export type CompanionExpression = "neutral" | "listening" | "curious" | "talking" | "happy";
