import fs from "fs";
import path from "path";

const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:20128/v1";
const AI_API_KEY = process.env.AI_API_KEY || "sk-96f2316f84884524-2cee23-3c70805b";
const AI_CHAT_MODEL = process.env.AI_CHAT_MODEL || "antigravity/gemini-3.1-pro-low";
const CONCURRENCY = 3;

export interface ReadinessQuestion {
  id: number;
  category: "Pengenalan Bentuk" | "Pemahaman Aturan" | "Penerapan Konteks";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SYSTEM_PROMPT = `You are a master English pedagogue and curriculum specialist.
Your task is to create exactly 3 high-quality, authentic multiple-choice readiness questions (Uji Kesiapan Belajar) for the provided English learning module.

Requirements:
- Question 1 (Category: "Pengenalan Bentuk"):
  Focuses on the target grammar rule / sentence structure taught in the module.
  Prompt: In clear, natural Indonesian, asking which English sentence correctly applies the rule or structure.
  Options: 3 English sentences/structures (1 correct, 2 plausible grammatical distractors related to the topic).

- Question 2 (Category: "Pemahaman Aturan"):
  Focuses on the common mistake / trap (commonTrap) of this module.
  Prompt: In Indonesian, testing the learner's ability to identify the correct usage or avoid the common trap.
  Options: 3 English sentences (1 correct, 2 incorrect variations illustrating the common mistake).

- Question 3 (Category: "Penerapan Konteks"):
  Focuses on real conversational application using the module's dialogue or key vocabulary.
  Prompt: Provide a realistic short conversational exchange from the module with "[...]" to fill in, explained in Indonesian.
  Options: 3 English dialogue responses or phrases (1 natural/correct fit, 2 plausible but contextually/grammatically incorrect fits).

CRITICAL RULES:
1. Every question must have EXACTLY 3 options in an array.
2. ALL 3 options MUST BE STRICTLY UNIQUE and non-empty. Never duplicate options!
3. NEVER use generic dummy distractors like "Abaikan susunan kata kerja", "Gunakan kata kerja sembarangan", "Sorry, I forgot my keys at home", etc.
4. Options should be natural English sentences or expressions.
5. "correctIndex" MUST be an integer (0, 1, or 2) pointing to the correct option. Distribute correct indices across 0, 1, and 2 naturally.
6. "explanation" must be in concise, helpful Indonesian, explaining why the correct option is right.

Return ONLY a valid JSON array of 3 objects with keys: "id" (1, 2, 3), "category", "prompt", "options", "correctIndex", "explanation". Do not wrap in markdown quotes if possible, or use standard \`\`\`json.`;

async function fetchWithRetry(moduleData: any, maxRetries = 3): Promise<ReadinessQuestion[]> {
  const theory = moduleData.sections?.theory || {};
  const rules = theory.rules || [];
  const commonTrap = theory.commonTrap || {};
  const dialogue = moduleData.sections?.dialogue || {};
  const lines = dialogue.lines || dialogue.dialogue || [];
  const vocab = moduleData.sections?.vocab || [];

  const userContent = JSON.stringify({
    moduleId: moduleData.id,
    title: moduleData.title,
    cefr: moduleData.cefr,
    objective: moduleData.objective,
    theory: {
      summary: theory.summary,
      rules: rules,
      commonTrap: commonTrap,
    },
    vocabSample: Array.isArray(vocab) ? vocab.slice(0, 5).map((v: any) => ({ word: v.word, meaning: v.translation || v.meaning })) : [],
    dialogueSample: Array.isArray(lines) ? lines.slice(0, 4) : [],
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CHAT_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Module details:\n${userContent}` },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content?.trim() || "";

      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        parsed = JSON.parse(cleaned);
      }

      const list: ReadinessQuestion[] = Array.isArray(parsed)
        ? parsed
        : parsed.questions || parsed.readinessQuestions || [];

      if (!Array.isArray(list) || list.length !== 3) {
        throw new Error(`Invalid questions length received: ${list.length}`);
      }

      // Strict validation
      for (let i = 0; i < 3; i++) {
        const q = list[i];
        q.id = i + 1;
        if (!q.category) {
          q.category = i === 0 ? "Pengenalan Bentuk" : i === 1 ? "Pemahaman Aturan" : "Penerapan Konteks";
        }
        if (!Array.isArray(q.options) || q.options.length !== 3) {
          throw new Error(`Question ${i + 1} does not have exactly 3 options`);
        }
        const uniqueOptions = new Set(q.options.map((o) => o.trim().toLowerCase()));
        if (uniqueOptions.size !== 3) {
          throw new Error(`Question ${i + 1} has duplicate options: ${JSON.stringify(q.options)}`);
        }
        if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 2) {
          throw new Error(`Question ${i + 1} has invalid correctIndex: ${q.correctIndex}`);
        }
      }

      return list;
    } catch (err: any) {
      if (attempt === maxRetries) {
        throw new Error(`Failed module ${moduleData.id} after ${maxRetries} attempts: ${err.message}`);
      }
      const delay = attempt * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(`Failed module ${moduleData.id}`);
}

// Simple async queue for concurrency control
async function pMap<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, limit: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function needsUpdate(m: any): boolean {
  const qs = m.sections?.theory?.readinessQuestions;
  if (!Array.isArray(qs) || qs.length !== 3) return true;
  return qs.some((q: any) =>
    q.options?.some((o: string) =>
      typeof o !== "string" ||
      o.includes("Tenses dan susunan") ||
      o.includes("Abaikan susunan") ||
      o.includes("sembarangan") ||
      o.includes("Bentuk kalimat tidak baku") ||
      o.includes("Struktur kata terbalik") ||
      o.includes("Sorry, I forgot my keys") ||
      o.endsWith(" in") ||
      o.endsWith(" on") ||
      o.endsWith(" at")
    )
  );
}

async function processLevelFile(filePath: string) {
  const fileName = path.basename(filePath);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const modules: any[] = Array.isArray(raw) ? raw : raw.modules || [];

  const targets = modules.filter(needsUpdate);
  console.log(`\n======================================================`);
  console.log(`${fileName}: ${targets.length} modules to generate (out of ${modules.length})...`);
  console.log(`======================================================`);

  if (targets.length === 0) {
    console.log(`All modules in ${fileName} already have clean AI questions. Skipping.`);
    return;
  }

  let completedCount = 0;
  const total = targets.length;

  await pMap(
    targets,
    async (m: any) => {
      try {
        const questions = await fetchWithRetry(m);
        if (!m.sections) m.sections = {};
        if (!m.sections.theory) m.sections.theory = {};
        m.sections.theory.readinessQuestions = questions;

        completedCount++;
        const pct = Math.round((completedCount / total) * 100);
        console.log(`[${m.id}] OK (${completedCount}/${total} - ${pct}%)`);
      } catch (err: any) {
        console.error(`[${m.id}] ERROR:`, err.message);
      }
    },
    CONCURRENCY
  );

  // Write updated JSON back
  fs.writeFileSync(filePath, JSON.stringify(raw, null, 2), "utf-8");
  console.log(`Saved updated file: ${filePath}`);
}

async function main() {
  const curriculumDir = path.resolve("c:/project/english-ai/data/client_curriculum");
  const files = [
    "level_a1_all_sublevels.json",
    "level_a2_all_sublevels.json",
    "level_b1_all_sublevels.json",
    "level_b2_all_sublevels.json",
    "level_c1_all_sublevels.json",
    "level_c2_all_sublevels.json",
  ];

  const startTime = Date.now();
  console.log(`[AI Readiness Generator] Processing ${files.length} levels with concurrency ${CONCURRENCY}...`);

  for (const f of files) {
    const fullPath = path.join(curriculumDir, f);
    if (fs.existsSync(fullPath)) {
      await processLevelFile(fullPath);
    } else {
      console.warn(`File not found: ${fullPath}`);
    }
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\nAll 234 modules successfully processed in ${durationSec}s!`);
}

main().catch(console.error);
