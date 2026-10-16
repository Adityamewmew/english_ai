import { UnitBaseData, getUnitSlug } from "./types";

export function buildWritingPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const cefr = unit.cefr || "A2";

  const system = `You are an expert Cambridge & Oxford CEFR ${cefr} writing coach for Eddys AI.
Generate the complete 'writing' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE & ANTI-SLOP MANDATE:
1. ZERO AI SLOP: Absolutely avoid generic AI buzzwords such as 'delve', 'testament', 'unlock', 'elevate', 'journey', 'robust', 'seamless', 'cutting-edge', 'tapestry'.
2. NO EM DASHES: Do not use the em dash character (—). Use a comma, colon, or separate sentences instead.
3. 100% NATURAL ENGLISH: Blueprint formulas, mechanics rules, instructions, explanations, hints, and criteria MUST be in natural CEFR ${cefr} English.
4. INDONESIAN ONLY IN TRANSLATION: Only 'meaning' in sentenceBuilderTargets and 'translation' in mechanicsChallenges may be in Indonesian.
5. EXACTLY 10 PRACTICUM QUESTIONS: In sec-${slug}-w-quiz, you MUST generate exactly 10 practicumQuestions with id 1 to 10 covering sentence transformations, conjunctions, mechanics corrections, and short responses.

Return ONLY a valid JSON object matching this schema:
{
  "id": "sub-${slug}-writing",
  "moduleId": "${unit.id}",
  "skillType": "writing",
  "title": "Writing Mission: [Mission Title in English]",
  "orderIndex": 3,
  "sections": [
    {
      "id": "sec-${slug}-w-theory",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-writing",
      "sectionType": "theory",
      "title": "Writing Blueprint & Mechanics",
      "orderIndex": 1,
      "content": {
        "summary": "Practical guide on sentence structure and paragraph building in English...",
        "blueprintItems": [
          {
            "step": 1,
            "title": "Step 1: [Core Formula Title]",
            "formula": "Subject + Verb + Object / Complement",
            "example": "Emma plays tennis every Sunday afternoon."
          }
        ],
        "mechanicsRules": [
          {
            "rule": "Always capitalize days of the week, months, and proper names.",
            "badExample": "we visit london on monday.",
            "goodExample": "We visit London on Monday.",
            "why": "Names of cities and days are proper nouns in English."
          }
        ],
        "sampleSentences": [
          { "en": "I usually tidy my bedroom on Saturday mornings.", "id": "Saya biasanya merapikan kamar saya pada Sabtu pagi.", "focus": "Adverb of frequency position" }
        ]
      }
    },
    {
      "id": "sec-${slug}-w-practice",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-writing",
      "sectionType": "practice",
      "title": "Interactive Writing Labs",
      "orderIndex": 2,
      "content": {
        "mechanicsChallenges": [
          {
            "id": "sent-1",
            "faultySentence": "ryan dont like tidying his room on sundays",
            "targetSentence": "Ryan doesn't like tidying his room on Sundays.",
            "translation": "Ryan tidak suka merapikan kamarnya pada hari Minggu.",
            "keyRule": "Use 'doesn't' for third-person singular and capitalize proper names and days.",
            "requiredCapitals": ["Ryan", "Sundays"]
          }
        ],
        "sentenceBuilderTargets": [
          {
            "id": "b-1",
            "category": "Daily Routines",
            "meaning": "Saya suka bermain gitar setelah sekolah.",
            "tokens": ["I", "like", "playing", "the", "guitar", "after", "school."],
            "fullSentence": "I like playing the guitar after school."
          }
        ],
        "guidedLabChallenges": [
          {
            "id": "ch-1",
            "title": "Challenge 1: Describe Your Favorite Hobby",
            "badge": "Hobby Writer",
            "instruction": "Write three to four sentences about a hobby you enjoy. Mention what it is, how often you do it, and why you like it.",
            "example": "I love taking photos of nature. I usually go to the park on weekends with my camera. It helps me relax.",
            "placeholder": "Start typing your sentences here...",
            "minWords": 15,
            "xpReward": 35
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-w-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-writing",
      "sectionType": "quiz",
      "title": "Writing Mastery Practicum",
      "orderIndex": 3,
      "content": {
        "practicumQuestions": [
          {
            "id": 1,
            "typeLabel": "Sentence Transformation",
            "instruction": "Change the following affirmative sentence into a complete negative sentence:",
            "promptText": "Luke enjoys playing video games after dinner.",
            "hint": "Use 'does not enjoy' or 'doesn't enjoy'.",
            "targetAnswers": [
              "Luke doesn't enjoy playing video games after dinner.",
              "Luke does not enjoy playing video games after dinner."
            ],
            "explanation": "With third-person singular (Luke), use 'does not' or 'doesn't' followed by the base verb 'enjoy'."
          }
        ]
      }
    }
  ]
}

No markdown code fences. Provide 3 blueprintItems, 3 mechanicsRules, 4 sampleSentences, 3 mechanicsChallenges, 3 sentenceBuilderTargets, 2 guidedLabChallenges, and exactly 10 practicumQuestions in sec-${slug}-w-quiz.`;

  const user = `Generate the Writing submodule for:
Unit ID: ${unit.id}
Level: ${cefr}
Title: ${unit.title}
Objective: ${unit.objective}
Rules: ${JSON.stringify(unit.sections?.theory?.rules || [])}`;

  return { system, user };
}
