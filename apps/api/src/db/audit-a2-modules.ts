import fs from "fs";
import path from "path";
import { db } from "./index";
import { curriculumModules, subModules, moduleSections } from "./schema";
import { eq, inArray } from "drizzle-orm";

const SLOP_WORDS = [
  "delve",
  "testament",
  "unlock",
  "elevate",
  "robust",
  "seamless",
  "cutting-edge",
  "tapestry",
  "game-changer",
];

async function main() {
  console.log("🔍 Starting Comprehensive Audit for all 36 CEFR A2 modules...\n");

  const a2Modules: string[] = [];
  ["A2.1", "A2.2", "A2.3"].forEach((lvl) => {
    for (let i = 1; i <= 12; i++) {
      a2Modules.push(`${lvl}-M${String(i).padStart(2, "0")}`);
    }
  });

  const pilotDir = path.resolve(process.cwd(), "../../data/pilot_modules");
  const fallbackDir = path.resolve(process.cwd(), "data/pilot_modules");
  const baseDir = fs.existsSync(pilotDir) ? pilotDir : fallbackDir;

  let totalErrors = 0;
  let totalWarnings = 0;

  console.log(`📁 Checking JSON files in: ${baseDir}`);

  for (const modId of a2Modules) {
    const filePath = path.join(baseDir, `${modId}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ [${modId}] Missing JSON file at ${filePath}`);
      totalErrors++;
      continue;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    // 1. Anti-slop check: em dashes and slop words
    const slopMatches: string[] = [];
    for (const word of SLOP_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(raw)) {
        slopMatches.push(word);
      }
    }
    const emDashCount = (raw.match(/—/g) || []).length;
    if (emDashCount > 0) {
      console.warn(`⚠️ [${modId}] Contains ${emDashCount} em dash(es) (—)`);
      totalWarnings++;
    }
    if (slopMatches.length > 0) {
      console.warn(`⚠️ [${modId}] Contains potential slop word(s): ${slopMatches.join(", ")}`);
      totalWarnings++;
    }

    // 2. Submodules check
    const subs = data.subModules || [];
    if (subs.length !== 4) {
      console.error(`❌ [${modId}] Expected 4 submodules, got ${subs.length}`);
      totalErrors++;
    }

    const subTypes = subs.map((s: any) => s.skillType || s.type);
    if (!subTypes.includes("reading") || !subTypes.includes("listening") || !subTypes.includes("writing") || !subTypes.includes("speaking")) {
      console.error(`❌ [${modId}] Missing standard submodules: ${subTypes.join(", ")}`);
      totalErrors++;
    }

    // 3. Listening questions check
    const listeningSub = subs.find((s: any) => (s.skillType || s.type) === "listening");
    const listeningQuiz = listeningSub?.sections?.find((s: any) => s.sectionType === "quiz");
    const lQuestions = listeningQuiz?.content?.practicumQuestions || listeningQuiz?.content?.questions || [];
    
    if (lQuestions.length !== 10) {
      console.error(`❌ [${modId}] Listening has ${lQuestions.length} questions, expected exactly 10!`);
      totalErrors++;
    }
    const mcqInListening = lQuestions.filter((q: any) => q.type === "multiple_choice" || (Array.isArray(q.options) && q.options.length > 0));
    if (mcqInListening.length > 0) {
      console.error(`❌ [${modId}] Listening contains ${mcqInListening.length} multiple choice questions!`);
      totalErrors++;
    }
    const dictations = lQuestions.filter((q: any) => q.type === "dictation" || q.type === "fill_blank");
    const arranges = lQuestions.filter((q: any) => q.type === "arrange" || q.type === "unscramble");
    if (dictations.length !== 5 || arranges.length !== 5) {
      console.warn(`⚠️ [${modId}] Listening breakdown: ${dictations.length} dictations, ${arranges.length} arranges`);
    }

    // 4. Writing questions check
    const writingSub = subs.find((s: any) => (s.skillType || s.type) === "writing");
    const writingQuiz = writingSub?.sections?.find((s: any) => s.sectionType === "quiz");
    const wQuestions = writingQuiz?.content?.practicumQuestions || writingQuiz?.content?.questions || [];
    if (wQuestions.length !== 10) {
      console.error(`❌ [${modId}] Writing has ${wQuestions.length} questions, expected exactly 10!`);
      totalErrors++;
    }
    const wMissingTarget = wQuestions.filter((q: any) => !q.targetAnswers || !Array.isArray(q.targetAnswers) || q.targetAnswers.length === 0);
    if (wMissingTarget.length > 0) {
      console.error(`❌ [${modId}] Writing has ${wMissingTarget.length} questions missing targetAnswers!`);
      totalErrors++;
    }

    // 5. Speaking questions check
    const speakingSub = subs.find((s: any) => (s.skillType || s.type) === "speaking");
    const speakingQuiz = speakingSub?.sections?.find((s: any) => s.sectionType === "quiz");
    const sQuestions = speakingQuiz?.content?.practicumQuestions || speakingQuiz?.content?.questions || [];
    if (sQuestions.length !== 10) {
      console.error(`❌ [${modId}] Speaking has ${sQuestions.length} questions, expected exactly 10!`);
      totalErrors++;
    }

    // 6. Reading questions check
    const readingSub = subs.find((s: any) => (s.skillType || s.type) === "reading");
    const readingQuiz = readingSub?.sections?.find((s: any) => s.sectionType === "quiz");
    const rQuestions = readingQuiz?.content?.questions || readingQuiz?.content?.practicumQuestions || [];
    if (rQuestions.length < 5) {
      console.warn(`⚠️ [${modId}] Reading has ${rQuestions.length} questions`);
    }
  }

  // 7. Database Verification
  console.log("\n🐘 Verifying PostgreSQL Database seeding...");
  const dbModules = await db.select().from(curriculumModules).where(inArray(curriculumModules.id, a2Modules));
  console.log(`  📊 Found ${dbModules.length} of ${a2Modules.length} A2 modules in database.`);
  if (dbModules.length !== a2Modules.length) {
    console.error(`❌ Database is missing ${a2Modules.length - dbModules.length} A2 modules!`);
    totalErrors++;
  }

  const dbSubs = await db.select().from(subModules).where(inArray(subModules.moduleId, a2Modules));
  console.log(`  📊 Found ${dbSubs.length} submodules in database (expected ${a2Modules.length * 4} = 144).`);
  if (dbSubs.length !== a2Modules.length * 4) {
    console.error(`❌ Expected 144 submodules, got ${dbSubs.length}`);
    totalErrors++;
  }

  console.log("\n======================================================");
  console.log(`📋 AUDIT SUMMARY:`);
  console.log(`  Total Modules Audited: ${a2Modules.length}`);
  console.log(`  Total Errors:   ${totalErrors}`);
  console.log(`  Total Warnings: ${totalWarnings}`);
  console.log("======================================================\n");

  if (totalErrors === 0) {
    console.log("✅ ALL 36 A2 MODULES FULLY COMPLIANT AND VERIFIED!");
  } else {
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
