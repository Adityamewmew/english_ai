import fs from "fs";
import path from "path";
import { OmniRouteClient } from "./omniroute-client";

interface SubModuleData {
  id: string;
  moduleId: string;
  skillType: string;
  title: string;
  orderIndex: number;
  sections: any[];
  [key: string]: any;
}

interface PilotModuleFile {
  module: {
    id: string;
    levelId: string;
    title: string;
    cefr: string;
    group: string;
    objective: string;
    complexity: string;
    estimatedMinutes: number;
    isExam: boolean;
    passingScore: number;
    orderIndex: number;
  };
  subModules: SubModuleData[];
}

const client = new OmniRouteClient({
  defaultModel: "antigravity/claude-opus-4-6-thinking",
});

async function translateSubModule(sub: SubModuleData): Promise<SubModuleData> {
  const system = `You are an expert Cambridge and Oxford CEFR A1 English curriculum specialist.
You will receive a single submodule JSON object.
Translate ALL Indonesian text into clear, natural, and encouraging CEFR A1 English.
This includes:
- 'title' and 'theme' (make them natural English)
- 'summary' in theory sections
- 'learningObjectives'
- 'linguisticTarget' (grammar, vocabulary, readingStrategy)
- 'contextWarmup' (prompt, options, explanation)
- 'rules' and 'commonTrap' (trapTitle, explanation, wrong, correct)
- 'grammarFormulas' (role descriptions like 'First Person (Singular)')
- 'instructions' and 'explanations' in all drills, challenges, and quizzes
- 'hints' and 'criteria'
- 'scenarioContext', 'characterRole', 'callTopic', 'audioPrompt'
- 'questions' and 'options' in quiz sections

CRITICAL MANDATE:
The ONLY fields that MUST REMAIN in Indonesian are:
1. 'meaning' (Indonesian translation / definition of words and phrases)
2. 'translation' (Indonesian translation of dialogue lines and sample sentences)
3. 'id' property in sampleSentences where it represents the Indonesian translation

DO NOT modify any IDs, numeric scores, arrays lengths, or schema keys.
Return ONLY valid raw JSON with no markdown wrapping.`;

  const user = JSON.stringify(sub);
  const result = await client.generateJson<SubModuleData>(system, user);
  return result;
}

export async function translateModuleToEnglish(unitId: string): Promise<void> {
  const rootDir = process.cwd();
  const filePath = path.join(rootDir, `data/pilot_modules/${unitId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Pilot module file not found at ${filePath}`);
  }

  console.log(`\n======================================================`);
  console.log(`🌍 Translating ${unitId} to 100% English (except meanings/translations)...`);
  console.log(`======================================================`);

  const raw = fs.readFileSync(filePath, "utf8");
  const moduleFile = JSON.parse(raw) as PilotModuleFile;

  // Translate module objective if Indonesian
  if (unitId === "A1.1-M02") {
    moduleFile.module.objective =
      "Express feelings using adjectives, form negative sentences with 'to be', ask simple questions, and express likes or dislikes with accurate sentence structure.";
  }

  const translatedSubmodules: SubModuleData[] = [];

  for (let i = 0; i < moduleFile.subModules.length; i++) {
    const sub = moduleFile.subModules[i];
    console.log(`\n[${i + 1}/${moduleFile.subModules.length}] 🔄 Translating ${sub.skillType} submodule (${sub.id})...`);
    const t0 = Date.now();
    try {
      const translated = await translateSubModule(sub);
      translatedSubmodules.push(translated);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ✅ ${sub.skillType} translated in ${elapsed}s`);
    } catch (err: any) {
      console.error(`  ❌ Error translating ${sub.skillType}:`, err.message);
      translatedSubmodules.push(sub);
    }
  }

  moduleFile.subModules = translatedSubmodules;

  // Save backup and write updated
  const backupPath = path.join(rootDir, `data/pilot_modules/${unitId}.original.json`);
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, raw, "utf8");
  }

  fs.writeFileSync(filePath, JSON.stringify(moduleFile, null, 2), "utf8");
  console.log(`\n💾 Saved updated ${unitId}.json to ${filePath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const targetId = args[0] || "A1.1-M01";

  if (targetId === "all") {
    await translateModuleToEnglish("A1.1-M01");
    await translateModuleToEnglish("A1.1-M02");
  } else {
    await translateModuleToEnglish(targetId);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Translation script failed:", err);
    process.exit(1);
  });
}
