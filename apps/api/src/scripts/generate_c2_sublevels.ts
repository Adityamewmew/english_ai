import fs from "fs";
import path from "path";
import {
  ModuleMeta,
  C2_1_EXAM_META,
  C2_2_SYLLABUS,
  C2_3_SYLLABUS,
} from "./c2_syllabus";

const PROXY_URL =
  (process.env.AI_BASE_URL || "http://localhost:20128/v1").replace(/\/+$/, "") +
  "/chat/completions";
const API_KEY = process.env.AI_API_KEY || "sk-96f2316f84884524-2cee23-3c70805b";
const MODEL = "kr/claude-sonnet-4.5";

const BASE_DIR = path.resolve(import.meta.dir, "../../../../");
const OUT_DIR = path.join(BASE_DIR, "data/client_curriculum/c2");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const MODELS = [
  "kr/claude-sonnet-4.5",
  "kr/claude-sonnet-5",
  "auto/smart",
  "auto/best-chat",
];

async function callAI(prompt: string): Promise<any> {
  const maxRetries = 12;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const currentModel = MODELS[(attempt - 1) % MODELS.length];
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: currentModel,
          temperature: 0.2,
          max_tokens: 8192,
          messages: [
            {
              role: "system",
              content:
                "You are an expert Cambridge English ELT curriculum author specializing in CEFR C2 Proficiency (Mastery). Output ONLY valid, parseable JSON conforming strictly to the requested schema. No markdown formatting, no surrounding text. Ensure your JSON is completely closed and valid.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const isRateLimit = response.status === 429;
        const sleepMs = isRateLimit ? 8000 : 3000;
        console.warn(`[Attempt ${attempt}/${maxRetries} with ${currentModel}] HTTP ${response.status} (${isRateLimit ? "Rate limited" : "Error"}): ${errorText.slice(0, 100)}. Waiting ${sleepMs}ms...`);
        if (attempt === maxRetries) {
          throw new Error(`AI proxy error ${response.status}: ${errorText}`);
        }
        await new Promise((r) => setTimeout(r, sleepMs));
        continue;
      }

      const json = (await response.json()) as any;
      const rawContent = json.choices?.[0]?.message?.content?.trim() || "";
      const cleanContent = rawContent.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

      const firstBrace = cleanContent.indexOf("{");
      const lastBrace = cleanContent.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON object found in response: " + cleanContent.slice(0, 100));
      }

      return JSON.parse(cleanContent.slice(firstBrace, lastBrace + 1));
    } catch (e: any) {
      console.warn(`[Attempt ${attempt}/${maxRetries} with ${currentModel}] AI call failed: ${e.message}`);
      if (attempt === maxRetries) throw e;
      await new Promise((r) => setTimeout(r, 4000 * attempt));
    }
  }
}

async function generateModule(meta: ModuleMeta): Promise<any> {
  const targetFile = path.join(OUT_DIR, `${meta.id}.json`);
  if (fs.existsSync(targetFile)) {
    console.log(`✓ [Existing] ${meta.id}: ${meta.title}`);
    return JSON.parse(fs.readFileSync(targetFile, "utf-8"));
  }

  console.log(`⏳ Generating ${meta.id}: ${meta.title}...`);

  const questionCount = meta.isExam ? 16 : 6;
  const prompt = `
Create an authentic, high-quality Cambridge C2 Proficiency (Mastery) English learning module for:
Module ID: ${meta.id}
Level ID: ${meta.levelId}
CEFR: C2
Order Index: ${meta.orderIndex}
Title: ${meta.title}
Group: ${meta.group}
Objective: ${meta.objective}
Is Exam: ${meta.isExam}
Passing Score: ${meta.passingScore}
Pedagogical Notes: ${meta.promptNotes}

Return a single JSON object with this EXACT structure:
{
  "id": "${meta.id}",
  "levelId": "${meta.levelId}",
  "title": "${meta.title}",
  "cefr": "C2",
  "group": "${meta.group}",
  "objective": "${meta.objective}",
  "complexity": "${meta.isExam ? "deep" : "high"}",
  "estimatedMinutes": ${meta.isExam ? 50 : 35},
  "isExam": ${meta.isExam},
  "passingScore": ${meta.passingScore},
  "orderIndex": ${meta.orderIndex},
  "sections": {
    "theory": {
      "summary": "Clear, profound explanation in Indonesian explaining the key concept with practical C2 native-level applications, stylistic choices, and philosophical depth.",
      "rules": [
        "Rule 1 with structural nuance and stylistic impact",
        "Rule 2 with syntactic variation and formula",
        "Rule 3 with masterful literary or forensic examples"
      ],
      "commonTrap": {
        "trapTitle": "Peringatan Nuansa dan Ketepatan Pragmatik C2",
        "explanation": "Penjelasan jebakan makna tersirat (subtext) atau pergeseran konotasi yang membedakan penutur mahir biasa dengan grandmaster C2.",
        "wrong": "Contoh kalimat yang terdengar kaku, klise, atau secara register kurang luwes",
        "correct": "Contoh kalimat berbobot sastra atau diplomasi Cambridge C2 Proficiency"
      }
    },
    "vocab": [
      {
        "word": "c2 grandmaster word",
        "ipa": "/.../",
        "meaning": "arti bahasa indonesia yang mendalam dan presisi",
        "collocation": "contoh kalimat penggunaan elegan di dunia nyata"
      }
    ],
    "dialogue": {
      "context": "Deskripsi situasi diskusi intelektual/diplomatik tingkat tinggi dalam bahasa Indonesia.",
      "lines": [
        {
          "speaker": "Person A",
          "text": "English dialogue line demonstrating grandmaster eloquence.",
          "translation": "Terjemahan bahasa Indonesia."
        }
      ]
    },
    "speakingLab": {
      "context": "Deskripsi skenario interaktif bersama Mr. Khoirul (AI Tutor).",
      "roles": ["Mr. Khoirul", "You"],
      "defaultUserRole": "You",
      "turns": [
        {
          "speaker": "Mr. Khoirul",
          "text": "Hello! ..."
        },
        {
          "speaker": "You",
          "text": "Hi! ..."
        }
      ]
    },
    "quiz": [
      {
        "question": "${meta.isExam ? "[Skill Category] Question text with blank ___" : "Question text with blank ___"}",
        "options": ["Option A", "Option B", "Option C"],
        "answer": "Exact matching string of correct option",
        "explanation": "Penjelasan mendalam mengapa jawaban tersebut tepat sesuai kaidah dan nuansa C2 dalam bahasa Indonesia."
      }
    ]
  }
}

Requirements:
- vocab: exactly 10 elite C2 vocabulary items with accurate IPA.
- dialogue: 8 to 12 alternating lines demonstrating effortless eloquence and intellectual debate.
- speakingLab: 6 to 8 realistic roleplay turns testing grandmaster spoken English.
- quiz: exactly ${questionCount} questions.
${
  meta.isExam
    ? `Since this is a comprehensive Cambridge CPE-style 4-Skills Exam, divide the 16 quiz questions equally into 4 categories:
  - 4 questions prefixed with "[Listening Comprehension]" including an intellectual monologue or academic transcript context.
  - 4 questions prefixed with "[Reading Comprehension]" including a dense philosophical, legal, or literary text context.
  - 4 questions prefixed with "[Writing & Grammar]" testing rhetoric, chiasmus, stylistic inversion, and structural precision.
  - 4 questions prefixed with "[Speaking & Situational Dialogue]" testing spontaneous dialectical rebuttal and keynote oratory.`
    : ""
}
All explanations and instructions must be in natural, refined Indonesian.
`;

  const moduleData = await callAI(prompt);
  fs.writeFileSync(targetFile, JSON.stringify(moduleData, null, 2), "utf-8");
  console.log(`✓ Saved ${meta.id} -> ${targetFile}`);
  return moduleData;
}

function prepareC2_1Modules(): any[] {
  console.log("Memproses 12 Unit Autentik Think 5 menjadi C2.1-M01 s/d C2.1-M12...");
  const c2_1Modules: any[] = [];

  for (let i = 1; i <= 12; i++) {
    const pad = i.toString().padStart(2, "0");
    const sourceFile = path.join(BASE_DIR, `data/client_curriculum/C2-M${pad}.json`);
    const targetFile = path.join(OUT_DIR, `C2.1-M${pad}.json`);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`File sumber ${sourceFile} tidak ditemukan!`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));
    data.id = `C2.1-M${pad}`;
    data.levelId = "C2.1";
    data.cefr = "C2";
    data.group = "C2.1 - Mastery Foundations & Rhetorical Wit";
    data.orderIndex = i;
    data.isExam = false;
    data.passingScore = 70;

    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
    c2_1Modules.push(data);
  }

  return c2_1Modules;
}

async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function run() {
  console.log("=== START GENERATION KURIKULUM C2 (C2.1, C2.2, C2.3) ===");

  // 1. C2.1
  const c2_1Modules = prepareC2_1Modules();
  const c2_1Exam = await generateModule(C2_1_EXAM_META);
  c2_1Modules.push(c2_1Exam);

  // 2. C2.2
  console.log("\nMemproses 13 Modul untuk Sub-Level C2.2...");
  const c2_2Modules: any[] = [];
  for (const meta of C2_2_SYLLABUS) {
    const mod = await generateModule(meta);
    c2_2Modules.push(mod);
    await new Promise((r) => setTimeout(r, 1500));
  }

  // 3. C2.3
  console.log("\nMemproses 13 Modul untuk Sub-Level C2.3...");
  const c2_3Modules: any[] = [];
  for (const meta of C2_3_SYLLABUS) {
    const mod = await generateModule(meta);
    c2_3Modules.push(mod);
    await new Promise((r) => setTimeout(r, 1500));
  }

  // 4. Save Combined File
  const allC2Modules = [...c2_1Modules, ...c2_2Modules, ...c2_3Modules];
  const combinedPath = path.join(BASE_DIR, "data/client_curriculum/level_c2_all_sublevels.json");
  fs.writeFileSync(
    combinedPath,
    JSON.stringify(
      {
        level: {
          id: "C2",
          cefr: "C2",
          title: "C2 - Mastery English",
          subLevels: ["C2.1", "C2.2", "C2.3"],
        },
        totalModules: allC2Modules.length,
        modules: allC2Modules,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\n🎉 SUKSES! Total ${allC2Modules.length} Modul C2 tersimpan di ${combinedPath}`);
  console.log(`- C2.1: ${c2_1Modules.length} modul (M01-M13)`);
  console.log(`- C2.2: ${c2_2Modules.length} modul (M01-M13)`);
  console.log(`- C2.3: ${c2_3Modules.length} modul (M01-M13)`);
}

run().catch((e) => {
  console.error("FATAL ERROR C2:", e);
  process.exit(1);
});
