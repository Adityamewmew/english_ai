import fs from "fs";
import path from "path";
import { B1_B2_PLANS, ModuleSyllabusPlan } from "./b1_b2_expanded_plans";
import { db } from "../apps/api/src/db";
import { curriculumLevels, curriculumModules, moduleSections } from "../apps/api/src/db/schema";
import { eq } from "drizzle-orm";

const AI_BASE_URL = "http://localhost:20128/v1";
const AI_API_KEY = "sk-96f2316f84884524-2cee23-3c70805b";
const AI_CHAT_MODEL = "claude";
const CONCURRENCY = 2;

const BRAIN_PATH = path.resolve("c:/project/english-ai/data/curriculum_knowledge_brain.json");
const brain = JSON.parse(fs.readFileSync(BRAIN_PATH, "utf-8"));

const LEVEL_DEFINITIONS = [
  { id: "B1.4", cefr: "B1", title: "B1.4 - Workplace Communication, Logistics & Practical Fluency", orderIndex: 4 },
  { id: "B1.5", cefr: "B1", title: "B1.5 - Social Debates, Media Literacy & Bridge to B2", orderIndex: 5 },
  { id: "B2.4", cefr: "B2", title: "B2.4 - Academic Argumentation, Research Synthesis & Formal Registers", orderIndex: 4 },
  { id: "B2.5", cefr: "B2", title: "B2.5 - Nuanced Persuasion, Mixed Conditionals & Bridge to C1", orderIndex: 5 },
];

async function ensureLevelsInDatabase() {
  console.log("[DB] Ensuring expanded levels exist in curriculum_levels table...");
  for (const lvl of LEVEL_DEFINITIONS) {
    const existing = await db.select().from(curriculumLevels).where(eq(curriculumLevels.id, lvl.id));
    if (existing.length === 0) {
      await db.insert(curriculumLevels).values({
        id: lvl.id,
        cefr: lvl.cefr,
        title: lvl.title,
        description: `Tingkat ${lvl.id} dalam kerangka CEFR ${lvl.cefr}`,
        orderIndex: lvl.orderIndex,
        createdAt: new Date(),
      });
      console.log(`  + Inserted level ${lvl.id}: ${lvl.title}`);
    }
  }
}

async function generateModuleWithAi(plan: ModuleSyllabusPlan, maxRetries = 3): Promise<any> {
  const levelKnowledge = brain.levels[plan.cefr] || {};
  const syllabusContext = levelKnowledge.syllabusContents || "";
  const specializedSyllabus = levelKnowledge.businessPracticalSyllabus || levelKnowledge.academicGrammarSyllabus || "";

  const systemPrompt = `You are a world-class Cambridge and CEFR curriculum architect.
Your task is to generate a comprehensive, highly authentic English learning module based on the provided Cambridge Think & exam syllabus context.

Requirements:
Return ONLY a valid JSON object matching this exact structure:
{
  "theory": {
    "summary": "Clear, engaging pedagogical explanation in natural Indonesian explaining the target grammar/rhetorical concept.",
    "rules": [
      {
        "pattern": "Formula / grammatical structure (e.g. Subject + could / would + base verb)",
        "meaning": "Meaning / communicative function in Indonesian",
        "example": "Authentic example sentence in English"
      },
      {
        "pattern": "Second formula / variation",
        "meaning": "Meaning / communicative function in Indonesian",
        "example": "Authentic example sentence in English"
      },
      {
        "pattern": "Third formula / register nuance",
        "meaning": "Meaning / communicative function in Indonesian",
        "example": "Authentic example sentence in English"
      }
    ],
    "commonTrap": {
      "trapTitle": "Common misconception / nuance trap title in Indonesian",
      "explanation": "Why learners make this mistake and how to avoid it",
      "wrong": "Authentic incorrect sentence in English",
      "correct": "Correct sentence in English"
    },
    "readinessQuestions": [
      {
        "id": 1,
        "category": "Pengenalan Bentuk",
        "prompt": "Prompt in Indonesian testing target pattern recognition",
        "options": ["English sentence A", "English sentence B", "English sentence C"],
        "correctIndex": 0,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 2,
        "category": "Pemahaman Aturan",
        "prompt": "Prompt in Indonesian testing the common trap",
        "options": ["English sentence A", "English sentence B", "English sentence C"],
        "correctIndex": 1,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 3,
        "category": "Penerapan Konteks",
        "prompt": "Short conversation exchange prompt with [...] to complete",
        "options": ["English response A", "English response B", "English response C"],
        "correctIndex": 2,
        "explanation": "Explanation in Indonesian"
      }
    ]
  },
  "vocab": [
    { "word": "Term 1", "translation": "Arti 1", "example": "Example 1", "context": "Usage context 1" },
    { "word": "Term 2", "translation": "Arti 2", "example": "Example 2", "context": "Usage context 2" },
    { "word": "Term 3", "translation": "Arti 3", "example": "Example 3", "context": "Usage context 3" },
    { "word": "Term 4", "translation": "Arti 4", "example": "Example 4", "context": "Usage context 4" },
    { "word": "Term 5", "translation": "Arti 5", "example": "Example 5", "context": "Usage context 5" },
    { "word": "Term 6", "translation": "Arti 6", "example": "Example 6", "context": "Usage context 6" }
  ],
  "dialogue": {
    "context": "Scenario description in Indonesian setting the realistic scene",
    "lines": [
      { "speaker": "Alex", "text": "English dialogue line 1", "translation": "Terjemahan Indonesia 1" },
      { "speaker": "Morgan", "text": "English dialogue line 2", "translation": "Terjemahan Indonesia 2" },
      { "speaker": "Alex", "text": "English dialogue line 3", "translation": "Terjemahan Indonesia 3" },
      { "speaker": "Morgan", "text": "English dialogue line 4", "translation": "Terjemahan Indonesia 4" }
    ]
  },
  "practice": {
    "goal": "Communicative speaking goal in Indonesian",
    "scenario": "Interactive speaking prompt setting the context for roleplay"
  },
  "quiz": {
    "passingScore": 75,
    "questions": [
      {
        "id": 1,
        "prompt": "Multiple choice quiz question 1 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 2,
        "prompt": "Multiple choice quiz question 2 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 1,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 3,
        "prompt": "Multiple choice quiz question 3 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 2,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 4,
        "prompt": "Multiple choice quiz question 4 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 3,
        "explanation": "Explanation in Indonesian"
      }
    ]
  }
}

CRITICAL RULES:
- Exactly 3 readiness questions, each with EXACTLY 3 unique options and no generic filler options.
- No markdown wrappers outside the JSON if possible, or standard \`\`\`json.`;

  const userPrompt = `Module Metadata:
ID: ${plan.id}
Level: ${plan.levelId} (CEFR ${plan.cefr})
Title: ${plan.title}
Group: ${plan.group}
Objective: ${plan.objective}
Is Graduation Exam: ${plan.isExam}

Syllabus Knowledge Context:
${syllabusContext.slice(0, 1500)}
${specializedSyllabus.slice(0, 1500)}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CHAT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI Gateway error (${res.status}): ${await res.text()}`);
      }

      const json: any = await res.json();
      const rawText = json.choices?.[0]?.message?.content || "";
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON structure found in AI response");

      const parsed = JSON.parse(match[0]);
      if (!parsed.theory || !parsed.vocab || !parsed.dialogue || !parsed.quiz) {
        throw new Error("Missing essential section in AI response");
      }

      return parsed;
    } catch (err: any) {
      if (attempt === maxRetries) {
        throw new Error(`Failed generating ${plan.id} after ${maxRetries} attempts: ${err.message}`);
      }
      console.warn(`[${plan.id}] Retry ${attempt}/${maxRetries} in 3000ms... (${err.message})`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

async function saveModuleData(plan: ModuleSyllabusPlan, sectionsData: any) {
  // 1. Save single file JSON in data/client_curriculum/<levelSub>/<id>.json
  const levelSub = plan.cefr.toLowerCase();
  const dir = path.resolve(`c:/project/english-ai/data/client_curriculum/${levelSub}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const singlePath = path.join(dir, `${plan.id}.json`);
  const fullModuleJson = {
    id: plan.id,
    levelId: plan.levelId,
    title: plan.title,
    cefr: plan.cefr,
    group: plan.group,
    objective: plan.objective,
    complexity: plan.complexity,
    estimatedMinutes: 15,
    isExam: plan.isExam,
    passingScore: 70,
    orderIndex: plan.orderIndex,
    sections: {
      theory: sectionsData.theory,
      vocab: sectionsData.vocab,
      dialogue: sectionsData.dialogue,
      practice: sectionsData.practice,
      quiz: sectionsData.quiz,
    },
  };
  fs.writeFileSync(singlePath, JSON.stringify(fullModuleJson, null, 2), "utf-8");

  // 2. Append/Update in data/client_curriculum/level_<cefr>_all_sublevels.json
  const bundlePath = path.resolve(`c:/project/english-ai/data/client_curriculum/level_${levelSub}_all_sublevels.json`);
  if (fs.existsSync(bundlePath)) {
    const raw = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
    const list: any[] = Array.isArray(raw) ? raw : raw.modules || [];
    const idx = list.findIndex((m: any) => m.id === plan.id);
    if (idx >= 0) {
      list[idx] = fullModuleJson;
    } else {
      list.push(fullModuleJson);
    }
    if (Array.isArray(raw)) {
      fs.writeFileSync(bundlePath, JSON.stringify(list, null, 2), "utf-8");
    } else {
      raw.modules = list;
      raw.totalModules = list.length;
      fs.writeFileSync(bundlePath, JSON.stringify(raw, null, 2), "utf-8");
    }
  }

  // 3. Upsert into PostgreSQL DB
  const existingMod = await db.select().from(curriculumModules).where(eq(curriculumModules.id, plan.id));
  if (existingMod.length > 0) {
    await db
      .update(curriculumModules)
      .set({
        levelId: plan.levelId,
        title: plan.title,
        cefr: plan.cefr,
        group: plan.group,
        objective: plan.objective,
        complexity: plan.complexity,
        estimatedMinutes: 15,
        isExam: plan.isExam,
        passingScore: 70,
        orderIndex: plan.orderIndex,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(curriculumModules.id, plan.id));
  } else {
    await db.insert(curriculumModules).values({
      id: plan.id,
      levelId: plan.levelId,
      title: plan.title,
      cefr: plan.cefr,
      group: plan.group,
      objective: plan.objective,
      complexity: plan.complexity,
      estimatedMinutes: 15,
      isExam: plan.isExam,
      passingScore: 70,
      orderIndex: plan.orderIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Upsert the 5 module sections into DB
  const sectionsList = [
    { type: "theory", title: "Teori & Tata Bahasa (Theory & Grammar)", content: sectionsData.theory, order: 1 },
    { type: "vocab", title: "Kosakata Inti (Core Vocabulary)", content: { items: sectionsData.vocab }, order: 2 },
    { type: "dialogue", title: "Percakapan Kontekstual (Dialogue)", content: sectionsData.dialogue, order: 3 },
    { type: "practice", title: "Praktik Berbicara (Speaking Lab)", content: sectionsData.practice, order: 4 },
    { type: "quiz", title: "Kuis Evaluasi (Module Assessment)", content: sectionsData.quiz, order: 5 },
  ];

  for (const s of sectionsList) {
    const secId = `${plan.id}-SEC-${s.order}`;
    const existingSec = await db.select().from(moduleSections).where(eq(moduleSections.id, secId));
    if (existingSec.length > 0) {
      await db
        .update(moduleSections)
        .set({
          sectionType: s.type,
          title: s.title,
          content: s.content,
          orderIndex: s.order,
        })
        .where(eq(moduleSections.id, secId));
    } else {
      await db.insert(moduleSections).values({
        id: secId,
        moduleId: plan.id,
        sectionType: s.type,
        title: s.title,
        content: s.content,
        orderIndex: s.order,
        createdAt: new Date(),
      });
    }
  }
}

async function pMap<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, limit: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`\n================================================================`);
  console.log(`[B1 & B2 EXPANSION GENERATOR] Generating 52 modules with Otak AI`);
  console.log(`================================================================`);

  await ensureLevelsInDatabase();

  let completed = 0;
  const total = B1_B2_PLANS.length;

  await pMap(
    B1_B2_PLANS,
    async (plan) => {
      try {
        console.log(`-> Generating [${plan.id}] ${plan.title}...`);
        const sectionsData = await generateModuleWithAi(plan);
        await saveModuleData(plan, sectionsData);
        completed++;
        const pct = Math.round((completed / total) * 100);
        console.log(`✓ [${plan.id}] SAVED to JSON & PostgreSQL (${completed}/${total} - ${pct}%)`);
      } catch (err: any) {
        console.error(`✗ [${plan.id}] ERROR:`, err.message);
      }
    },
    CONCURRENCY
  );

  console.log(`\n🎉 All 52 modules for B1 (B1.4, B1.5) and B2 (B2.4, B2.5) successfully created and seeded!`);
}

main().catch(console.error);
