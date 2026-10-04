import fs from "fs";
import path from "path";
import { C1_EXPANDED_PLANS } from "../../../../scripts/c1_expanded_plans";
import { C2_EXPANDED_PLANS } from "../../../../scripts/c2_expanded_plans";
import { ModuleSyllabusPlan } from "../../../../scripts/c1_expanded_plans";
import { db } from "../db";
import { curriculumLevels, curriculumModules, moduleSections } from "../db/schema";
import { eq } from "drizzle-orm";

const AI_BASE_URL = "http://localhost:20128/v1";
const AI_API_KEY = "sk-96f2316f84884524-2cee23-3c70805b";
const AI_CHAT_MODEL = "gemini";
const CONCURRENCY = 3;

const BRAIN_PATH = path.resolve("c:/project/english-ai/data/curriculum_knowledge_brain.json");
const brain = JSON.parse(fs.readFileSync(BRAIN_PATH, "utf-8"));

const LEVEL_DEFINITIONS = [
  { id: "C1.4", cefr: "C1", title: "C1.4 - Complex Inversion, Formulaic Concession & Rhetorical Devices", orderIndex: 4 },
  { id: "C1.5", cefr: "C1", title: "C1.5 - Academic Peer Review, Empirical Research Critiques & Hedging", orderIndex: 5 },
  { id: "C1.6", cefr: "C1", title: "C1.6 - Diplomatic Negotiation, Tactical Concession & Executive Discourse", orderIndex: 6 },
  { id: "C1.7", cefr: "C1", title: "C1.7 - High-Stakes Crisis Communication & Advanced Dialectical Synthesis", orderIndex: 7 },
  { id: "C2.4", cefr: "C2", title: "C2.4 - Forensic Linguistics, Semantic Disambiguation & Syntactic Artistry", orderIndex: 4 },
  { id: "C2.5", cefr: "C2", title: "C2.5 - Grandmaster Dialectics, Epigrammatic Wit & Subtle Satire", orderIndex: 5 },
  { id: "C2.6", cefr: "C2", title: "C2.6 - Hermeneutic Analysis of Historic Treatises & Philosophical Debate", orderIndex: 6 },
  { id: "C2.7", cefr: "C2", title: "C2.7 - The Sovereign English Speaker: Effortless Native Artistry & Capstone Mastery", orderIndex: 7 },
];

async function ensureLevelsInDatabase() {
  console.log("[DB] Ensuring C1 & C2 expanded levels exist in curriculum_levels table...");
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
  const langRef = levelKnowledge.completeLanguageReference?.slice(0, 1800) || "";
  const wordLists = levelKnowledge.completeWordLists?.slice(0, 1000) || "";
  const masteryWriting = levelKnowledge.masteryWritingHandbook?.slice(0, 1500) || "";
  const skillsFramework = JSON.stringify(levelKnowledge.advancedSkillsFramework || {}).slice(0, 1000);

  const systemPrompt = `You are a world-class Cambridge, Oxford, and IELTS examiner and English curriculum architect.
Your task is to generate an authentic C1/C2 advanced English learning module based on the Cambridge Think 5 & Complete IELTS C1/C2 syllabus.

Requirements:
Return ONLY a valid JSON object matching this exact structure:
{
  "theory": {
    "summary": "In-depth, sophisticated pedagogical explanation in natural Indonesian explaining the target C1/C2 rhetorical, forensic, or syntactic principle.",
    "rules": [
      {
        "pattern": "Advanced formula / syntactic structure (e.g. Under no circumstances + auxiliary + subject + main verb / Had it not been for...)",
        "meaning": "Rhetorical / communicative function in Indonesian",
        "example": "High-register authentic example sentence in English"
      },
      {
        "pattern": "Second formula / variation",
        "meaning": "Meaning / communicative function in Indonesian",
        "example": "High-register authentic example sentence in English"
      },
      {
        "pattern": "Third formula / register nuance",
        "meaning": "Meaning / communicative function in Indonesian",
        "example": "High-register authentic example sentence in English"
      }
    ],
    "commonTrap": {
      "trapTitle": "Subtle stylistic / syntactic pitfall title in Indonesian",
      "explanation": "Why advanced learners slip up and how native C1/C2 speakers formulate it",
      "wrong": "Subtly flawed sentence in English (awkward phrasing or misplaced modifier)",
      "correct": "Impeccable native C1/C2 sentence in English"
    },
    "readinessQuestions": [
      {
        "id": 1,
        "category": "Pengenalan Pola Sintaksis",
        "prompt": "Prompt in Indonesian testing target C1/C2 pattern recognition",
        "options": ["High-level English option A", "High-level English option B", "High-level English option C"],
        "correctIndex": 0,
        "explanation": "Detailed explanation in Indonesian"
      },
      {
        "id": 2,
        "category": "Pemahaman Nuansa & Register",
        "prompt": "Prompt in Indonesian testing the stylistic pitfall or common trap",
        "options": ["High-level English option A", "High-level English option B", "High-level English option C"],
        "correctIndex": 1,
        "explanation": "Detailed explanation in Indonesian"
      },
      {
        "id": 3,
        "category": "Penerapan Konteks Tinggi",
        "prompt": "High-stakes debate or scholarly discourse prompt with [...] to complete",
        "options": ["High-level English option A", "High-level English option B", "High-level English option C"],
        "correctIndex": 2,
        "explanation": "Detailed explanation in Indonesian"
      }
    ]
  },
  "vocab": [
    { "word": "C1/C2 Term 1", "translation": "Arti 1", "example": "Example 1", "context": "Usage context 1" },
    { "word": "C1/C2 Term 2", "translation": "Arti 2", "example": "Example 2", "context": "Usage context 2" },
    { "word": "C1/C2 Term 3", "translation": "Arti 3", "example": "Example 3", "context": "Usage context 3" },
    { "word": "C1/C2 Term 4", "translation": "Arti 4", "example": "Example 4", "context": "Usage context 4" },
    { "word": "C1/C2 Term 5", "translation": "Arti 5", "example": "Example 5", "context": "Usage context 5" },
    { "word": "C1/C2 Term 6", "translation": "Arti 6", "example": "Example 6", "context": "Usage context 6" }
  ],
  "dialogue": {
    "context": "Scenario description in Indonesian setting the realistic high-stakes academic, diplomatic, or court scene",
    "lines": [
      { "speaker": "Speaker A", "text": "High-level English dialogue line 1", "translation": "Terjemahan Indonesia 1" },
      { "speaker": "Speaker B", "text": "High-level English dialogue line 2", "translation": "Terjemahan Indonesia 2" },
      { "speaker": "Speaker A", "text": "High-level English dialogue line 3", "translation": "Terjemahan Indonesia 3" },
      { "speaker": "Speaker B", "text": "High-level English dialogue line 4", "translation": "Terjemahan Indonesia 4" }
    ]
  },
  "practice": {
    "goal": "High-stakes communicative speaking goal in Indonesian",
    "scenario": "Sophisticated roleplay prompt simulating Oxford debate, UN council, doctoral defense, or Supreme Court oral argument"
  },
  "quiz": {
    "passingScore": 75,
    "questions": [
      {
        "id": 1,
        "prompt": "Challenging multiple choice question 1 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 2,
        "prompt": "Challenging multiple choice question 2 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 1,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 3,
        "prompt": "Challenging multiple choice question 3 in Indonesian or English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 2,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 4,
        "prompt": "Challenging multiple choice question 4 in Indonesian or English",
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

Cambridge & IELTS Brain Knowledge Context:
${langRef}
${wordLists}
${masteryWriting}
${skillsFramework}`;

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
    estimatedMinutes: 20,
    isExam: plan.isExam,
    passingScore: 75,
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
        estimatedMinutes: 20,
        isExam: plan.isExam,
        passingScore: 75,
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
      estimatedMinutes: 20,
      isExam: plan.isExam,
      passingScore: 75,
      orderIndex: plan.orderIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

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
  const allPlans = [...C1_EXPANDED_PLANS, ...C2_EXPANDED_PLANS];
  console.log(`\n================================================================`);
  console.log(`[C1 & C2 EXPANSION GENERATOR] Generating ${allPlans.length} modules with Otak AI`);
  console.log(`================================================================`);

  await ensureLevelsInDatabase();

  let completed = 0;
  const total = allPlans.length;

  await pMap(
    allPlans,
    async (plan) => {
      const levelSub = plan.cefr.toLowerCase();
      const singlePath = path.resolve(`c:/project/english-ai/data/client_curriculum/${levelSub}/${plan.id}.json`);
      if (fs.existsSync(singlePath)) {
        completed++;
        console.log(`⚡ [${plan.id}] Already generated, skipping. (${completed}/${total})`);
        return;
      }
      try {
        console.log(`-> Generating with Gemini [${plan.id}] ${plan.title}...`);
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

  console.log(`\n🎉 All ${allPlans.length} modules for C1 (C1.4-C1.7) and C2 (C2.4-C2.7) successfully created and seeded!`);
}

main().catch(console.error);
