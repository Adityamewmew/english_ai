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
        levelId: module.levelId,
        group: module.group,
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
        title: sec.title || (sec.sectionType === "quiz" ? "Assessment Quiz" : `${sec.sectionType.charAt(0).toUpperCase() + sec.sectionType.slice(1)} Section`),
        content: sec.content,
        orderIndex: sec.orderIndex,
        createdAt: new Date(),
      });
    }
  }
  console.log(`  ✅ Finished seeding ${module.id}`);
}

export async function seedAllPilotModules(filterPrefix?: string) {
  console.log("🚀 Starting batch seeding of Pilot Modules from data/pilot_modules/...");

  const pilotDir = fs.existsSync(path.resolve(process.cwd(), "data/pilot_modules"))
    ? path.resolve(process.cwd(), "data/pilot_modules")
    : path.resolve(process.cwd(), "../../data/pilot_modules");

  if (!fs.existsSync(pilotDir)) {
    throw new Error(`Pilot directory not found at ${pilotDir}`);
  }

  let files = fs
    .readdirSync(pilotDir)
    .filter((f) => f.endsWith(".json") && !f.includes(".original."));

  if (filterPrefix) {
    const prefixes = filterPrefix.split(",").map((p) => p.trim());
    files = files.filter((f) => prefixes.some((p) => f.startsWith(p) || f.includes(p)));
  }

  files.sort();

  console.log(`📁 Found ${files.length} pilot module file(s) to seed.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i + 1}/${files.length}] Processing ${file}...`);
    const filePath = path.join(pilotDir, file);
    const pilotData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    await seedSingleModuleData(pilotData);
  }

  console.log("\n🎉 Pilot modules successfully seeded into database!");
}

if (import.meta.main) {
  const filterArg = process.argv[2];
  seedAllPilotModules(filterArg)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}
