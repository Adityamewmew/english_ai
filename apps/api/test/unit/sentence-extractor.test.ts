import { describe, it, expect } from "bun:test";

describe("Sentence Extractor Unit Tests", () => {
  const extractSentences = (bufferText: string): string[] => {
    let buffer = bufferText;
    const extracted: string[] = [];
    const terminatorRegex = /([.!?]+|\n+)(?:\s+|$)/g;
    let match: RegExpExecArray | null;

    while ((match = terminatorRegex.exec(buffer)) !== null) {
      const punctuation = match[1];
      const matchEnd = match.index + match[0].length;
      const textBefore = buffer.slice(0, match.index).trim();

      const isAbbreviation = /\b(?:mr|mrs|ms|dr|prof|vs|etc|ie|eg|\d+)\s*$/i.test(textBefore);
      if (isAbbreviation && punctuation.includes(".")) continue;

      const sentence = buffer.slice(0, match.index + punctuation.length).trim();
      extracted.push(sentence);
      buffer = buffer.slice(matchEnd).trimStart();
      terminatorRegex.lastIndex = 0;
    }

    if (buffer.trim()) {
      extracted.push(buffer.trim());
    }

    return extracted;
  };

  it("should split multiple complete sentences properly", () => {
    const text = "Hello there! How are you doing today? I hope you are having a wonderful morning.";
    const result = extractSentences(text);
    expect(result.length).toBe(3);
    expect(result[0]).toBe("Hello there!");
    expect(result[1]).toBe("How are you doing today?");
    expect(result[2]).toBe("I hope you are having a wonderful morning.");
  });

  it("should not break on common English abbreviations like Mr., Dr., e.g.", () => {
    const text = "Mr. Khoirul and Dr. Smith are traveling today. They will arrive soon.";
    const result = extractSentences(text);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("Mr. Khoirul and Dr. Smith are traveling today.");
    expect(result[1]).toBe("They will arrive soon.");
  });

  it("should not break on decimal numbers like 3.14 or prices", () => {
    const text = "The temperature dropped by 2.5 degrees. It is very cold.";
    const result = extractSentences(text);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("The temperature dropped by 2.5 degrees.");
    expect(result[1]).toBe("It is very cold.");
  });
});
