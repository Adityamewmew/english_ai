import { describe, it, expect } from "bun:test";
import {
  normalizeSpokenText,
  fuzzyWordMatch,
  evaluateSpokenAccuracy,
} from "./speech-match";

describe("Speech Match & Fuzzy Token Normalization", () => {
  it("normalizes contractions correctly", () => {
    expect(normalizeSpokenText("I'm ready and I'll never give up")).toBe(
      "i am ready and i will never give up"
    );
    expect(normalizeSpokenText("We're meeting tomorrow, don't be late")).toBe(
      "we are meeting tomorrow do not be late"
    );
  });

  it("converts digit numbers into words", () => {
    expect(normalizeSpokenText("I will retire at 55")).toBe(
      "i will retire at fifty five"
    );
    expect(normalizeSpokenText("within 3 years")).toBe("within three years");
  });

  it("strips speech hesitation fillers", () => {
    expect(normalizeSpokenText("Well, um, I have achieved my goal")).toBe(
      "i have achieved my goal"
    );
  });

  it("matches words with accent differences and inflectional suffixes", () => {
    // Suffix differences
    expect(fuzzyWordMatch("require", "requires")).toBe(true);
    expect(fuzzyWordMatch("plans", "plan")).toBe(true);
    expect(fuzzyWordMatch("promote", "promoted")).toBe(true);

    // Accent/typo differences (Pak Khoirul's case)
    expect(fuzzyWordMatch("discipline", "disiplin")).toBe(true);
    expect(fuzzyWordMatch("counselor", "counsellor")).toBe(true);
    expect(fuzzyWordMatch("shape", "shave")).toBe(true);

    // Completely unrelated words should fail
    expect(fuzzyWordMatch("table", "banana")).toBe(false);
  });

  it("evaluates spoken sentence accurately with real ESL accent variants", () => {
    const target = "Making a New Year resolution requires strong discipline.";
    const keywords = ["resolution", "discipline", "Making", "requires"];

    // Simulated non-native STT transcript: drops s on requires, spells discipline phonetically
    const spoken = "making a new year resolution require strong disiplin";

    const res = evaluateSpokenAccuracy(spoken, target, keywords);
    expect(res.isPassed).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(75);
    expect(res.matchedKeywords.length).toBeGreaterThanOrEqual(3);
  });

  it("evaluates number variants correctly (55 vs fifty-five)", () => {
    const target = "I hope to retire by age fifty-five and travel around the world.";
    const keywords = ["retire", "fifty-five", "travel", "world"];

    // Google speech transcribed 55 as digits
    const spoken = "i hope to retire by age 55 and travel around the world";

    const res = evaluateSpokenAccuracy(spoken, target, keywords);
    expect(res.isPassed).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.matchedKeywords).toContain("fifty-five");
  });

  it("rejects gibberish and unrelated answers (Anti-Cheat)", () => {
    const target = "Making a New Year resolution requires strong discipline.";
    const keywords = ["resolution", "discipline", "Making", "requires"];

    const res = evaluateSpokenAccuracy("hello world yes today", target, keywords);
    expect(res.isPassed).toBe(false);
    expect(res.score).toBeLessThan(40);
  });
});
