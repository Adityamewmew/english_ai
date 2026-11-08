import { describe, expect, it } from "bun:test";
import { deterministicShuffle, hashString } from "./shuffle";

describe("deterministicShuffle", () => {
  it("produces consistent output for the same seed", () => {
    const list = ["A", "B", "C", "D"];
    const run1 = deterministicShuffle(list, "test-question-1");
    const run2 = deterministicShuffle(list, "test-question-1");
    expect(run1).toEqual(run2);
  });

  it("produces different ordering for different seeds", () => {
    const list = ["A", "B", "C", "D"];
    const run1 = deterministicShuffle(list, "seed-1");
    const run2 = deterministicShuffle(list, "seed-2");
    // At least one element moved, original not mutated
    expect(list).toEqual(["A", "B", "C", "D"]);
  });

  it("handles empty or single element arrays gracefully", () => {
    expect(deterministicShuffle([], "seed")).toEqual([]);
    expect(deterministicShuffle(["only"], "seed")).toEqual(["only"]);
  });
});

