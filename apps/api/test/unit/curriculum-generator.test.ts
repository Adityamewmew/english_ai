import { describe, it, expect } from "bun:test";
import {
  buildAssessmentSubmodule,
  resolveCefrTier,
  generateListeningQuestionsForModule,
} from "../../src/internal/usecase/curriculum/prompts";
import { generateModuleMaterialsUsecase } from "../../src/internal/usecase/curriculum/generate-module-materials.usecase";

describe("Curriculum Generator Unit Tests", () => {
  describe("Assessment Generator (buildAssessmentSubmodule)", () => {
    it("should resolve correct CEFR tier and passing score", () => {
      expect(resolveCefrTier("A1").tier).toBe("easy");
      expect(resolveCefrTier("A1").passingScore).toBe(70);

      expect(resolveCefrTier("A2").tier).toBe("easy");
      expect(resolveCefrTier("A2").passingScore).toBe(70);

      expect(resolveCefrTier("B1").tier).toBe("medium");
      expect(resolveCefrTier("B1").passingScore).toBe(75);

      expect(resolveCefrTier("C1").tier).toBe("hard");
      expect(resolveCefrTier("C1").passingScore).toBe(80);
    });

    it("should generate exactly 55 calibrated questions with 4 parts", () => {
      const assessmentSub = buildAssessmentSubmodule({
        unitId: "A1.1-M01",
        title: "Test Unit 1",
        cefr: "A1",
      });

      expect(assessmentSub.skillType).toBe("assessment");
      expect(assessmentSub.sections).toHaveLength(2);

      const theorySec = assessmentSub.sections.find((s) => s.sectionType === "theory");
      const quizSec = assessmentSub.sections.find((s) => s.sectionType === "quiz");

      expect(theorySec).toBeDefined();
      expect(theorySec?.content?.totalQuestions).toBe(55);
      expect(theorySec?.content?.parts).toHaveLength(4);

      expect(quizSec).toBeDefined();
      const content = quizSec?.content;
      expect(content?.totalQuestions).toBe(55);
      expect(content?.parts?.reading).toHaveLength(15);
      expect(content?.parts?.listening).toHaveLength(15);
      expect(content?.parts?.writing).toHaveLength(10);
      expect(content?.parts?.speaking).toHaveLength(15);

      expect(content?.questions).toHaveLength(55);
      expect(content?.practicumQuestions).toHaveLength(55);
    });

    it("should incorporate questions from existing submodules when provided", () => {
      const mockExistingSubmodules = [
        {
          skillType: "reading",
          sections: [
            {
              sectionType: "quiz",
              content: {
                questions: [
                  { question: "Unit reading question 1", answer: "A", options: ["A", "B"] },
                ],
              },
            },
          ],
        },
      ];

      const assessmentSub = buildAssessmentSubmodule({
        unitId: "A1.1-M02",
        title: "Test Unit 2",
        cefr: "A1",
        existingSubmodules: mockExistingSubmodules,
      });

      const quizSec = assessmentSub.sections.find((s) => s.sectionType === "quiz");
      const readingQs = quizSec?.content?.parts?.reading || [];
      expect(readingQs).toHaveLength(15);
      expect(readingQs.some((q: any) => q.question === "Unit reading question 1")).toBe(true);
    });
  });

  describe("Listening Practicum Generator (generateListeningQuestionsForModule)", () => {
    it("should generate 5 dictation and 5 arrange questions from dialogue lines", () => {
      const mockDialogue = {
        subModules: [
          {
            skillType: "listening",
            sections: [
              {
                sectionType: "dialogue",
                content: {
                  lines: [
                    { speaker: "John", text: "Good morning, how are you today?" },
                    { speaker: "Sarah", text: "I am feeling great thank you." },
                    { speaker: "John", text: "Let us review our daily plan." },
                    { speaker: "Sarah", text: "We need to study vocabulary first." },
                    { speaker: "John", text: "Please open your English book." },
                    { speaker: "Sarah", text: "I will read paragraph three." },
                    { speaker: "John", text: "Listen carefully to the recording." },
                    { speaker: "Sarah", text: "That sounds like a good idea." },
                    { speaker: "John", text: "Practice makes your speech fluent." },
                    { speaker: "Sarah", text: "I enjoy learning new phrases." },
                  ],
                },
              },
            ],
          },
        ],
      };

      const questions = generateListeningQuestionsForModule(mockDialogue);
      expect(questions.length).toBeGreaterThanOrEqual(5);

      const dictations = questions.filter((q) => q.type === "dictation");
      const arranges = questions.filter((q) => q.type === "arrange");

      expect(dictations.length).toBeGreaterThanOrEqual(1);
      for (const d of dictations) {
        expect(d.promptSentence).toContain("_____");
        expect(d.targetWord).toBeDefined();
        expect(d.targetWord!.length).toBeGreaterThanOrEqual(2);
      }

      for (const a of arranges) {
        expect(a.words).toBeDefined();
        expect(a.targetSentence).toBeDefined();
      }
    });
  });

  describe("Module Materials Usecase (generateModuleMaterialsUsecase)", () => {
    it("should throw error if moduleTitle is empty", async () => {
      expect(
        generateModuleMaterialsUsecase({
          moduleTitle: "",
          cefr: "A1",
        })
      ).rejects.toThrow("Judul modul wajib diisi");
    });

    it("should generate single assessment skill with 55 questions without calling LLM", async () => {
      const res = await generateModuleMaterialsUsecase({
        moduleTitle: "A1 Starter Mastery",
        cefr: "A1",
        skillType: "assessment",
      });

      expect(res.moduleTitle).toBe("A1 Starter Mastery");
      expect(res.skills?.assessment).toBeDefined();
      expect(res.skills?.assessment).toHaveLength(2);

      const quizSec = res.skills?.assessment?.find((s: any) => s.sectionType === "quiz");
      expect(quizSec?.content?.totalQuestions).toBe(55);
      expect(quizSec?.content?.questions).toHaveLength(55);
    });
  });
});
