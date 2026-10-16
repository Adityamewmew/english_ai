import { db } from "./index";
import { subModules, moduleSections, curriculumModules } from "./schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { generateListeningQuestionsForModule } from "./generator/generate-listening-questions";

export async function seedListeningPracticumForAllModules() {
  console.log("🎧 Starting Listening Practicum Seeding (10 non-MCQ tasks) for ALL 36 Modules...");

  const pilotDir = fs.existsSync(path.resolve(process.cwd(), "data/pilot_modules"))
    ? path.resolve(process.cwd(), "data/pilot_modules")
    : path.resolve(process.cwd(), "../../data/pilot_modules");

  if (!fs.existsSync(pilotDir)) {
    throw new Error(`Pilot directory not found at ${pilotDir}`);
  }

  const files = fs
    .readdirSync(pilotDir)
    .filter((f) => f.endsWith(".json") && !f.includes(".original"))
    .sort();

  console.log(`📁 Found ${files.length} pilot module file(s)...`);

  let updatedDbCount = 0;
  let updatedJsonCount = 0;

  for (const file of files) {
    const filePath = path.join(pilotDir, file);
    const pilotData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const moduleId = pilotData.module?.id;

    if (!moduleId) {
      console.warn(`⚠️ Skipped ${file}: Missing module.id`);
      continue;
    }

    // 1. Generate 10 high-quality listening tasks (5 dictation + 5 arrange)
    const questions = generateListeningQuestionsForModule(pilotData);

    if (questions.length < 10) {
      console.warn(`⚠️ Warning: ${moduleId} only generated ${questions.length} questions`);
    }

    // 2. Update JSON file structure
    const listeningSub = pilotData.subModules?.find((s: any) => s.skillType === "listening");
    if (listeningSub) {
      let quizSec = listeningSub.sections?.find((sec: any) => sec.sectionType === "quiz");
      if (!quizSec) {
        quizSec = {
          id: `sec-${moduleId.toLowerCase()}-l-quiz`,
          moduleId,
          subModuleId: listeningSub.id,
          sectionType: "quiz",
          title: "Audio Listening Practicum (10 Interactive Tasks)",
          orderIndex: (listeningSub.sections?.length || 2) + 1,
          content: {},
        };
        listeningSub.sections = listeningSub.sections || [];
        listeningSub.sections.push(quizSec);
      }

      quizSec.title = "Audio Listening Practicum (10 Interactive Tasks)";
      quizSec.content = {
        ...(quizSec.content || {}),
        passingScore: 80,
        practicumQuestions: questions,
        questions: questions, // Replace old multiple-choice questions
      };

      fs.writeFileSync(filePath, JSON.stringify(pilotData, null, 2), "utf8");
      updatedJsonCount++;
    }

    // 3. Update PostgreSQL Database
    const [dbSub] = await db
      .select()
      .from(subModules)
      .where(and(eq(subModules.moduleId, moduleId), eq(subModules.skillType, "listening")))
      .limit(1);

    if (dbSub) {
      const [existingQuizSec] = await db
        .select()
        .from(moduleSections)
        .where(
          and(
            eq(moduleSections.subModuleId, dbSub.id),
            eq(moduleSections.sectionType, "quiz")
          )
        )
        .limit(1);

      const sectionTitle = "Audio Listening Practicum (10 Interactive Tasks)";
      const sectionContent = {
        passingScore: 80,
        practicumQuestions: questions,
        questions: questions,
      };

      if (existingQuizSec) {
        await db
          .update(moduleSections)
          .set({
            title: sectionTitle,
            content: sectionContent,
          })
          .where(eq(moduleSections.id, existingQuizSec.id));
        updatedDbCount++;
      } else {
        const newSecId = `${dbSub.id}-SEC-QUIZ`;
        await db.insert(moduleSections).values({
          id: newSecId,
          moduleId,
          subModuleId: dbSub.id,
          sectionType: "quiz",
          title: sectionTitle,
          content: sectionContent,
          orderIndex: 3,
        });
        updatedDbCount++;
      }
    }
  }

  console.log(`\n🎉 Completed Seeding Listening Practicum!`);
  console.log(`  ✅ Updated ${updatedJsonCount} module JSON files in data/pilot_modules/`);
  console.log(`  ✅ Updated ${updatedDbCount} listening quiz sections in PostgreSQL DB!`);
}

async function main() {
  await seedListeningPracticumForAllModules();
  process.exit(0);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
}
