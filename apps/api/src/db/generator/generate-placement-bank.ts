import fs from "fs";
import path from "path";
import { db } from "../index";
import { itemBank } from "../schema/placement";
import { OmniRouteClient } from "./omniroute-client";

interface ItemRecord {
  id: string;
  skill: "mcq" | "listening" | "writing" | "speaking";
  cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  type: "MCQ" | "PROMPT";
  question: string;
  options: string[] | null;
  answer: string;
  audioScript?: string | null;
  audioUrl?: string | null;
  explanation: string;
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export async function generateAndSeedPlacementBank() {
  console.log("======================================================");
  console.log("🚀 STARTING CEFR PLACEMENT QUESTION BANK GENERATOR");
  console.log("🎯 Targets: 150 MCQ + 100 Listening + 100 Writing + 50 Speaking = 400 Total Items");
  console.log("======================================================\n");

  const client = new OmniRouteClient();
  const allItems: ItemRecord[] = [];

  // 1. Clear old data from database as requested
  console.log("🗑️ Clearing existing item_bank table in Dokploy DB...");
  await db.delete(itemBank);
  console.log("✅ Existing item_bank data cleared successfully.\n");

  // Helper to insert a batch directly to DB
  async function insertBatch(items: ItemRecord[]) {
    if (items.length === 0) return;
    await db.insert(itemBank).values(
      items.map((it) => ({
        id: it.id,
        skill: it.skill,
        cefr: it.cefr,
        type: it.type,
        question: it.question,
        options: it.options,
        answer: it.answer,
        audioScript: it.audioScript || null,
        audioUrl: it.audioUrl || null,
        explanation: it.explanation,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    allItems.push(...items);
    console.log(`  💾 Seeded ${items.length} items to DB (Running total: ${allItems.length}/400)`);
  }

  // --- PART 1: 150 MCQ (25 per level A1-C2) ---
  console.log("\n======================================================");
  console.log("📚 [1/4] GENERATING 150 MULTIPLE CHOICE QUESTIONS (MCQ)");
  console.log("======================================================");

  for (const level of CEFR_LEVELS) {
    console.log(`\n⏳ Generating 25 MCQ for Level ${level}...`);
    const systemPrompt = `You are a Senior Cambridge English Exam Developer.
Create authentic, CEFR-calibrated Multiple Choice Questions testing grammar, vocabulary, collocations, and reading comprehension.
STRICT ANTI-SLOP RULES:
- Never use em dashes (—). Use parentheses or commas.
- Avoid generic AI buzzwords (e.g. delve, pivotal, testament, vibrant, multifaceted).
- Use natural real-world English contexts (travel, work, science, daily life, culture, technology).
- 4 options per question: exactly 1 correct answer and 3 plausible distractors.
Return strictly a JSON array of 25 objects:
[
  {
    "question": "Sentence with a blank (e.g. 'She _____ to London twice this year.') or short context question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Exact string of correct option",
    "explanation": "Clear explanation of grammar rule or meaning in Indonesian"
  }
]`;

    const userPrompt = `Generate exactly 25 rigorous CEFR ${level} English multiple choice questions.
Level target: ${level}.
Ensure difficulty matches CEFR ${level} precisely:
${
  level === "A1"
    ? "Present simple, to be, have got, daily routines, basic prepositions (in/at/on), family."
    : level === "A2"
    ? "Past simple, irregular verbs, comparatives/superlatives, going to, countables/uncountables, basic connectors."
    : level === "B1"
    ? "Present perfect vs past simple, used to, conditionals 1 & 2, passive voice simple, modal verbs of deduction."
    : level === "B2"
    ? "Third conditional, mixed conditionals, relative clauses, narrative tenses, reporting verbs, phrasal verbs."
    : level === "C1"
    ? "Inversion, cleft sentences, subjunctive, sophisticated collocations, participle clauses, discourse markers."
    : "Subtle semantic distinctions, idiomatic nuances, literary/academic registers, rare prepositions, complex dialectics."
}`;

    const items = await client.generateJson<any[]>(systemPrompt, userPrompt);
    const formatted: ItemRecord[] = (items || []).map((q, idx) => ({
      id: `mcq-${level.toLowerCase()}-${String(idx + 1).padStart(2, "0")}`,
      skill: "mcq",
      cefr: level,
      type: "MCQ",
      question: q.question,
      options: q.options,
      answer: q.answer,
      audioScript: null,
      audioUrl: null,
      explanation: q.explanation || "Jawaban yang benar sesuai kaidah tata bahasa Inggris.",
    }));

    await insertBatch(formatted);
  }

  // --- PART 2: 100 LISTENING QUESTIONS ---
  console.log("\n======================================================");
  console.log("🎧 [2/4] GENERATING 100 LISTENING COMPREHENSION QUESTIONS");
  console.log("======================================================");

  // Distribution: A1: 17, A2: 17, B1: 17, B2: 17, C1: 16, C2: 16 (Total: 100)
  for (const level of CEFR_LEVELS) {
    const count = level === "C1" || level === "C2" ? 16 : 17;
    console.log(`\n⏳ Generating ${count} Listening questions for Level ${level}...`);

    const systemPrompt = `You are a Cambridge English Listening Exam Developer.
Create authentic, natural spoken English dialogues or announcements with comprehension questions.
STRICT RULES:
- audioScript: 2-4 lines of natural dialogue or a short spoken announcement/monologue.
- question: clear comprehension or inference question based on what was said.
- options: 4 distinct choices.
- answer: exact string of correct choice.
- No em dashes (—). No buzzwords.
Return strictly a JSON array of ${count} objects:
[
  {
    "audioScript": "Speaker A: ... Speaker B: ...",
    "question": "What is the speaker deciding to do?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Exact string of correct option",
    "explanation": "Penjelasan ringkas dalam Bahasa Indonesia berdasarkan audioScript."
  }
]`;

    const userPrompt = `Generate exactly ${count} CEFR ${level} listening comprehension questions.
Level target: ${level}.
Keep audioScript natural, engaging, and appropriate for ${level} spoken rhythm.`;

    const items = await client.generateJson<any[]>(systemPrompt, userPrompt);
    const formatted: ItemRecord[] = (items || []).map((q, idx) => ({
      id: `lis-${level.toLowerCase()}-${String(idx + 1).padStart(2, "0")}`,
      skill: "listening",
      cefr: level,
      type: "MCQ",
      question: q.question,
      options: q.options,
      answer: q.answer,
      audioScript: q.audioScript,
      audioUrl: null,
      explanation: q.explanation || "Jawaban didasarkan pada informasi dalam dialog audio.",
    }));

    await insertBatch(formatted);
  }

  // --- PART 3: 100 WRITING PROMPTS ---
  console.log("\n======================================================");
  console.log("✍️ [3/4] GENERATING 100 WRITING PROMPTS");
  console.log("======================================================");

  // Distribution: A1: 17, A2: 17, B1: 17, B2: 17, C1: 16, C2: 16 (Total: 100)
  for (const level of CEFR_LEVELS) {
    const count = level === "C1" || level === "C2" ? 16 : 17;
    console.log(`\n⏳ Generating ${count} Writing prompts for Level ${level}...`);

    const systemPrompt = `You are a Cambridge English Writing Examiner.
Create clear, engaging writing prompts calibrated for CEFR ${level}.
STRICT RULES:
- question: prompt instruction stating the context, audience, and expected length in words (e.g. A1: 20-30 words, B1: 60-80 words, C1: 100-150 words).
- answer: A high-scoring sample model response demonstrating ${level} mastery.
- explanation: Essential criteria, recommended transition words, or grammatical structures required for full marks in Indonesian.
- No em dashes (—). No buzzwords.
Return strictly a JSON array of ${count} objects:
[
  {
    "question": "Writing task instructions with situational context and target word count",
    "answer": "Exemplary model response",
    "explanation": "Kriteria penilaian dan kosakata kunci yang dinilai"
  }
]`;

    const userPrompt = `Generate exactly ${count} CEFR ${level} writing prompts.
Topics should range from practical everyday emails and messages to opinion pieces, essays, and reports matching CEFR ${level}.`;

    const items = await client.generateJson<any[]>(systemPrompt, userPrompt);
    const formatted: ItemRecord[] = (items || []).map((q, idx) => ({
      id: `wri-${level.toLowerCase()}-${String(idx + 1).padStart(2, "0")}`,
      skill: "writing",
      cefr: level,
      type: "PROMPT",
      question: q.question,
      options: [],
      answer: q.answer,
      audioScript: null,
      audioUrl: null,
      explanation: q.explanation || "Dinilai berdasarkan kesesuaian tata bahasa, kosakata, dan kejelasan ide.",
    }));

    await insertBatch(formatted);
  }

  // --- PART 4: 50 SPEAKING PROMPTS ---
  console.log("\n======================================================");
  console.log("🎙️ [4/4] GENERATING 50 SPEAKING PROMPTS");
  console.log("======================================================");

  // Distribution: A1: 9, A2: 9, B1: 8, B2: 8, C1: 8, C2: 8 (Total: 50)
  for (const level of CEFR_LEVELS) {
    const count = level === "A1" || level === "A2" ? 9 : 8;
    console.log(`\n⏳ Generating ${count} Speaking prompts for Level ${level}...`);

    const systemPrompt = `You are an IELTS and CEFR Speaking Examiner.
Create clear, prompt-guided speaking tasks calibrated for CEFR ${level}.
STRICT RULES:
- question: Clear speaking prompt with bullet points outlining what to include, and recommended speaking duration (e.g. 30-60 seconds).
- answer: Key talking points or sample spoken monologue demonstrating natural fluency.
- explanation: Assessment criteria focusing on pronunciation, fluency, grammar range, and lexical resource in Indonesian.
- No em dashes (—). No buzzwords.
Return strictly a JSON array of ${count} objects:
[
  {
    "question": "Speaking prompt with guided questions (e.g. 'Describe your favorite weekend routine. Say: where you go, who you spend time with, and why you enjoy it. Speak for 45 seconds.')",
    "answer": "Sample transcript of an exemplary spoken response",
    "explanation": "Kriteria penilaian kelancaran, kosakata, dan ketepatan tata bahasa"
  }
]`;

    const userPrompt = `Generate exactly ${count} CEFR ${level} speaking prompts.
Cover daily descriptions (A1-A2), narrative & personal experiences (B1-B2), to abstract argumentation and debate (C1-C2).`;

    const items = await client.generateJson<any[]>(systemPrompt, userPrompt);
    const formatted: ItemRecord[] = (items || []).map((q, idx) => ({
      id: `spk-${level.toLowerCase()}-${String(idx + 1).padStart(2, "0")}`,
      skill: "speaking",
      cefr: level,
      type: "PROMPT",
      question: q.question,
      options: [],
      answer: q.answer,
      audioScript: null,
      audioUrl: null,
      explanation: q.explanation || "Dinilai berdasarkan kelancaran, pengucapan, dan rentang kosakata.",
    }));

    await insertBatch(formatted);
  }

  // Backup to JSON file
  const backupPath = path.resolve(process.cwd(), "../../data/placement_bank.json");
  const localBackupPath = path.resolve(process.cwd(), "data/placement_bank.json");
  const targetPath = fs.existsSync(path.dirname(backupPath)) ? backupPath : localBackupPath;

  fs.writeFileSync(targetPath, JSON.stringify(allItems, null, 2), "utf8");
  console.log(`\n📁 Backup saved to: ${targetPath}`);

  console.log("\n======================================================");
  console.log(`🏁 FINISHED GENERATING ALL ${allItems.length} PLACEMENT ITEMS!`);
  console.log(`  - MCQ:       ${allItems.filter((x) => x.skill === "mcq").length}`);
  console.log(`  - Listening: ${allItems.filter((x) => x.skill === "listening").length}`);
  console.log(`  - Writing:   ${allItems.filter((x) => x.skill === "writing").length}`);
  console.log(`  - Speaking:  ${allItems.filter((x) => x.skill === "speaking").length}`);
  console.log("======================================================");
}

if (import.meta.main) {
  generateAndSeedPlacementBank()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Fatal Generator Error:", err);
      process.exit(1);
    });
}
