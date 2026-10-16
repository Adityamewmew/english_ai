import { db } from "./index";
import { curriculumModules, subModules, moduleSections } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function seedSingleModuleData(pilotData: any) {
  const { module, subModules: subList } = pilotData;

  console.log(`\n📌 Seeding Module: ${module.id} - ${module.title}...`);

  // 1. Upsert Module
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

  // 2. Clear old sub-modules & sections to prevent duplicates
  await db.delete(moduleSections).where(eq(moduleSections.moduleId, module.id));
  await db.delete(subModules).where(eq(subModules.moduleId, module.id));

  // 3. Insert Sub-modules & sections
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

    for (const sec of sub.sections || []) {
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
  console.log(`  ✅ Finished seeding ${module.id}`);
}

export async function seedAllPilotModules() {
  console.log("🚀 Starting batch seeding of Pilot Modules from data/pilot_modules/...");

  const pilotDir = fs.existsSync(path.resolve(process.cwd(), "data/pilot_modules"))
    ? path.resolve(process.cwd(), "data/pilot_modules")
    : path.resolve(process.cwd(), "../../data/pilot_modules");

  if (!fs.existsSync(pilotDir)) {
    throw new Error(`Pilot directory not found at ${pilotDir}`);
  }

  const files = fs
    .readdirSync(pilotDir)
    .filter((f) => f.endsWith(".json") && !f.includes(".original."))
    .sort();

  console.log(`📁 Found ${files.length} pilot module file(s): ${files.join(", ")}`);

  for (const file of files) {
    const filePath = path.join(pilotDir, file);
    const pilotData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    await seedSingleModuleData(pilotData);
  }

  console.log("\n🎉 All pilot modules successfully seeded into database!");
}

if (import.meta.main) {
  seedAllPilotModules()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}
