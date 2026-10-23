import { UnitBaseData, getUnitSlug } from "./types";

export function buildListeningPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const cefr = unit.cefr || "A2";

  const system = `You are an expert Cambridge & Oxford CEFR ${cefr} listening curriculum specialist for Eddys AI.
Generate the complete 'listening' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE & ANTI-SLOP MANDATE:
1. ZERO AI SLOP: Absolutely avoid generic AI buzzwords such as 'delve', 'testament', 'unlock', 'elevate', 'journey', 'robust', 'seamless', 'cutting-edge', 'tapestry'.
2. NO EM DASHES: Do not use the em dash character (—). Use a comma, colon, or separate sentences instead.
3. 100% NATURAL SPOKEN ENGLISH: Dialogue must sound like real, natural, and authentic English speakers (inspired by Cambridge Think 5, Complete IELTS, and Oxford Advanced dialogues for C1/C2, or Cambridge Think for A1-B2).
4. INDONESIAN ONLY IN MEANING & TRANSLATION: Only 'meaning' in keyPhrases and 'translation' in dialogue lines may be in Indonesian. Everything else must be in English.

Return ONLY a valid JSON object matching this schema:
{
  "id": "sub-${slug}-listening",
  "moduleId": "${unit.id}",
  "skillType": "listening",
  "title": "Listening Mission: [Mission Title in English]",
  "orderIndex": 2,
  "sections": [
    {
      "id": "sec-${slug}-l-theory",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-listening",
      "sectionType": "theory",
      "title": "Audio Briefing & Strategy",
      "orderIndex": 1,
      "content": {
        "summary": "Listening strategy and context briefing in English...",
        "learningObjectives": [
          "Catch the main topic of a spoken conversation about...",
          "Identify details such as times, names, or preferences...",
          "Notice how words link together in connected speech..."
        ],
        "keyPhrases": [
          { "phrase": "English Phrase", "meaning": "Arti Indonesia", "note": "Usage context in English..." }
        ],
        "connectedSpeech": [
          {
            "id": 1,
            "slow": "Formal slow spoken phrase",
            "fast": "Fast natural connected phrase with linking",
            "slowIpa": "/slow IPA/",
            "fastIpa": "/fast IPA/",
            "note": "Explanation in English of sound transitions."
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-l-dialogue",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-listening",
      "sectionType": "dialogue",
      "title": "Audio Dialogue: [Scene Title in English]",
      "orderIndex": 2,
      "content": {
        "context": "Context and scene setting in English...",
        "audioPrompt": "Listen to the conversation between two friends.",
        "lines": [
          {
            "speaker": "Speaker Name",
            "text": "Clean, natural single-clause spoken sentence in English (3 to 8 words per line).",
            "translation": "Arti kalimat dalam bahasa Indonesia",
            "emotion": "friendly"
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-l-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-listening",
      "sectionType": "quiz",
      "title": "Audio Listening Practicum (10 Interactive Tasks)",
      "orderIndex": 3,
      "content": {
        "passingScore": 80,
        "questions": []
      }
    }
  ]
}

No markdown code fences. Provide 4 keyPhrases, 4 connectedSpeech examples, and 10 to 14 crisp dialogue lines (3-8 words each).`;

  const user = `Generate the Listening submodule for:
Unit ID: ${unit.id}
Level: ${cefr}
Title: ${unit.title}
Objective: ${unit.objective}
Base Dialogue Context: ${JSON.stringify(unit.sections?.dialogue || {})}`;

  return { system, user };
}
