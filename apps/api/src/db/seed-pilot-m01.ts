import { db } from "./index";
import { curriculumModules, subModules, moduleSections } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function seedPilotM01() {
  console.log("🚀 Starting seeding Pilot A1.1-M01 with 4 Sub-Modules...");

  const pilotFilePath = path.resolve(import.meta.dir, "../../../../data/pilot_modules/A1.1-M01.json");
  if (!fs.existsSync(pilotFilePath)) {
    throw new Error(`Pilot file not found at ${pilotFilePath}`);
  }

  const pilotData = JSON.parse(fs.readFileSync(pilotFilePath, "utf8"));
  const { module, subModules: subList } = pilotData;

  // 1. Upsert Module
  console.log(`📌 Upserting module ${module.id}...`);
  await db
    .insert(curriculumModules)
    .values({
      id: module.id,
      levelId: module.levelId,
      title: module.title,
      cefr: module.cefr,
      group: module.group,
      objective: module.objective,
      complexity: module.complexity || "easy",
      estimatedMinutes: module.estimatedMinutes || 25,
      isExam: module.isExam || false,
      passingScore: module.passingScore || 70,
      orderIndex: module.orderIndex || 1,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: curriculumModules.id,
      set: {
        title: module.title,
        objective: module.objective,
        complexity: module.complexity || "easy",
        estimatedMinutes: module.estimatedMinutes || 25,
        updatedAt: new Date(),
      },
    });

  // 2. Clear old sub-modules & sections for A1.1-M01 to prevent duplicates
  console.log(`🧹 Cleaning previous sub-modules for ${module.id}...`);
  await db.delete(moduleSections).where(eq(moduleSections.moduleId, module.id));
  await db.delete(subModules).where(eq(subModules.moduleId, module.id));

  // 3. Insert Sub-Modules & Sections
  for (const sub of subList) {
    console.log(`  ➕ Inserting sub-module: ${sub.title} (${sub.skillType})...`);
    await db.insert(subModules).values({
      id: sub.id,
      moduleId: sub.moduleId,
      skillType: sub.skillType,
      title: sub.title,
      orderIndex: sub.orderIndex,
      createdAt: new Date(),
    });

    for (const sec of sub.sections) {
      console.log(`    ↳ Section: ${sec.title} [${sec.sectionType}]`);
      await db.insert(moduleSections).values({
        id: sec.id,
        moduleId: sec.moduleId,
        subModuleId: sec.subModuleId,
        sectionType: sec.sectionType,
        title: sec.title,
        content: sec.content,
        orderIndex: sec.orderIndex,
        createdAt: new Date(),
      });
    }
  }

  console.log("✅ Pilot A1.1-M01 successfully seeded with 4 sub-modules and sections!");
}

if (import.meta.main) {
  seedPilotM01()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}
