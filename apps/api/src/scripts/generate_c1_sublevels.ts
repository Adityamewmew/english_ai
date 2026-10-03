import fs from "fs";
import path from "path";
import {
  ModuleMeta,
  C1_1_EXAM_META,
  C1_2_SYLLABUS,
  C1_3_SYLLABUS,
} from "./c1_syllabus";

const PROXY_URL =
  (process.env.AI_BASE_URL || "http://localhost:20128/v1").replace(/\/+$/, "") +
  "/chat/completions";
const API_KEY = process.env.AI_API_KEY || "sk-96f2316f84884524-2cee23-3c70805b";
const MODEL = "kr/claude-sonnet-4.5";

const BASE_DIR = path.resolve(import.meta.dir, "../../../../");
const OUT_DIR = path.join(BASE_DIR, "data/client_curriculum/c1");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function callAI(prompt: string): Promise<any> {
  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are an expert Cambridge English ELT curriculum author specializing in CEFR C1 Advanced English. Output ONLY valid, parseable JSON conforming strictly to the requested schema. No markdown formatting, no surrounding text.",
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
        const sleepMs = isRateLimit ? Math.max(5000, attempt * 4000) : 3000;
        console.warn(`[Attempt ${attempt}/${maxRetries}] HTTP ${response.status} (${isRateLimit ? "Rate limited" : "Error"}): ${errorText.slice(0, 100)}. Waiting ${sleepMs}ms...`);
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
      console.warn(`[Attempt ${attempt}/${maxRetries}] AI call failed: ${e.message}`);
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
Create an authentic, high-quality Cambridge C1 Advanced English learning module for:
Module ID: ${meta.id}
Level ID: ${meta.levelId}
CEFR: C1
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
  "cefr": "C1",
  "group": "${meta.group}",
  "objective": "${meta.objective}",
  "complexity": "${meta.isExam ? "deep" : "high"}",
  "estimatedMinutes": ${meta.isExam ? 45 : 30},
  "isExam": ${meta.isExam},
  "passingScore": ${meta.passingScore},
  "orderIndex": ${meta.orderIndex},
  "sections": {
    "theory": {
      "summary": "Clear, engaging explanation in Indonesian explaining the key concept with practical C1 academic and professional applications.",
      "rules": [
        "Rule 1 with formal pattern and formula",
        "Rule 2 with formal pattern and formula",
        "Rule 3 with nuanced C1 example sentences"
      ],
      "commonTrap": {
        "trapTitle": "Peringatan Kesalahan Umum Tingkat Mahir",
        "explanation": "Penjelasan jebakan sintaksis atau pragmatik yang sering dilakukan siswa level C1.",
        "wrong": "Contoh kalimat salah atau kurang tepat secara register",
        "correct": "Contoh kalimat baku berstandar Cambridge C1"
      }
    },
    "vocab": [
      {
        "word": "c1 advanced word",
        "ipa": "/.../",
        "meaning": "arti bahasa indonesia yang akurat",
        "collocation": "contoh kalimat penggunaan nyata berbobot tinggi"
      }
    ],
    "dialogue": {
      "context": "Deskripsi situasi percakapan profesional/akademis dalam bahasa Indonesia.",
      "lines": [
        {
          "speaker": "Person A",
          "text": "English dialogue line demonstrating advanced register.",
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
        "explanation": "Penjelasan rinci mengapa jawaban tersebut benar dalam bahasa Indonesia."
      }
    ]
  }
}

Requirements:
- vocab: exactly 10 sophisticated C1 vocabulary items with accurate IPA.
- dialogue: 8 to 12 alternating lines between 2 speakers with sophisticated discussion.
- speakingLab: 6 to 8 realistic roleplay turns testing nuanced spoken English.
- quiz: exactly ${questionCount} questions.
${
  meta.isExam
    ? `Since this is a comprehensive 4-Skills Exam, divide the 16 quiz questions equally into 4 categories:
  - 4 questions prefixed with "[Listening Comprehension]" including an audio transcript context in the question.
  - 4 questions prefixed with "[Reading Comprehension]" including an academic/analytical reading passage context.
  - 4 questions prefixed with "[Writing & Grammar]" testing complex syntax, nominalisation, subjunctive, and hedging.
  - 4 questions prefixed with "[Speaking & Situational Dialogue]" testing diplomatic negotiation and spontaneous argumentation.`
    : ""
}
All explanations and instructions must be in natural, professional Indonesian.
`;

  const moduleData = await callAI(prompt);
  fs.writeFileSync(targetFile, JSON.stringify(moduleData, null, 2), "utf-8");
  console.log(`✓ Saved ${meta.id} -> ${targetFile}`);
  return moduleData;
}

function prepareC1_1Modules(): any[] {
  console.log("Memproses 12 Unit Autentik Think 4 menjadi C1.1-M01 s/d C1.1-M12...");
  const c1_1Modules: any[] = [];

  for (let i = 1; i <= 12; i++) {
    const pad = i.toString().padStart(2, "0");
    const sourceFile = path.join(BASE_DIR, `data/client_curriculum/C1-M${pad}.json`);
    const targetFile = path.join(OUT_DIR, `C1.1-M${pad}.json`);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`File sumber ${sourceFile} tidak ditemukan!`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));
    data.id = `C1.1-M${pad}`;
    data.levelId = "C1.1";
    data.cefr = "C1";
    data.group = "C1.1 - Advanced Academic & Operational Fluency";
    data.orderIndex = i;
    data.isExam = false;
    data.passingScore = 70;

    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
    c1_1Modules.push(data);
  }

  return c1_1Modules;
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
  console.log("=== START GENERATION KURIKULUM C1 (C1.1, C1.2, C1.3) ===");

  // 1. C1.1
  const c1_1Modules = prepareC1_1Modules();
  const c1_1Exam = await generateModule(C1_1_EXAM_META);
  c1_1Modules.push(c1_1Exam);

  // 2. C1.2
  console.log("\nMemproses 13 Modul untuk Sub-Level C1.2...");
  const c1_2Modules = await mapConcurrent(C1_2_SYLLABUS, 2, (meta) => generateModule(meta));

  // 3. C1.3
  console.log("\nMemproses 13 Modul untuk Sub-Level C1.3...");
  const c1_3Modules = await mapConcurrent(C1_3_SYLLABUS, 2, (meta) => generateModule(meta));

  // 4. Save Combined File
  const allC1Modules = [...c1_1Modules, ...c1_2Modules, ...c1_3Modules];
  const combinedPath = path.join(BASE_DIR, "data/client_curriculum/level_c1_all_sublevels.json");
  fs.writeFileSync(
    combinedPath,
    JSON.stringify(
      {
        level: {
          id: "C1",
          cefr: "C1",
          title: "C1 - Advanced English",
          subLevels: ["C1.1", "C1.2", "C1.3"],
        },
        totalModules: allC1Modules.length,
        modules: allC1Modules,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\n🎉 SUKSES! Total ${allC1Modules.length} Modul C1 tersimpan di ${combinedPath}`);
  console.log(`- C1.1: ${c1_1Modules.length} modul (M01-M13)`);
  console.log(`- C1.2: ${c1_2Modules.length} modul (M01-M13)`);
  console.log(`- C1.3: ${c1_3Modules.length} modul (M01-M13)`);
}

run().catch((e) => {
  console.error("FATAL ERROR C1:", e);
  process.exit(1);
});
