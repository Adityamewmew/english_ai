export interface UnitBaseData {
  id: string; // e.g. "A1.1-M02"
  levelId: string; // "A1.1"
  title: string;
  cefr: string;
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
  // "A1.1-M02" -> "a1-1-m02"
  return unitId.toLowerCase().replace(/\./g, "-");
}

export function buildReadingPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const system = `You are an expert Cambridge & Oxford CEFR A1 curriculum specialist and pedagogy author for Eddys AI.
Generate the complete 'reading' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE MANDATE (ZERO INDONESIAN EXCEPT TRANSLATION):
- All summaries, learning objectives, linguistic targets, reading strategies, context warmups, rules, common traps, passage texts, comprehension questions, options, explanations, and quiz questions MUST be 100% in natural, encouraging CEFR A1 ENGLISH.
- The ONLY field in Indonesian is 'meaning' in vocabulary items (pengartian kata dalam bahasa Indonesia).

Return ONLY a valid JSON object matching this exact schema:
{
  "id": "sub-${slug}-reading",
  "moduleId": "${unit.id}",
  "skillType": "reading",
  "title": "Reading Mission: [Theme Subtitle in English]",
  "theme": "[Theme Name in English]",
  "grammarFocus": "[Grammar Target for this unit in English]",
  "vocabularyFocus": "[Vocabulary Target for this unit in English]",
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
        "summary": "Clear, friendly pedagogical overview in English explaining what students will read and achieve in this mission...",
        "linguisticTarget": {
          "grammar": "Core grammar patterns in English...",
          "vocabulary": "Primary vocabulary topics in English...",
          "readingStrategy": "Reading strategy in English (skimming for main ideas, scanning for key details)..."
        },
        "learningObjectives": [
          "Understand the main idea of short A1 passages about...",
          "Identify key details including...",
          "Recognize and practice grammar patterns with..."
        ],
        "contextWarmup": {
          "prompt": "Engaging real-life warm-up question in English...",
          "options": ["English Option 1", "English Option 2", "English Option 3"],
          "correctIndex": 0,
          "explanation": "Clear explanation in English of why this option is correct..."
        },
        "rules": [
          "Practical reading and grammar rule 1 in English...",
          "Rule 2 in English...",
          "Rule 3 in English..."
        ],
        "commonTrap": {
          "trapTitle": "Common Beginner Pitfall",
          "explanation": "Explanation in English of the common mistake...",
          "wrong": "Example of incorrect interpretation or habit",
          "correct": "Recommended reading strategy or correct pattern"
        },
        "contractionsTitle": "Natural Spoken Contractions: [Unit Topic in English]",
        "contractionsSubtitle": "Observe how subjects and verbs smoothly merge in natural spoken English:",
        "contractions": [
          {
            "subject": "I",
            "verb": "am",
            "vowelDropped": "a",
            "remainder": "m",
            "contracted": "I'm",
            "exampleFull": "...",
            "exampleContracted": "..."
          }
        ],
        "grammarFormulas": {
          "title": "Sentence Structure with [Grammar Target]",
          "description": "Assemble and swap sentence blocks to explore affirmative, negative, and question patterns:",
          "subjects": [
            { "label": "I", "pronoun": "I", "correctToBe": "am", "role": "First Person (Singular)" },
            { "label": "He", "pronoun": "He", "correctToBe": "is", "role": "Third Person (Singular)" },
            { "label": "She", "pronoun": "She", "correctToBe": "is", "role": "Third Person (Singular)" },
            { "label": "We", "pronoun": "We", "correctToBe": "are", "role": "First Person Plural" },
            { "label": "They", "pronoun": "They", "correctToBe": "are", "role": "Third Person Plural" },
            { "label": "You", "pronoun": "You", "correctToBe": "are", "role": "Second Person" }
          ],
          "complements": [
            "4 to 6 authentic unit-specific complement phrases in English"
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
            "word": "word",
            "ipa": "/.../",
            "meaning": "arti bahasa indonesia",
            "collocation": "Natural A1 English example sentence."
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-r-guided",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "dialogue",
      "title": "Reading Passage: [Passage Title]",
      "orderIndex": 3,
      "content": {
        "passageTitle": "Passage Title in English",
        "context": "Context description in English...",
        "text": "120-160 word engaging A1 English reading passage...",
        "wordCount": 140,
        "highlights": [
          { "text": "target word", "note": "Grammar or vocab insight in English", "type": "vocab | grammar" }
        ]
      }
    },
    {
      "id": "sec-${slug}-r-practice",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "practice",
      "title": "Guided Comprehension Check",
      "orderIndex": 4,
      "content": {
        "gistQuestion": {
          "prompt": "Gist / main idea question in English...",
          "options": ["Option A in English", "Option B in English", "Option C in English"],
          "correctIndex": 0,
          "explanation": "Explanation in English..."
        },
        "detailQuestions": [
          {
            "id": 1,
            "prompt": "Specific detail question in English...",
            "options": ["Option A", "Option B", "Option C"],
            "correctIndex": 0,
            "explanation": "Explanation in English..."
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-r-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-reading",
      "sectionType": "quiz",
      "title": "Reading Mastery Quiz",
      "orderIndex": 5,
      "content": {
        "passingScore": 70,
        "questions": [
          {
            "id": "q-r-1",
            "question": "Reading comprehension question in English...",
            "options": ["A", "B", "C"],
            "answer": "A",
            "explanation": "Detailed explanation in English..."
          }
        ]
      }
    }
  ]
}

No markdown fence wrapping. Just raw valid JSON. Provide at least 8 vocab items, 3 detail questions, and 5 quiz questions.`;

  const user = `Generate the Reading submodule for:
Unit ID: ${unit.id}
Title: ${unit.title}
Objective: ${unit.objective}
Existing Theory Context: ${JSON.stringify(unit.sections?.theory || {})}
Existing Vocab Context: ${JSON.stringify(unit.sections?.vocab || [])}`;

  return { system, user };
}

export function buildListeningPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const system = `You are an expert Cambridge & Oxford CEFR A1 curriculum specialist and dialogue writer for Eddys AI.
Generate the complete 'listening' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE MANDATE (ZERO INDONESIAN EXCEPT TRANSLATION):
- All summaries, learning objectives, audio prompts, context descriptions, questions, options, explanations, and connected speech notes MUST be in natural CEFR A1 ENGLISH.
- The ONLY fields in Indonesian are:
  1. 'meaning' in keyPhrases (pengartian frasa dalam bahasa Indonesia)
  2. 'translation' in dialogue lines (pengartian kalimat dalam bahasa Indonesia)

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
          "Objective 1 in English...",
          "Objective 2 in English...",
          "Objective 3 in English..."
        ],
        "keyPhrases": [
          { "phrase": "English Phrase", "meaning": "Arti Indonesia", "note": "Usage context in English..." }
        ],
        "connectedSpeech": [
          {
            "id": 1,
            "slow": "Formal slow spoken phrase from this unit",
            "fast": "Fast natural connected phrase with contraction/linking",
            "slowIpa": "/slow IPA/",
            "fastIpa": "/fast IPA/",
            "note": "Pedagogical explanation in English of how sounds blend"
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
        "context": "Situation and context of the conversation in English...",
        "audioPrompt": "Listen carefully to the following dialogue between two speakers.",
        "lines": [
          {
            "speaker": "Speaker Name",
            "text": "Natural A1 spoken sentence in English.",
            "audioUrl": "/audio/modules/${slug}/dialogue-1.mp3",
            "translation": "Terjemahan bahasa Indonesia",
            "emotion": "friendly | curious | excited | neutral"
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-l-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-listening",
      "sectionType": "quiz",
      "title": "Listening Comprehension Check",
      "orderIndex": 3,
      "content": {
        "passingScore": 70,
        "questions": [
          {
            "id": "q-l-1",
            "question": "Question based on the audio in English...",
            "options": ["A", "B", "C"],
            "answer": "A",
            "explanation": "Explanation in English pointing to where the answer is in the audio..."
          }
        ],
        "practicumQuestions": [
          {
            "id": 1,
            "type": "arrange",
            "audioText": "Audio sentence to speak",
            "instruction": "Listen to the audio, then arrange the words in the order spoken:",
            "targetSentence": "Sentence in English",
            "words": ["word3", "word1", "word2"],
            "explanation": "Explanation in English..."
          },
          {
            "id": 2,
            "type": "dictation",
            "audioText": "Audio sentence with missing word",
            "instruction": "Listen to the audio clip, then type the missing word to complete the sentence:",
            "promptSentence": "Speaker: \"I am _____ today.\"",
            "targetWord": "happy",
            "hint": "Adjective expressing joy",
            "explanation": "Explanation in English..."
          },
          {
            "id": 3,
            "type": "true_false",
            "audioText": "Audio sentence for evaluation",
            "instruction": "Listen to the audio clip, then determine whether the statement is True or False:",
            "statement": "Statement about the dialogue in English.",
            "isTrue": true,
            "explanation": "Explanation in English..."
          }
        ]
      }
    }
  ]
}

No markdown fence wrapping. Just raw valid JSON. Provide at least 4 keyPhrases, 8-10 dialogue lines, 5 quiz questions, and 6 practicumQuestions.`;

  const user = `Generate the Listening submodule for:
Unit ID: ${unit.id}
Title: ${unit.title}
Objective: ${unit.objective}
Base Dialogue Context: ${JSON.stringify(unit.sections?.dialogue || {})}`;

  return { system, user };
}

export function buildWritingPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const system = `You are an expert Cambridge & Oxford CEFR A1 writing coach for Eddys AI.
Generate the complete 'writing' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE MANDATE (ZERO INDONESIAN EXCEPT TRANSLATION):
- All summaries, blueprint guides, mechanics rules, instructions, explanations, hints, criteria, placeholders, and challenges MUST be in natural CEFR A1 ENGLISH.
- The ONLY fields in Indonesian are:
  1. 'meaning' in sentenceBuilderTargets (pengartian kalimat untuk panduan siswa)
  2. 'translation' in mechanicsChallenges (pengartian kalimat)

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
        "summary": "Guide on constructing sentences and short paragraphs in English...",
        "blueprintItems": [
          {
            "step": 1,
            "title": "Step Title in English",
            "formula": "Subject + Verb + ...",
            "example": "English example sentence."
          }
        ],
        "mechanicsRules": [
          {
            "rule": "Capitalization or punctuation rule in English...",
            "badExample": "incorrect example",
            "goodExample": "Correct Example.",
            "why": "Explanation in English of the rule..."
          }
        ],
        "sampleSentences": [
          { "en": "English sentence", "id": "Terjemahan Indonesia", "focus": "Grammar target in English" }
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
            "faultySentence": "lowercase and missing punctuation...",
            "targetSentence": "Corrected English Sentence.",
            "translation": "Arti kalimat dalam bahasa Indonesia",
            "keyRule": "Rule explanation in English...",
            "requiredCapitals": ["Word1", "Word2"]
          }
        ],
        "sentenceBuilderTargets": [
          {
            "id": "b-1",
            "category": "Sentence Category in English",
            "meaning": "Arti kalimat bahasa Indonesia",
            "tokens": ["Word1", "Word2", "Word3."],
            "fullSentence": "Word1 Word2 Word3."
          }
        ],
        "guidedLabChallenges": [
          {
            "id": "ch-1",
            "title": "Challenge 1: [Title in English]",
            "badge": "Badge Name in English",
            "instruction": "Writing instruction in English...",
            "example": "Example paragraph in English...",
            "placeholder": "Start writing here...",
            "minWords": 12,
            "xpReward": 30
          }
        ]
      }
    },
    {
      "id": "sec-${slug}-w-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-writing",
      "sectionType": "quiz",
      "title": "Writing Practicum & Assessment",
      "orderIndex": 3,
      "content": {
        "practicumQuestions": [
          {
            "id": "w-p-1",
            "prompt": "Write a complete response in English for...",
            "criteria": "Assessment criteria in English...",
            "sampleGoodAnswer": "I am very happy today because the sun is shining."
          }
        ]
      }
    }
  ]
}

No markdown fence wrapping. Just raw valid JSON. Provide at least 3 blueprintItems, 3 mechanicsRules, 4 sampleSentences, 3 mechanicsChallenges, 3 sentenceBuilderTargets, 2 guidedLabChallenges, and 3 practicumQuestions.`;

  const user = `Generate the Writing submodule for:
Unit ID: ${unit.id}
Title: ${unit.title}
Objective: ${unit.objective}
Rules: ${JSON.stringify(unit.sections?.theory?.rules || [])}`;

  return { system, user };
}

export function buildSpeakingPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const system = `You are an expert Cambridge and Oxford CEFR A1 English speaking curriculum designer for Eddys AI.
Generate the complete 'speaking' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE MANDATE (ZERO INDONESIAN EXCEPT TRANSLATION):
- All summaries, guidance, instructions, scenario contexts, character roles, call topics, greetings, hints, explanations, and story points MUST be in natural CEFR A1 ENGLISH.
- The ONLY field in Indonesian is:
  1. 'translation' in roleplay turns (pengartian dialog dalam bahasa Indonesia)

CRITICAL REQUIREMENT FOR SPEAKING QUIZ:
You MUST generate EXACTLY 10 Practicum Questions in section 3 matching this breakdown:
1. Soal 1-2: category 'storytelling' (Monologue storytelling). Must have 'storyPoints' array of 3 bullet points in English.
2. Soal 3-6: category 'roleplay' (Interactive live roleplay call). Must include 'scenarioContext' and 'characterRole' in English.
3. Soal 7-10: category 'linguistic_drill':
   - Soal 7: focus 'vocab'
   - Soal 8: focus 'grammar'
   - Soal 9: focus 'pronunciation_stress' (Syllable stress shift)
   - Soal 10: focus 'pronunciation_intonation' (Rising / Falling intonation)

Return ONLY a valid JSON object matching this schema:
{
  "id": "sub-${slug}-speaking",
  "moduleId": "${unit.id}",
  "skillType": "speaking",
  "title": "Speaking Lab: [Lab Title in English]",
  "orderIndex": 4,
  "sections": [
    {
      "id": "sec-${slug}-s-theory",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-speaking",
      "sectionType": "theory",
      "title": "Pronunciation & Delivery Guide",
      "orderIndex": 1,
      "content": {
        "summary": "Speaking and pronunciation overview in English...",
        "audioGuidance": "Intonation and articulation tips in English...",
        "pillars": [
          { "name": "Pillar Name in English", "target": "Target Skill in English", "explanation": "Explanation in English..." }
        ]
      }
    },
    {
      "id": "sec-${slug}-s-practice",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-speaking",
      "sectionType": "practice",
      "title": "Pronunciation Drills & Roleplay",
      "orderIndex": 2,
      "content": {
        "stressPairs": [
          {
            "id": "pair-1",
            "country": "HAPPY",
            "countryAudio": "happy",
            "countrySyllables": [
              { "text": "HAP", "isStressed": true },
              { "text": "py", "isStressed": false }
            ],
            "nationality": "un-HAP-py",
            "natAudio": "unhappy",
            "natSyllables": [
              { "text": "un", "isStressed": false },
              { "text": "HAP", "isStressed": true },
              { "text": "py", "isStressed": false }
            ],
            "shiftExplanation": "Rhythm shift explanation in English..."
          }
        ],
        "drills": [
          {
            "id": "spk-d-1",
            "targetText": "English sentence to speak.",
            "phonetic": "/IPA transcription/",
            "focus": "Drill focus in English",
            "hint": "Practical pronunciation tip in English"
          }
        ],
        "roleplay": {
          "context": "Roleplay context scenario in English...",
          "roles": ["Mr. Khoirul", "Student"],
          "turns": [
            { "speaker": "Mr. Khoirul", "text": "Hello! How are you feeling today?", "translation": "Halo! Bagaimana perasaanmu hari ini?" },
            { "speaker": "Student", "text": "I am feeling excited and happy!", "translation": "Saya merasa bersemangat dan senang!" }
          ]
        }
      }
    },
    {
      "id": "sec-${slug}-s-quiz",
      "moduleId": "${unit.id}",
      "subModuleId": "sub-${slug}-speaking",
      "sectionType": "quiz",
      "title": "Speaking Practicum & AI Voice Evaluation",
      "orderIndex": 3,
      "content": {
        "passingScore": 70,
        "practicumQuestions": [
          {
            "id": 1,
            "category": "storytelling",
            "typeLabel": "Self Storytelling",
            "instruction": "Instruction in English...",
            "audioPrompt": "English prompt by tutor...",
            "storyPoints": ["Point 1 in English", "Point 2 in English", "Point 3 in English"],
            "targetSentence": "Expected spoken English sentence.",
            "phonetic": "/IPA/",
            "expectedKeywords": ["keyword1", "keyword2"],
            "hint": "Pronunciation hint in English",
            "explanation": "Pedagogical explanation in English"
          }
        ]
      }
    }
  ]
}

No markdown fence wrapping. Just raw valid JSON. Ensure exactly 10 questions in practicumQuestions matching the 3 categories.`;

  const user = `Generate the Speaking submodule for:
Unit ID: ${unit.id}
Title: ${unit.title}
Objective: ${unit.objective}
Base Speaking Lab Context: ${JSON.stringify(unit.sections?.speakingLab || {})}`;

  return { system, user };
}
