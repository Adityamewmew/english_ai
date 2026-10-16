import fs from "fs";
import path from "path";
import { OmniRouteClient } from "./omniroute-client";
import {
  UnitBaseData,
  buildReadingPrompt,
  buildListeningPrompt,
  buildWritingPrompt,
  buildSpeakingPrompt,
} from "./submodule-prompts";
import { generateListeningQuestionsForModule } from "./generate-listening-questions";
import { ENGLISH_OBJECTIVES } from "./objectives";

export async function generateSinglePilotModule(
  unitId: string,
  options?: { skipExisting?: boolean; model?: string }
): Promise<string> {
  const rootDir = fs.existsSync(path.resolve(process.cwd(), "data/client_curriculum"))
    ? path.resolve(process.cwd())
    : path.resolve(process.cwd(), "../..");
  const levelDir = unitId.toLowerCase().startsWith("a2") ? "a2" : "a1";
  const clientPath = path.join(rootDir, `data/client_curriculum/${levelDir}/${unitId}.json`);
  const outputPath = path.join(rootDir, `data/pilot_modules/${unitId}.json`);

  if (options?.skipExisting && fs.existsSync(outputPath)) {
    console.log(`⏩ [${unitId}] Output already exists at ${outputPath}, skipping.`);
    return outputPath;
  }

  if (!fs.existsSync(clientPath)) {
    throw new Error(`Base curriculum outline not found for ${unitId} at ${clientPath}`);
  }

  const raw = fs.readFileSync(clientPath, "utf8");
  const unitData = JSON.parse(raw) as UnitBaseData;

  console.log(`\n======================================================`);
  console.log(`🎯 STARTING GENERATION FOR MODULE: ${unitData.id}`);
  console.log(`📖 Title: ${unitData.title}`);
  console.log(`======================================================`);

  const client = new OmniRouteClient({
    defaultModel: options?.model || "antigravity/claude-opus-4-6-thinking",
  });

  // 1. Generate Reading Submodule
  console.log(`\n[1/4] 📚 Generating Reading Submodule...`);
  const readingP = buildReadingPrompt(unitData);
  const readingSubmodule = await client.generateJson<any>(readingP.system, readingP.user);
  console.log(`  ✅ Reading submodule generated with ${readingSubmodule?.sections?.length || 0} sections.`);

  // 2. Generate Listening Submodule
  console.log(`\n[2/4] 🎧 Generating Listening Submodule...`);
  const listeningP = buildListeningPrompt(unitData);
  const listeningSubmodule = await client.generateJson<any>(listeningP.system, listeningP.user);

  // Post-process listening questions to guarantee clean 10 tasks (5 dictation + 5 arrange)
  const lQuestions = generateListeningQuestionsForModule({ subModules: [listeningSubmodule] });
  if (lQuestions && lQuestions.length > 0) {
    const lQuiz = listeningSubmodule?.sections?.find((s: any) => s.sectionType === "quiz");
    if (lQuiz) {
      lQuiz.content = {
        passingScore: 80,
        questions: lQuestions,
        practicumQuestions: lQuestions,
      };
      console.log(`  ✅ Injected ${lQuestions.length} deterministic listening practicum questions (5 dictation + 5 arrange).`);
    }
  }

  // 3. Generate Writing Submodule
  console.log(`\n[3/4] ✍️ Generating Writing Submodule...`);
  const writingP = buildWritingPrompt(unitData);
  const writingSubmodule = await client.generateJson<any>(writingP.system, writingP.user);
  const writingQuestions = writingSubmodule?.sections?.find((s: any) => s.sectionType === "quiz")?.content?.practicumQuestions;
  console.log(`  ✅ Writing submodule generated with ${writingQuestions?.length || 0} practicum questions.`);

  // 4. Generate Speaking Submodule
  console.log(`\n[4/4] 🎙️ Generating Speaking Submodule...`);
  const speakingP = buildSpeakingPrompt(unitData);
  const speakingSubmodule = await client.generateJson<any>(speakingP.system, speakingP.user);
  const speakingQuestions = speakingSubmodule?.sections?.find((s: any) => s.sectionType === "quiz")?.content?.practicumQuestions;
  console.log(`  ✅ Speaking submodule generated with ${speakingQuestions?.length || 0} practicum questions.`);

  const defaultCefr = unitId.toLowerCase().startsWith("a2") ? "A2" : "A1";
  const defaultGroup = unitId.toLowerCase().startsWith("a2") ? `${unitData.levelId} - Elementary Progressions` : `${unitData.levelId} - Starter Foundations`;

  // Assemble full pilot module format
  const fullModuleData = {
    module: {
      id: unitData.id,
      levelId: unitData.levelId || (unitId.toLowerCase().startsWith("a2") ? "A2.1" : "A1.1"),
      title: unitData.title,
      cefr: unitData.cefr || defaultCefr,
      group: unitData.group || defaultGroup,
      objective: ENGLISH_OBJECTIVES[unitData.id] || unitData.objective,
      complexity: "easy",
      estimatedMinutes: 25,
      isExam: false,
      passingScore: 70,
      orderIndex: unitData.orderIndex || 1,
    },
    subModules: [
      readingSubmodule,
      listeningSubmodule,
      writingSubmodule,
      speakingSubmodule,
    ],
  };

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(fullModuleData, null, 2), "utf8");
  console.log(`\n🎉 Successfully saved pilot module to: ${outputPath}`);
  return outputPath;
}
