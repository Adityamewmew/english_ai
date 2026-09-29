import { db } from "./index";
import { curriculumLevels, curriculumModules, moduleSections } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";

async function runSeedLevelModules() {
  console.log("Memulai seeding Level A1.1 dan 13 Modul Progresif...");

  // Path ke data/level_a1_modules.json
  const dataPath = path.resolve(import.meta.dir, "../../../../data/level_a1_modules.json");
  if (!fs.existsSync(dataPath)) {
    console.error("File tidak ditemukan:", dataPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const parsed = JSON.parse(rawData);

  // 1. Seed Level
  const level = parsed.level;
  await db
    .insert(curriculumLevels)
    .values({
      id: level.id,
      cefr: level.cefr,
      title: level.title,
      description: level.description,
      orderIndex: level.orderIndex || 1,
    })
    .onConflictDoUpdate({
      target: curriculumLevels.id,
      set: {
        title: level.title,
        description: level.description,
        orderIndex: level.orderIndex || 1,
      },
    });
  console.log(`Level ${level.id} (${level.title}) tersimpan.`);

  // 2. Seed Modules & Sections
  const modules = parsed.modules;
  for (const m of modules) {
    await db
      .insert(curriculumModules)
      .values({
        id: m.id,
        levelId: m.levelId || level.id,
        title: m.title,
        cefr: m.cefr,
        group: m.group,
        objective: m.objective,
        complexity: m.complexity || "medium",
        estimatedMinutes: m.estimatedMinutes || 15,
        isExam: m.isExam || false,
        passingScore: m.passingScore || 70,
        orderIndex: m.orderIndex || 1,
      })
      .onConflictDoUpdate({
        target: curriculumModules.id,
        set: {
          title: m.title,
          objective: m.objective,
          complexity: m.complexity || "medium",
          estimatedMinutes: m.estimatedMinutes || 15,
          isExam: m.isExam || false,
          passingScore: m.passingScore || 70,
          orderIndex: m.orderIndex || 1,
        },
      });

    // Clean old sections for this module
    if (m.sections && Array.isArray(m.sections)) {
      await db.delete(moduleSections).where(eq(moduleSections.moduleId, m.id));

      for (let i = 0; i < m.sections.length; i++) {
        const sec = m.sections[i];
        const sectionId = `${m.id}-SEC-${i + 1}`;
        await db
          .insert(moduleSections)
          .values({
            id: sectionId,
            moduleId: m.id,
            sectionType: sec.sectionType,
            title: sec.title,
            content: sec.content,
            orderIndex: i + 1,
          });
      }
    }
    console.log(`Modul ${m.id}: ${m.title} & sections tersimpan.`);
  }

  console.log("Seeding Level A1.1 sukses tuntas.");
  process.exit(0);
}

runSeedLevelModules().catch((err) => {
  console.error("Gagal seeding modul level:", err);
  process.exit(1);
});
