/**
 * Simple string hash to 32-bit positive integer
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic Fisher-Yates array shuffle based on a string seed.
 * Guarantees that the same seed produces the exact same shuffled order every time,
 * while effectively spreading items across all positions.
 */
export function deterministicShuffle<T>(items: T[], seedStr: string): T[] {
  if (!Array.isArray(items) || items.length <= 1) return items || [];
  const result = [...items];
  let seed = hashString(seedStr || "eddys-default-seed");

  // Lehmer/LCG pseudo-random generator
  const nextRandom = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    const itemI = result[i];
    const itemJ = result[j];
    if (itemI !== undefined && itemJ !== undefined) {
      result[i] = itemJ;
      result[j] = itemI;
    }
  }

  return result;
}
