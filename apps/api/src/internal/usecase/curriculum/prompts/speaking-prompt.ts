import { UnitBaseData, getUnitSlug } from "./types";

export function buildSpeakingPrompt(unit: UnitBaseData): { system: string; user: string } {
  const slug = getUnitSlug(unit.id);
  const cefr = unit.cefr || "A2";

  const system = `You are an expert Cambridge and Oxford CEFR ${cefr} speaking curriculum designer for Eddys AI.
Generate the complete 'speaking' sub-module for unit ${unit.id}: "${unit.title}".

CRITICAL LANGUAGE & ANTI-SLOP MANDATE:
1. ZERO AI SLOP: Absolutely avoid generic AI buzzwords such as 'delve', 'testament', 'unlock', 'elevate', 'journey', 'robust', 'seamless', 'cutting-edge', 'tapestry'.
2. NO EM DASHES: Do not use the em dash character (—). Use a comma, colon, or separate sentences instead.
3. 100% NATURAL SPOKEN ENGLISH: Pronunciation guides, reflex drills, roleplay scenarios, storytelling points, and feedback MUST be in natural CEFR ${cefr} English.
4. INDONESIAN ONLY IN ROLEPLAY TRANSLATION: Only 'translation' in roleplay turns may be in Indonesian. Everything else must be in English.
5. EXACTLY 10 SPEAKING QUESTIONS: You MUST generate exactly 10 practicumQuestions in sec-${slug}-s-quiz matching this breakdown:
   - Questions 1-2: category 'storytelling' (Monologue storytelling with 3 bullet storyPoints in English).
   - Questions 3-6: category 'roleplay' (Interactive live roleplay call with scenarioContext and characterRole in English).
   - Questions 7-10: category 'linguistic_drill':
     * Question 7: focus 'vocab'
     * Question 8: focus 'grammar'
     * Question 9: focus 'pronunciation_stress' (Syllable stress)
     * Question 10: focus 'pronunciation_intonation' (Rising / Falling intonation)

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
          { "name": "Vowel Clarity", "target": "Clear short and long vowels", "explanation": "Explanation in English..." }
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
            "country": "RE-lax",
            "countryAudio": "relax",
            "countrySyllables": [
              { "text": "re", "isStressed": false },
              { "text": "LAX", "isStressed": true }
            ],
            "nationality": "RE-la-xing",
            "natAudio": "relaxing",
            "natSyllables": [
              { "text": "re", "isStressed": false },
              { "text": "LAX", "isStressed": true },
              { "text": "ing", "isStressed": false }
            ],
            "shiftExplanation": "Notice that the main stress stays on the second syllable."
          }
        ],
        "drills": [
          {
            "id": "spk-d-1",
            "targetText": "I usually hang out with my classmates after school.",
            "phonetic": "/aɪ ˈjuːʒuəli hæŋ aʊt wɪð maɪ ˈklɑːsmeɪts ˈɑːftə skuːl/",
            "focus": "Phrasal verb 'hang out' and natural rhythm",
            "hint": "Link 'hang' and 'out' smoothly together."
          }
        ],
        "roleplay": {
          "context": "You meet your English teacher, Mr. Khoirul, in the school courtyard during break time.",
          "roles": ["Mr. Khoirul", "Student"],
          "turns": [
            { "speaker": "Mr. Khoirul", "text": "Hi there! What hobbies do you enjoy doing after school?", "translation": "Halo! Hobi apa yang kamu sukai setelah sekolah?" },
            { "speaker": "Student", "text": "I really enjoy playing badminton and reading blogs.", "translation": "Saya sangat suka bermain bulu tangkis dan membaca blog." }
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
            "typeLabel": "Personal Storytelling",
            "instruction": "Speak for at least 20 seconds about your weekend routine and favorite activity.",
            "audioPrompt": "Tell me about what you usually do on Saturdays and why you enjoy it.",
            "storyPoints": [
              "What time you wake up and how you start your morning",
              "Your favorite hobby or sport you do on Saturday",
              "Who you spend time with and how it makes you feel"
            ],
            "targetSentence": "On Saturdays I wake up at eight, play football with my friends, and relax in the evening.",
            "phonetic": "/ɒn ˈsætədeɪz aɪ weɪk ʌp æt eɪt/",
            "expectedKeywords": ["Saturdays", "football", "friends", "relax"],
            "explanation": "Speak fluently in full sentences using the Present Simple tense."
          }
        ]
      }
    }
  ]
}

No markdown code fences. Provide 4 stressPairs, 4 drills, 4 roleplay turns, and exactly 10 practicumQuestions in sec-${slug}-s-quiz.`;

  const user = `Generate the Speaking submodule for:
Unit ID: ${unit.id}
Level: ${cefr}
Title: ${unit.title}
Objective: ${unit.objective}
Vocabulary: ${JSON.stringify(unit.sections?.vocab || [])}`;

  return { system, user };
}
