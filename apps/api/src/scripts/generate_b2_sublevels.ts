import fs from "fs";
import path from "path";
import {
  ModuleMeta,
  B2_1_EXAM_META,
  B2_2_SYLLABUS,
  B2_3_SYLLABUS,
} from "./b2_syllabus";

const PROXY_URL =
  (process.env.AI_BASE_URL || "http://localhost:20128/v1").replace(/\/+$/, "") +
  "/chat/completions";
const API_KEY = process.env.AI_API_KEY || "sk-96f2316f84884524-2cee23-3c70805b";
const MODEL = "kr/claude-sonnet-4.5";

const BASE_DIR = path.resolve(import.meta.dir, "../../../../");
const OUT_DIR = path.join(BASE_DIR, "data/client_curriculum/b2");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function callAI(prompt: string): Promise<any> {
  const maxRetries = 3;
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
                "You are an expert Cambridge English ELT curriculum author. Output ONLY valid, parseable JSON conforming strictly to the requested schema. No markdown formatting, no surrounding text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI proxy error ${response.status}: ${await response.text()}`);
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
      await new Promise((r) => setTimeout(r, 2000));
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

  const questionCount = meta.isExam ? 16 : 5;
  const prompt = `
Create an authentic, high-quality Cambridge-style English learning module for:
Module ID: ${meta.id}
Level ID: ${meta.levelId}
CEFR: B2
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
  "cefr": "B2",
  "group": "${meta.group}",
  "objective": "${meta.objective}",
  "complexity": "${meta.isExam ? "deep" : "medium"}",
  "estimatedMinutes": ${meta.isExam ? 40 : 25},
  "isExam": ${meta.isExam},
  "passingScore": ${meta.passingScore},
  "orderIndex": ${meta.orderIndex},
  "sections": {
    "theory": {
      "summary": "Clear, engaging explanation in Indonesian explaining the key concept with practical B2 applications.",
      "rules": [
        "Rule 1 with formula and pattern",
        "Rule 2 with formula and pattern",
        "Rule 3 with example sentences"
      ],
      "commonTrap": {
        "trapTitle": "Peringatan Kesalahan Umum",
        "explanation": "Penjelasan jebakan kesalahan yang sering dilakukan siswa level B2.",
        "wrong": "Contoh kalimat salah",
        "correct": "Contoh kalimat yang benar dan baku"
      }
    },
    "vocab": [
      {
        "word": "english word",
        "ipa": "/.../",
        "meaning": "arti bahasa indonesia",
        "collocation": "contoh kalimat penggunaan yang natural di dunia nyata"
      }
    ],
    "dialogue": {
      "context": "Deskripsi situasi percakapan dalam bahasa Indonesia.",
      "lines": [
        {
          "speaker": "Person A",
          "text": "English dialogue line.",
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
- vocab: exactly 10 high-value B2 vocabulary items with accurate IPA.
- dialogue: 6 to 10 alternating lines between 2 people.
- speakingLab: 6 to 8 realistic roleplay turns.
- quiz: exactly ${questionCount} questions.
${
  meta.isExam
    ? `Since this is a comprehensive 4-Skills Exam, divide the 16 quiz questions equally into 4 categories:
  - 4 questions prefixed with "[Listening Comprehension]" including an audio transcript context in the question.
  - 4 questions prefixed with "[Reading Comprehension]" including a short reading passage context.
  - 4 questions prefixed with "[Writing & Grammar]" testing sentence restructuring, syntax precision, and advanced grammar.
  - 4 questions prefixed with "[Speaking & Situational Dialogue]" testing persuasive oral discourse and diplomatic debate responses.`
    : ""
}
All explanations and instructions must be in natural Indonesian.
`;

  const moduleData = await callAI(prompt);
  fs.writeFileSync(targetFile, JSON.stringify(moduleData, null, 2), "utf-8");
  console.log(`✓ Saved ${meta.id} -> ${targetFile}`);
  return moduleData;
}

function prepareB2_1Modules(): any[] {
  console.log("Memproses 12 Unit Autentik Think 3 menjadi B2.1-M01 s/d B2.1-M12...");
  const b2_1Modules: any[] = [];

  for (let i = 1; i <= 12; i++) {
    const pad = i.toString().padStart(2, "0");
    const sourceFile = path.join(BASE_DIR, `data/client_curriculum/B2-M${pad}.json`);
    const targetFile = path.join(OUT_DIR, `B2.1-M${pad}.json`);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`File sumber ${sourceFile} tidak ditemukan!`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));
    data.id = `B2.1-M${pad}`;
    data.levelId = "B2.1";
    data.cefr = "B2";
    data.group = "B2.1 - Vantage Foundations";
    data.orderIndex = i;
    data.isExam = false;
    data.passingScore = 70;

    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
    b2_1Modules.push(data);
  }

  return b2_1Modules;
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
  console.log("=== START GENERATION KURIKULUM B2 (B2.1, B2.2, B2.3) ===");

  // 1. B2.1
  const b2_1Modules = prepareB2_1Modules();
  const b2_1Exam = await generateModule(B2_1_EXAM_META);
  b2_1Modules.push(b2_1Exam);

  // 2. B2.2
  console.log("\nMemproses 13 Modul untuk Sub-Level B2.2...");
  const b2_2Modules = await mapConcurrent(B2_2_SYLLABUS, 3, (meta) => generateModule(meta));

  // 3. B2.3
  console.log("\nMemproses 13 Modul untuk Sub-Level B2.3...");
  const b2_3Modules = await mapConcurrent(B2_3_SYLLABUS, 3, (meta) => generateModule(meta));

  // 4. Save Combined File
  const allB2Modules = [...b2_1Modules, ...b2_2Modules, ...b2_3Modules];
  const combinedPath = path.join(BASE_DIR, "data/client_curriculum/level_b2_all_sublevels.json");
  fs.writeFileSync(
    combinedPath,
    JSON.stringify(
      {
        level: {
          id: "B2",
          cefr: "B2",
          title: "B2 - Upper-Intermediate English",
          subLevels: ["B2.1", "B2.2", "B2.3"],
        },
        totalModules: allB2Modules.length,
        modules: allB2Modules,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\n🎉 SUKSES! Total ${allB2Modules.length} Modul B2 tersimpan di ${combinedPath}`);
  console.log(`- B2.1: ${b2_1Modules.length} modul (M01-M13)`);
  console.log(`- B2.2: ${b2_2Modules.length} modul (M01-M13)`);
  console.log(`- B2.3: ${b2_3Modules.length} modul (M01-M13)`);
}

run().catch((e) => {
  console.error("FATAL ERROR:", e);
  process.exit(1);
});
