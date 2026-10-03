import fs from "fs";
import path from "path";
import {
  ModuleMeta,
  A1_1_EXAM_META,
  A1_2_SYLLABUS,
  A1_3_SYLLABUS,
} from "./a1_syllabus";

const PROXY_URL =
  (process.env.AI_BASE_URL || "http://localhost:20128/v1").replace(/\/+$/, "") +
  "/chat/completions";
const API_KEY = process.env.AI_API_KEY || "sk-96f2316f84884524-2cee23-3c70805b";
const MODEL = "kr/claude-sonnet-4.5";

const BASE_DIR = path.resolve(import.meta.dir, "../../../../");
const OUT_DIR = path.join(BASE_DIR, "data/client_curriculum/a1");
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

      // Find JSON object bounds
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
CEFR: A1
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
  "cefr": "A1",
  "group": "${meta.group}",
  "objective": "${meta.objective}",
  "complexity": "${meta.isExam ? "deep" : "medium"}",
  "estimatedMinutes": ${meta.isExam ? 30 : 20},
  "isExam": ${meta.isExam},
  "passingScore": ${meta.passingScore},
  "orderIndex": ${meta.orderIndex},
  "sections": {
    "theory": {
      "summary": "Clear, encouraging explanation in Indonesian explaining the key concept.",
      "rules": [
        "Rule 1 with formula and pattern",
        "Rule 2 with formula and pattern",
        "Rule 3 with example sentences"
      ],
      "commonTrap": {
        "trapTitle": "Peringatan Kesalahan Umum",
        "explanation": "Penjelasan jebakan kesalahan yang sering dilakukan pemula.",
        "wrong": "Contoh kalimat salah",
        "correct": "Contoh kalimat yang benar dan baku"
      }
    },
    "vocab": [
      {
        "word": "english word",
        "ipa": "/.../",
        "meaning": "arti bahasa indonesia",
        "collocation": "contoh kalimat penggunaan yang natural"
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
- vocab: exactly 10 high-value words with accurate IPA.
- dialogue: 6 to 10 alternating lines between 2 people.
- speakingLab: 6 to 8 realistic roleplay turns.
- quiz: exactly ${questionCount} questions.
${
  meta.isExam
    ? `Since this is a comprehensive 4-Skills Exam, divide the 16 quiz questions equally into 4 categories:
  - 4 questions prefixed with "[Listening Comprehension]" including an audio transcript context in the question.
  - 4 questions prefixed with "[Reading Comprehension]" including a short reading passage context.
  - 4 questions prefixed with "[Writing & Grammar]" testing sentence restructuring and grammar precision.
  - 4 questions prefixed with "[Speaking & Situational Dialogue]" testing polite oral conversational responses.`
    : ""
}
All explanations and instructions must be in natural Indonesian.
`;

  const moduleData = await callAI(prompt);
  fs.writeFileSync(targetFile, JSON.stringify(moduleData, null, 2), "utf-8");
  console.log(`✓ Saved ${meta.id} -> ${targetFile}`);
  return moduleData;
}

function prepareA1_1Modules(): any[] {
  console.log("Memproses 12 Unit Autentik Think Starter menjadi A1.1-M01 s/d A1.1-M12...");
  const a1_1Modules: any[] = [];

  for (let i = 1; i <= 12; i++) {
    const pad = i.toString().padStart(2, "0");
    const sourceFile = path.join(BASE_DIR, `data/client_curriculum/A1-M${pad}.json`);
    const targetFile = path.join(OUT_DIR, `A1.1-M${pad}.json`);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`File sumber ${sourceFile} tidak ditemukan!`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(sourceFile, "utf-8"));
    data.id = `A1.1-M${pad}`;
    data.levelId = "A1.1";
    data.cefr = "A1";
    data.group = "A1.1 - Starter Foundations";
    data.orderIndex = i;
    data.isExam = false;
    data.passingScore = 70;

    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
    a1_1Modules.push(data);
  }

  return a1_1Modules;
}

async function run() {
  console.log("=== START GENERATION KURIKULUM A1 (A1.1, A1.2, A1.3) ===");

  // 1. A1.1
  const a1_1Modules = prepareA1_1Modules();
  const a1_1Exam = await generateModule(A1_1_EXAM_META);
  a1_1Modules.push(a1_1Exam);

  // 2. A1.2
  console.log("\nMemproses 13 Modul untuk Sub-Level A1.2...");
  const a1_2Modules: any[] = [];
  for (const meta of A1_2_SYLLABUS) {
    const mod = await generateModule(meta);
    a1_2Modules.push(mod);
  }

  // 3. A1.3
  console.log("\nMemproses 13 Modul untuk Sub-Level A1.3...");
  const a1_3Modules: any[] = [];
  for (const meta of A1_3_SYLLABUS) {
    const mod = await generateModule(meta);
    a1_3Modules.push(mod);
  }

  // 4. Save Combined File
  const allA1Modules = [...a1_1Modules, ...a1_2Modules, ...a1_3Modules];
  const combinedPath = path.join(BASE_DIR, "data/client_curriculum/level_a1_all_sublevels.json");
  fs.writeFileSync(
    combinedPath,
    JSON.stringify(
      {
        level: {
          id: "A1",
          cefr: "A1",
          title: "A1 - Beginner English",
          subLevels: ["A1.1", "A1.2", "A1.3"],
        },
        totalModules: allA1Modules.length,
        modules: allA1Modules,
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`\n🎉 SUKSES! Total ${allA1Modules.length} Modul A1 tersimpan di ${combinedPath}`);
  console.log(`- A1.1: ${a1_1Modules.length} modul (M01-M13)`);
  console.log(`- A1.2: ${a1_2Modules.length} modul (M01-M13)`);
  console.log(`- A1.3: ${a1_3Modules.length} modul (M01-M13)`);
}

run().catch((e) => {
  console.error("FATAL ERROR:", e);
  process.exit(1);
});
