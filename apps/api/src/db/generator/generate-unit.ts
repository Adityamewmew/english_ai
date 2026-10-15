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

export async function generateSinglePilotModule(
  unitId: string,
  options?: { skipExisting?: boolean; model?: string }
): Promise<string> {
  const rootDir = process.cwd();
  const clientPath = path.join(rootDir, `data/client_curriculum/a1/${unitId}.json`);
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
  console.log(`  ✅ Listening submodule generated with ${listeningSubmodule?.sections?.length || 0} sections.`);

  // 3. Generate Writing Submodule
  console.log(`\n[3/4] ✍️ Generating Writing Submodule...`);
  const writingP = buildWritingPrompt(unitData);
  const writingSubmodule = await client.generateJson<any>(writingP.system, writingP.user);
  console.log(`  ✅ Writing submodule generated with ${writingSubmodule?.sections?.length || 0} sections.`);

  // 4. Generate Speaking Submodule
  console.log(`\n[4/4] 🎙️ Generating Speaking Submodule...`);
  const speakingP = buildSpeakingPrompt(unitData);
  const speakingSubmodule = await client.generateJson<any>(speakingP.system, speakingP.user);
  const quizQuestions = speakingSubmodule?.sections?.find((s: any) => s.sectionType === "quiz")?.content?.practicumQuestions;
  console.log(`  ✅ Speaking submodule generated with ${quizQuestions?.length || 0} practicum questions.`);

const ENGLISH_OBJECTIVES: Record<string, string> = {
  "A1.1-M01": "Introduce yourself by stating your name, country of origin, nationality, and age using the verb 'to be' accurately.",
  "A1.1-M02": "Express feelings using adjectives, form negative sentences with 'to be', ask simple questions, and express likes or dislikes with accurate sentence structure.",
  "A1.1-M03": "Introduce family members, describe personal qualities, use possessive 's and possessive adjectives (this/that/these/those), and give simple compliments in English.",
  "A1.1-M04": "Talk about places in town, give directions, and go shopping using 'there is / there are' and imperative verbs.",
  "A1.1-M05": "Talk about daily habits and free-time activities, use the Present Simple in affirmative, negative, and question forms, and use adverbs of frequency to describe routine schedules.",
  "A1.1-M06": "Talk about hobbies and interests, use the 'like + -ing' pattern, express possession with 'have/has got', and describe abilities with 'can/can't'.",
  "A1.1-M07": "Talk about abilities and routines using 'can' and 'can't', name different sports, and describe everyday exercise habits.",
  "A1.1-M08": "Talk about music and feelings, describe ongoing activities using the Present Continuous, and understand vocabulary for clothes and daily life.",
  "A1.1-M09": "Talk about food and drinks, make polite requests and offers, and use 'must/mustn't' and 'can' to express obligation and permission.",
  "A1.1-M10": "Talk about past experiences and achievements, ask questions about past events, and use 'was/were' and simple past verbs accurately.",
  "A1.1-M11": "Use the Past Simple with regular verbs to recount past events, and ask and answer questions about past activities.",
  "A1.1-M12": "Discuss modes of transportation, compare things using comparative adjectives, and ask for travel information at a train station.",
  "A1.2-M01": "Ask for and give directions in town using imperative verbs (turn left, turn right, go straight) and prepositions of place (next to, opposite).",
  "A1.2-M02": "Shop with confidence, ask about prices using 'How much is this / are these?', and understand large numbers and prices in English.",
  "A1.2-M03": "Order food and drinks politely in a café or restaurant using polite requests like 'I would like' and 'Could I have'.",
  "A1.2-M04": "Describe clothes and current weather conditions accurately using the Present Continuous (wearing) and descriptive adjectives.",
  "A1.2-M05": "Describe rooms, household furniture, and layout using 'there is' and 'there are' with prepositions of place.",
  "A1.2-M06": "Navigate public transportation (buses, trains, taxis), ask for schedule information, and purchase travel tickets in English.",
  "A1.2-M07": "Describe common health issues, name body parts, and talk about everyday ailments using phrases like 'I have a headache / sore throat'.",
  "A1.2-M08": "Make, accept, and politely decline invitations and social plans using 'Would you like to...?' and 'Let's'.",
  "A1.2-M09": "Express personal hobbies and preferences using verbs of preference followed by gerunds (like, love, enjoy, hate + -ing).",
  "A1.2-M10": "Express rules, obligations, and prohibitions in public places and school using 'must', 'mustn't', and 'have to'.",
  "A1.2-M11": "Describe routes and movement through spaces accurately using prepositions of motion (into, out of, across, through, along, past).",
  "A1.2-M12": "Recount weekend experiences and past events using common irregular past simple verbs (went, saw, had, bought, did).",
  "A1.3-M01": "Compare two people, objects, or places accurately using regular and irregular comparative adjectives (-er than, more ... than).",
  "A1.3-M02": "Express the highest degree among a group using superlative adjectives (the -est, the most ...) with correct spelling and syntax.",
  "A1.3-M03": "Recount past holiday experiences and travel memories in detail, including destinations, accommodation, activities, and impressions.",
  "A1.3-M04": "Express predetermined future plans and personal intentions accurately using the 'be going to + verb' structure.",
  "A1.3-M05": "Describe physical appearance, height, hair style, facial features, and personal style using appropriate descriptive adjectives.",
  "A1.3-M06": "Describe character traits, personality qualities, and personal feelings using adjectives like cheerful, polite, honest, shy, and confident.",
  "A1.3-M07": "Communicate personal talents, special skills, and proficiencies using the 'good at' and 'bad at' patterns followed by gerunds.",
  "A1.3-M08": "Make polite requests, ask for permission, and make helpful offers using modal verbs such as 'Could you', 'May I', and 'Shall I'.",
  "A1.3-M09": "Connect clauses to explain reasons and consequences in daily conversation using conjunctions 'because' and 'so'.",
  "A1.3-M10": "Understand public signs, safety notices, and direct imperative instructions commonly found in public spaces.",
  "A1.3-M11": "Compare urban and rural life using comparative structures, discussing everyday advantages, disadvantages, and environment.",
  "A1.3-M12": "Integrate past events, present habits, and future plans seamlessly into cohesive everyday conversations as a bridge to A2.",
};

  // Assemble full pilot module format
  const fullModuleData = {
    module: {
      id: unitData.id,
      levelId: unitData.levelId || "A1.1",
      title: unitData.title,
      cefr: unitData.cefr || "A1",
      group: unitData.group || "A1.1 - Starter Foundations",
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
