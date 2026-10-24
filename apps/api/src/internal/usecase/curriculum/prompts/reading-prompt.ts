import { UnitBaseData, getUnitSlug } from "./types";

export function buildReadingPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const cefr = unit.cefr || "A2";

  const system = `You are a Cambridge & Oxford CEFR ${cefr} reading curriculum author for Eddys AI.
Generate the complete 'reading' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE & ANTI-SLOP MANDATE:
1. ZERO AI SLOP: Absolutely avoid generic AI buzzwords such as 'delve', 'testament', 'unlock', 'elevate', 'journey', 'robust', 'seamless', 'cutting-edge', 'tapestry', 'game-changer'.
2. NO EM DASHES: Do not use the em dash character (—). Use a comma, colon, or separate sentences instead.
3. 100% NATURAL ENGLISH: All summaries, learning objectives, linguistic targets, reading strategies, context warmups, rules, common traps, passage texts, comprehension questions, options, and explanations MUST be in natural, academic/authentic CEFR ${cefr} English (grounded in Cambridge Think 5, Complete IELTS & TOEFL Academic English for C1/C2, or Cambridge Think for A1-B2).
4. INDONESIAN ONLY IN VOCAB MEANING: The ONLY field permitted in Indonesian is 'meaning' in vocabulary items (e.g. "hobi, kegemaran").

Return ONLY a valid JSON object matching this exact schema:
{
  "id": "sub-${slug}-reading",
  "moduleId": "${unit.id}",
  "skillType": "reading",
  "title": "Reading Mission: [Theme Subtitle in English]",
  "theme": "[Theme Name in English]",
  "grammarFocus": "[Grammar Target in English]",
  "vocabularyFocus": "[Vocabulary Target in English]",
  "orderIndex": 1,
  "sections": [
    {
      "id": "sec-${slug}-r-theory",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "theory",
      "title": "Learning Objectives & Warm-up",
      "orderIndex": 1,
      "content": {
        "summary": "Clear, friendly pedagogical overview in English explaining what students will read and achieve...",
        "linguisticTarget": {
          "grammar": "Core grammar patterns in English...",
          "vocabulary": "Primary vocabulary topics in English...",
          "readingStrategy": "Reading strategy in English (skimming for main ideas, scanning for key details)..."
        },
        "learningObjectives": [
          "Understand the main idea of short ${cefr} texts about...",
          "Locate specific details such as...",
          "Recognize and practice grammar patterns with..."
        ],
        "contextWarmup": {
          "prompt": "Engaging real-life warm-up question in English...",
          "options": ["English Option 1", "English Option 2", "English Option 3"],
          "correctIndex": 0,
          "explanation": "Clear explanation in English of why this option is correct."
        },
        "rules": [
          "Rule 1 in English...",
          "Rule 2 in English...",
          "Rule 3 in English..."
        ],
        "commonTrap": {
          "trapTitle": "Common Learner Pitfall",
          "explanation": "Explanation in English of the common mistake...",
          "wrong": "Example of incorrect sentence or misunderstanding",
          "correct": "Correct pattern or recommended reading strategy"
        },
        "contractionsTitle": "Natural Spoken Contractions: [Topic]",
        "contractionsSubtitle": "Observe how subjects and verbs smoothly merge in everyday English:",
        "contractions": [
          {
            "subject": "He",
            "verb": "is",
            "vowelDropped": "i",
            "remainder": "s",
            "contracted": "He's",
            "exampleFull": "He is doing his homework.",
            "exampleContracted": "He's doing his homework."
          }
        ],
        "grammarFormulas": {
          "title": "Sentence Patterns with [Grammar Target]",
          "description": "Assemble sentence blocks to practice affirmative, negative, and question forms:",
          "subjects": [
            { "label": "I", "pronoun": "I", "correctToBe": "am", "role": "First Person Singular" }
          ],
          "verbs": [
            { "base": "play", "thirdPerson": "plays", "continuous": "playing" }
          ],
          "complements": [
            { "text": "football every Saturday", "type": "Routine Object" }
          ]
        }
      }
    },
    {
      "id": "sec-${slug}-r-vocab",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "vocab",
      "title": "Key Vocabulary Bank",
      "orderIndex": 2,
      "content": {
        "items": [
          {
            "word": "collect",
            "ipa": "/kəˈlekt/",
            "meaning": "mengumpulkan",
            "partOfSpeech": "verb",
            "exampleSentence": "I collect autographs from famous athletes.",
            "collocation": "collect autographs / collect stamps"
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-r-guided",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "dialogue",
      "title": "Guided Reading Passage",
      "orderIndex": 3,
      "content": {
        "passageTitle": "Passage Title in English",
        "audioUrl": "/audio/modules/${slug}/reading-passage.mp3",
        "durationSeconds": 60,
        "paragraphs": [
          "Paragraph 1 in natural CEFR ${cefr} English (around 50-70 words)...",
          "Paragraph 2 in natural CEFR ${cefr} English (around 50-70 words)..."
        ],
        "timestamps": []
      }
    },
    {
      "id": "sec-${slug}-r-practice",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "practice",
      "title": "Interactive Cable Connection (Vocab Match)",
      "orderIndex": 4,
      "content": {
        "drills": [
          {
            "id": "drill-cable-1",
            "instruction": "Connect each vocabulary term on the left with its accurate meaning on the right.",
            "pairs": [
              { "left": "collect", "right": "mengumpulkan" },
              { "left": "explore", "right": "menjelajahi" },
              { "left": "hobby", "right": "kegemaran" },
              { "left": "practice", "right": "berlatih" },
              { "left": "skill", "right": "keterampilan" }
            ]
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-r-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "quiz",
      "title": "Reading Comprehension Checkpoint",
      "orderIndex": 5,
      "content": {
        "passingScore": 80,
        "questions": [
          {
            "id": "q-r-1",
            "question": "Clear comprehension question in English about the passage...",
            "options": ["Option A", "Option B", "Option C"],
            "answer": "Option A",
            "explanation": "Explanation in English pointing to evidence in the passage."
          }
        ]
      }
    }
  ]
}

No markdown code fences. Provide exactly 8-10 vocabulary items in sec-${slug}-r-vocab, 1 drill with 5-6 matching pairs (drawn directly from the vocabulary bank) in sec-${slug}-r-practice, and 5 focused reading comprehension questions in sec-${slug}-r-quiz.`;

  const user = `Generate the Reading submodule for:
Unit ID: ${unit.id}
Level: ${cefr}
Title: ${unit.title}
Objective: ${unit.objective}
Vocabulary Source: ${JSON.stringify(unit.sections?.vocab || [])}
Theory Rules: ${JSON.stringify(unit.sections?.theory?.rules || [])}`;

  return { system, user };
}
