import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import { db } from "../../src/db";
import { curriculumModules, subModules, moduleSections } from "../../src/db/schema/curriculum";
import { eq } from "drizzle-orm";
import { generateModuleMaterialsUsecase } from "../../src/internal/usecase/curriculum/generate-module-materials.usecase";
import { getModuleDetailUsecase } from "../../src/internal/usecase/curriculum/get-module-detail.usecase";

describe("Curriculum Generator & Module Detail E2E Integration Test", () => {
  const testModuleId = "TEST-E2E-A1-M99";

  const cleanup = async () => {
    await db.delete(moduleSections).where(eq(moduleSections.moduleId, testModuleId)).catch(() => {});
    await db.delete(subModules).where(eq(subModules.moduleId, testModuleId)).catch(() => {});
    await db.delete(curriculumModules).where(eq(curriculumModules.id, testModuleId)).catch(() => {});
  };

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("1. Create module, generate 55-question assessment, and verify student API delivery", async () => {
    // 1. Setup Module in DB
    await db.insert(curriculumModules).values({
      id: testModuleId,
      levelId: "A1.1",
      title: "E2E Automated Assessment Module",
      cefr: "A1",
      group: "A1 Starter Foundations",
      objective: "Test full integration flow for 55 questions",
      complexity: "easy",
      estimatedMinutes: 40,
      isExam: false,
      passingScore: 70,
      orderIndex: 99,
    });

    // 2. Trigger Generator for Assessment
    const genResult = await generateModuleMaterialsUsecase({
      moduleId: testModuleId,
      moduleTitle: "E2E Automated Assessment Module",
      cefr: "A1",
      skillType: "assessment",
    });

    expect(genResult).toBeDefined();
    expect(genResult.submodule).toBeDefined();
    expect(genResult.materials).toHaveLength(2);

    const generatedSub = genResult.submodule;

    // 3. Persist submodule into DB
    await db.insert(subModules).values({
      id: generatedSub.id,
      moduleId: testModuleId,
      skillType: generatedSub.skillType,
      title: generatedSub.title,
      orderIndex: generatedSub.orderIndex,
    });

    // 4. Persist sections into DB
    for (const sec of genResult.materials) {
      await db.insert(moduleSections).values({
        id: sec.id,
        moduleId: testModuleId,
        subModuleId: generatedSub.id,
        sectionType: sec.sectionType,
        title: sec.title,
        content: sec.content,
        orderIndex: sec.orderIndex,
      });
    }

    // 5. Fetch module via Public getModuleDetailUsecase
    const moduleDetail = await getModuleDetailUsecase(testModuleId);
    expect(moduleDetail).toBeDefined();
    expect(moduleDetail.module.id).toBe(testModuleId);
    expect(moduleDetail.subModules).toHaveLength(1);

    const assessmentSub = moduleDetail.subModules[0];
    expect(assessmentSub.skillType).toBe("assessment");
    expect(assessmentSub.sections).toHaveLength(2);

    const quizSection = assessmentSub.sections.find((s: any) => s.sectionType === "quiz");
    expect(quizSection).toBeDefined();

    const quizContent = quizSection.content;
    expect(quizContent.totalQuestions).toBe(55);
    expect(quizContent.passingScore).toBe(70);
    expect(quizContent.parts.reading).toHaveLength(15);
    expect(quizContent.parts.listening).toHaveLength(15);
    expect(quizContent.parts.writing).toHaveLength(10);
    expect(quizContent.parts.speaking).toHaveLength(15);

    expect(quizContent.questions).toHaveLength(55);
  });
});
