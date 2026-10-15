import { db } from "./index";
import { subModules, moduleSections, curriculumModules } from "./schema";
import { eq, inArray } from "drizzle-orm";
import { readingSubModule } from "./submodules-data/reading-submodule";
import { listeningSubModule } from "./submodules-data/listening-submodule";
import { writingSubModule } from "./submodules-data/writing-submodule";
import { speakingSubModule } from "./submodules-data/speaking-submodule";

export const subModuleDefinitions = [
  readingSubModule,
  listeningSubModule,
  writingSubModule,
  speakingSubModule,
];

export async function seedSubModulesForModule(moduleId: string, force: boolean = true) {
  const [mod] = await db
    .select()
    .from(curriculumModules)
    .where(eq(curriculumModules.id, moduleId))
    .limit(1);

  if (!mod) {
    console.warn(`Module ${moduleId} not found`);
    return;
  }

  // Delete existing sub_modules if force is true
  if (force) {
    const existing = await db
      .select()
      .from(subModules)
      .where(eq(subModules.moduleId, moduleId));

    if (existing.length > 0) {
      const subIds = existing.map((s) => s.id);
      await db.delete(moduleSections).where(inArray(moduleSections.subModuleId, subIds));
      await db.delete(subModules).where(eq(subModules.moduleId, moduleId));
      console.log(`Cleaned up ${existing.length} existing sub-modules for ${moduleId}`);
    }
  }

  for (const sDef of subModuleDefinitions) {
    const subModuleId = `${moduleId}-SUB-${sDef.skillType.toUpperCase()}`;
    await db.insert(subModules).values({
      id: subModuleId,
      moduleId,
      skillType: sDef.skillType,
      title: sDef.title,
      orderIndex: sDef.orderIndex,
    });

    for (const sec of sDef.sections) {
      const sectionId = `${subModuleId}-SEC-${sec.orderIndex}`;
      await db.insert(moduleSections).values({
        id: sectionId,
        moduleId,
        subModuleId,
        sectionType: sec.sectionType,
        title: sec.title,
        content: sec.content,
        orderIndex: sec.orderIndex,
      });
    }
  }

  console.log(`✅ Sub-modules seeded successfully for ${moduleId} in full English`);
}

async function main() {
  console.log("Seeding rich English sub-modules for A1.1-M01...");
  await seedSubModulesForModule("A1.1-M01", true);
  console.log("Done!");
  process.exit(0);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Seed sub-modules error:", err);
    process.exit(1);
  });
}
