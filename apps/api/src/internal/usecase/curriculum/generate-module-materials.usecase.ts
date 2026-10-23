import { AppError } from "../../../common/errors/app-error";

export interface GenerateModuleMaterialsInput {
  moduleTitle: string;
  cefr: string; // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  objective?: string;
  customInstructions?: string;
  skillType?: "reading" | "listening" | "writing" | "speaking" | "assessment" | "all";
}

export interface GeneratedSectionItem {
  title: string;
  section_type: "theory" | "vocab" | "dialogue" | "quiz";
  content: any;
}

export interface GeneratedModuleResponse {
  moduleTitle: string;
  cefr: string;
  materials: Record<string, GeneratedSectionItem[]> | GeneratedSectionItem[];
}

const OMNI_API_URL = process.env.AI_TTS_BASE_URL || "https://omni.drimland.my.id/v1";
const OMNI_API_KEY = process.env.AI_TTS_API_KEY || "sk-8a1c8c009c8af9a0-15746f-4c9a4a96";
const OMNI_MODEL = "antigravity/gemini-3.8-flash-tiered";

export async function generateModuleMaterialsUsecase(
  input: GenerateModuleMaterialsInput
): Promise<GeneratedModuleResponse> {
  const { moduleTitle, cefr, objective, customInstructions, skillType = "all" } = input;

  if (!moduleTitle) {
    throw new AppError("Judul modul wajib diisi", 400);
  }

  const isSingleSkill = skillType && skillType !== "all";

  const systemPrompt = `You are an expert Cambridge & CEFR English curriculum designer for EDDY'S English School.
Your task is to generate complete, high-quality, practical learning materials for Indonesian students learning English at CEFR level ${cefr.toUpperCase()}.

You must output ONLY valid, raw JSON (no markdown formatting, no \`\`\`json code fences, no extra text).
The JSON must strictly conform to these section structures:

1. Theory section:
{
  "title": "Title of theory",
  "section_type": "theory",
  "content": {
    "summary": "Clear, concise summary in Indonesian/English explaining the core language point.",
    "rules": ["Rule 1 with example", "Rule 2 with example", "Rule 3 with example"],
    "commonTrap": {
      "trapTitle": "Common Learner Mistake",
      "wrong": "Example of common incorrect usage",
      "correct": "Example of correct usage",
      "explanation": "Why this mistake happens and how to avoid it in Indonesian"
    }
  }
}

2. Vocab section:
{
  "title": "Essential Vocabulary",
  "section_type": "vocab",
  "content": {
    "items": [
      {
        "word": "target word",
        "phonetic": "/fəˈnet.ɪk/",
        "partOfSpeech": "noun/verb/adj",
        "meaningId": "Arti dalam bahasa Indonesia yang akurat",
        "exampleSentence": "A clear English sentence using the word."
      }
    ]
  }
}

3. Dialogue section:
{
  "title": "Conversation in Context",
  "section_type": "dialogue",
  "content": {
    "context": "Short scenario description in English & Indonesian",
    "lines": [
      {
        "speaker": "Person A",
        "text": "English line spoken",
        "translation": "Terjemahan bahasa Indonesia"
      }
    ]
  }
}

4. Quiz section:
{
  "title": "Comprehension & Practice Quiz",
  "section_type": "quiz",
  "content": {
    "passingScore": 70,
    "questions": [
      {
        "question": "Clear multiple choice question in English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Exact text of the correct option",
        "explanation": "Penjelasan mengapa jawaban ini benar dalam bahasa Indonesia"
      }
    ]
  }
}
`;

  let userPrompt = "";

  if (isSingleSkill) {
    userPrompt = `Generate curriculum materials specifically for sub-module skill: "${skillType.toUpperCase()}".
Module Title: "${moduleTitle}"
Target CEFR Level: ${cefr.toUpperCase()}
${objective ? `Learning Objective: ${objective}` : ""}
${customInstructions ? `Custom Instructions: ${customInstructions}` : ""}

Provide 2 to 3 practical, rich sections for this skill (e.g. for reading: 1 text/theory + 1 vocab + 1 quiz; for listening: 1 dialogue + 1 vocab + 1 quiz; for writing: 1 theory + 1 quiz; for speaking: 1 dialogue + 1 vocab; for assessment: 1 quiz with 5-6 questions).
Output a JSON array of sections:
[
  { "title": "...", "section_type": "...", "content": { ... } }
]`;
  } else {
    userPrompt = `Generate a complete 5-skill curriculum package for the module:
Module Title: "${moduleTitle}"
Target CEFR Level: ${cefr.toUpperCase()}
${objective ? `Learning Objective: ${objective}` : ""}
${customInstructions ? `Custom Instructions: ${customInstructions}` : ""}

Output a JSON object with keys for each of the 5 skills: "reading", "listening", "writing", "speaking", "assessment".
Each key must contain an array of section objects matching the section types defined:
{
  "reading": [
    { "title": "...", "section_type": "theory", "content": { ... } },
    { "title": "...", "section_type": "vocab", "content": { "items": [ ...5-6 words... ] } },
    { "title": "...", "section_type": "quiz", "content": { "passingScore": 70, "questions": [ ...3-4 questions... ] } }
  ],
  "listening": [
    { "title": "...", "section_type": "dialogue", "content": { ... } },
    { "title": "...", "section_type": "vocab", "content": { "items": [ ...4-5 words... ] } },
    { "title": "...", "section_type": "quiz", "content": { "passingScore": 70, "questions": [ ...3-4 questions... ] } }
  ],
  "writing": [
    { "title": "...", "section_type": "theory", "content": { ... } },
    { "title": "...", "section_type": "quiz", "content": { "passingScore": 70, "questions": [ ...4 questions... ] } }
  ],
  "speaking": [
    { "title": "...", "section_type": "dialogue", "content": { ... } },
    { "title": "...", "section_type": "vocab", "content": { "items": [ ...4-5 words... ] } }
  ],
  "assessment": [
    { "title": "Unit Final Assessment", "section_type": "quiz", "content": { "passingScore": 70, "questions": [ ...6-8 comprehensive questions... ] } }
  ]
}`;
  }

  try {
    const res = await fetch(`${OMNI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OMNI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OMNI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new AppError(`OmniRoute AI Gateway error (${res.status}): ${errText}`, 502);
    }

    const jsonRes = (await res.json()) as any;
    let rawContent = jsonRes?.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    rawContent = rawContent.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

    let parsedMaterials: any;
    try {
      parsedMaterials = JSON.parse(rawContent);
    } catch {
      // If parsing fails, try to extract first JSON object or array
      const match = rawContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        parsedMaterials = JSON.parse(match[0]);
      } else {
        throw new AppError("Gagal mem-parsing output JSON dari AI Gateway", 500);
      }
    }

    return {
      moduleTitle,
      cefr,
      materials: parsedMaterials,
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError(`AI Generation failed: ${err.message || String(err)}`, 500);
  }
}
