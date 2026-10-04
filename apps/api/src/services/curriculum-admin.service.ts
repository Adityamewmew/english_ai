import { db } from "../db";
import { curriculumModules, moduleSections, curriculumLevels } from "../db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { Response, ServiceResult } from "../lib/response";
import fs from "fs";
import path from "path";

const AI_BASE_URL = "http://localhost:20128/v1";
const AI_API_KEY = "sk-96f2316f84884524-2cee23-3c70805b";
const AI_MODEL = "claude";

export interface ModuleSectionInput {
  sectionType: "theory" | "vocab" | "dialogue" | "practice" | "quiz";
  title: string;
  content: any;
  orderIndex: number;
}

export interface SaveModuleInput {
  id?: string;
  levelId: string;
  title: string;
  cefr: string;
  group: string;
  objective: string;
  complexity?: string;
  estimatedMinutes?: number;
  isExam?: boolean;
  passingScore?: number;
  orderIndex?: number;
  sections?: ModuleSectionInput[];
}

export class CurriculumAdminService {
  // 1. Create Module
  async createModule(input: SaveModuleInput): Promise<ServiceResult<any>> {
    try {
      const cefr = input.cefr?.toUpperCase() || "A1";
      const levelId = input.levelId || `${cefr}.1`;
      
      // Generate ID if not provided (e.g. B1.1-M40)
      let moduleId = input.id?.trim();
      if (!moduleId) {
        const existingInLevel = await db
          .select({ id: curriculumModules.id, orderIndex: curriculumModules.orderIndex })
          .from(curriculumModules)
          .where(and(eq(curriculumModules.levelId, levelId), isNull(curriculumModules.deletedAt)));
        
        const nextOrder = existingInLevel.length + 1;
        const paddedOrder = String(nextOrder).padStart(2, "0");
        moduleId = `${levelId}-M${paddedOrder}`;
      }

      // Check duplicate ID
      const existing = await db
        .select({ id: curriculumModules.id })
        .from(curriculumModules)
        .where(eq(curriculumModules.id, moduleId));

      if (existing.length > 0) {
        return Response.buildErrorBadRequest(`Modul dengan ID "${moduleId}" sudah terdaftar.`);
      }

      // Determine orderIndex
      const maxOrderRes = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${curriculumModules.orderIndex}), 0)` })
        .from(curriculumModules)
        .where(eq(curriculumModules.cefr, cefr));
      const orderIndex = input.orderIndex ?? (Number(maxOrderRes[0]?.maxOrder || 0) + 1);

      // Insert module
      const [newModule] = await db
        .insert(curriculumModules)
        .values({
          id: moduleId,
          levelId: levelId,
          title: input.title,
          cefr: cefr,
          group: input.group || "General English",
          objective: input.objective || "",
          complexity: input.complexity || "medium",
          estimatedMinutes: input.estimatedMinutes || 15,
          isExam: input.isExam || false,
          passingScore: input.passingScore || 70,
          orderIndex: orderIndex,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Insert sections
      const sectionsToInsert = (input.sections && input.sections.length > 0)
        ? input.sections
        : this.getDefaultEmptySections(moduleId, input.title);

      for (let i = 0; i < sectionsToInsert.length; i++) {
        const sec = sectionsToInsert[i];
        await db.insert(moduleSections).values({
          id: `${moduleId}-SEC-${i + 1}`,
          moduleId: moduleId,
          sectionType: sec.sectionType,
          title: sec.title,
          content: sec.content || {},
          orderIndex: sec.orderIndex || (i + 1),
          createdAt: new Date(),
        });
      }

      // Sync to JSON file in data/client_curriculum
      this.syncModuleToJson(newModule, sectionsToInsert, false);

      return Response.buildSuccess(newModule, "Modul baru berhasil dibuat!");
    } catch (e: any) {
      console.error("[CurriculumAdminService.createModule] Error:", e);
      return Response.buildErrorBadRequest(e.message || "Gagal membuat modul");
    }
  }

  // 2. Update Module
  async updateModule(moduleId: string, input: Partial<SaveModuleInput>): Promise<ServiceResult<any>> {
    try {
      const existing = await db
        .select()
        .from(curriculumModules)
        .where(and(eq(curriculumModules.id, moduleId), isNull(curriculumModules.deletedAt)));

      if (existing.length === 0) {
        return Response.buildErrorNotFound(`Modul "${moduleId}" tidak ditemukan.`);
      }

      // Update module record
      const updateData: any = {
        updatedAt: new Date(),
      };
      if (input.title !== undefined) updateData.title = input.title;
      if (input.levelId !== undefined) updateData.levelId = input.levelId;
      if (input.cefr !== undefined) updateData.cefr = input.cefr.toUpperCase();
      if (input.group !== undefined) updateData.group = input.group;
      if (input.objective !== undefined) updateData.objective = input.objective;
      if (input.complexity !== undefined) updateData.complexity = input.complexity;
      if (input.estimatedMinutes !== undefined) updateData.estimatedMinutes = input.estimatedMinutes;
      if (input.isExam !== undefined) updateData.isExam = input.isExam;
      if (input.passingScore !== undefined) updateData.passingScore = input.passingScore;
      if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;

      const [updatedModule] = await db
        .update(curriculumModules)
        .set(updateData)
        .where(eq(curriculumModules.id, moduleId))
        .returning();

      // Update sections if provided
      let currentSections = input.sections;
      if (Array.isArray(input.sections) && input.sections.length > 0) {
        for (let i = 0; i < input.sections.length; i++) {
          const sec = input.sections[i];
          const secId = `${moduleId}-SEC-${i + 1}`;
          
          const secExists = await db
            .select({ id: moduleSections.id })
            .from(moduleSections)
            .where(eq(moduleSections.id, secId));

          if (secExists.length > 0) {
            await db
              .update(moduleSections)
              .set({
                sectionType: sec.sectionType,
                title: sec.title,
                content: sec.content || {},
                orderIndex: sec.orderIndex || (i + 1),
              })
              .where(eq(moduleSections.id, secId));
          } else {
            await db.insert(moduleSections).values({
              id: secId,
              moduleId: moduleId,
              sectionType: sec.sectionType,
              title: sec.title,
              content: sec.content || {},
              orderIndex: sec.orderIndex || (i + 1),
              createdAt: new Date(),
            });
          }
        }
      } else {
        // Fetch current sections for JSON sync
        currentSections = await db
          .select()
          .from(moduleSections)
          .where(eq(moduleSections.moduleId, moduleId)) as any;
      }

      // Sync updated data to JSON file
      this.syncModuleToJson(updatedModule, currentSections || [], false);

      return Response.buildSuccess(updatedModule, "Modul berhasil diperbarui!");
    } catch (e: any) {
      console.error("[CurriculumAdminService.updateModule] Error:", e);
      return Response.buildErrorBadRequest(e.message || "Gagal memperbarui modul");
    }
  }

  // 3. Soft Delete Module
  async deleteModule(moduleId: string): Promise<ServiceResult<any>> {
    try {
      const existing = await db
        .select()
        .from(curriculumModules)
        .where(and(eq(curriculumModules.id, moduleId), isNull(curriculumModules.deletedAt)));

      if (existing.length === 0) {
        return Response.buildErrorNotFound(`Modul "${moduleId}" tidak ditemukan atau sudah terhapus.`);
      }

      await db
        .update(curriculumModules)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(curriculumModules.id, moduleId));

      // Sync delete to JSON file
      this.syncModuleToJson(existing[0], [], true);

      return Response.buildSuccess({ id: moduleId }, "Modul berhasil dihapus (soft-delete).");
    } catch (e: any) {
      console.error("[CurriculumAdminService.deleteModule] Error:", e);
      return Response.buildErrorBadRequest(e.message || "Gagal menghapus modul");
    }
  }

  // 4. AI Draft Generator for New / Editing Module
  async generateAiDraft(params: { title: string; cefr: string; objective?: string; levelId?: string }): Promise<ServiceResult<any>> {
    try {
      const systemPrompt = `You are a world-class English curriculum designer.
Given a module title, CEFR level, and optional objective, draft a complete curriculum module structure.

Return ONLY a valid JSON object matching this exact schema:
{
  "objective": "Clear communicative learning objective in Indonesian",
  "group": "Grammar / Topic category name",
  "complexity": "basic" | "intermediate" | "advanced",
  "estimatedMinutes": 15,
  "theory": {
    "summary": "Clear, engaging grammar and communication explanation in Indonesian",
    "rules": [
      {
        "pattern": "Formula pattern (e.g. Subject + have/has + V3)",
        "meaning": "Meaning / usage explanation in Indonesian",
        "example": "Authentic example sentence in English"
      }
    ],
    "commonTrap": {
      "trapTitle": "Common mistake title in Indonesian",
      "explanation": "Why learners make this mistake and how to avoid it",
      "wrong": "Incorrect sentence in English",
      "correct": "Correct sentence in English"
    },
    "readinessQuestions": [
      {
        "id": 1,
        "category": "Pengenalan Bentuk",
        "prompt": "Question in Indonesian testing the grammar rule",
        "options": ["Option A", "Option B", "Option C"],
        "correctIndex": 0,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 2,
        "category": "Pemahaman Aturan",
        "prompt": "Question in Indonesian testing common trap",
        "options": ["Option A", "Option B", "Option C"],
        "correctIndex": 1,
        "explanation": "Explanation in Indonesian"
      },
      {
        "id": 3,
        "category": "Penerapan Konteks",
        "prompt": "Dialogue completion prompt in Indonesian",
        "options": ["Option A", "Option B", "Option C"],
        "correctIndex": 2,
        "explanation": "Explanation in Indonesian"
      }
    ]
  },
  "vocab": [
    {
      "word": "Target word/phrase",
      "translation": "Indonesian translation",
      "example": "Example English sentence",
      "context": "Context usage note"
    }
  ],
  "dialogue": {
    "context": "Scenario setting in Indonesian",
    "lines": [
      { "speaker": "Alex", "text": "English line", "translation": "Indonesian translation" },
      { "speaker": "Jordan", "text": "English line", "translation": "Indonesian translation" },
      { "speaker": "Alex", "text": "English line", "translation": "Indonesian translation" },
      { "speaker": "Jordan", "text": "English line", "translation": "Indonesian translation" }
    ]
  },
  "quiz": {
    "passingScore": 75,
    "questions": [
      {
        "id": 1,
        "prompt": "Multiple choice quiz question testing the module",
        "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
        "correctIndex": 0,
        "explanation": "Explanation in Indonesian"
      }
    ]
  }
}`;

      const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Module Details:\nTitle: "${params.title}"\nCEFR: "${params.cefr}"\nObjective: "${params.objective || ""}"` },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI Gateway error (${res.status}): ${await res.text()}`);
      }

      const json: any = await res.json();
      const rawText = json.choices?.[0]?.message?.content || "";
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Format draf AI tidak valid");

      const draft = JSON.parse(match[0]);
      return Response.buildSuccess(draft, "Draf materi modul berhasil digenerate!");
    } catch (e: any) {
      console.error("[CurriculumAdminService.generateAiDraft] Error:", e);
      return Response.buildErrorBadRequest(e.message || "Gagal membuat draf dengan AI");
    }
  }

  // Helper: Default Empty Sections
  private getDefaultEmptySections(moduleId: string, title: string): ModuleSectionInput[] {
    return [
      {
        sectionType: "theory",
        title: "Teori & Tata Bahasa (Theory & Grammar)",
        orderIndex: 1,
        content: {
          summary: `Pengenalan konsep dan kaidah untuk ${title}.`,
          rules: [],
          commonTrap: { trapTitle: "Kesalahan Umum", explanation: "", wrong: "", correct: "" },
          readinessQuestions: [],
        },
      },
      {
        sectionType: "vocab",
        title: "Kosakata Inti (Core Vocabulary)",
        orderIndex: 2,
        content: { items: [] },
      },
      {
        sectionType: "dialogue",
        title: "Percakapan Kontekstual (Dialogue)",
        orderIndex: 3,
        content: { context: `Situasi percakapan untuk ${title}.`, lines: [] },
      },
      {
        sectionType: "practice",
        title: "Praktik Berbicara (Speaking Lab)",
        orderIndex: 4,
        content: { goal: `Menerapkan materi ${title} secara lisan.`, scenario: "Percakapan interaktif" },
      },
      {
        sectionType: "quiz",
        title: "Kuis Evaluasi (Module Assessment)",
        orderIndex: 5,
        content: { passingScore: 70, questions: [] },
      },
    ];
  }

  // Helper: Sync to JSON file in data/client_curriculum
  private syncModuleToJson(moduleData: any, sections: any[], isDelete = false) {
    try {
      const cefr = moduleData.cefr?.toLowerCase() || "a1";
      const bundlePath = path.resolve(`c:/project/english-ai/data/client_curriculum/level_${cefr}_all_sublevels.json`);
      if (!fs.existsSync(bundlePath)) return;

      const raw = JSON.parse(fs.readFileSync(bundlePath, "utf-8"));
      let modulesList: any[] = Array.isArray(raw) ? raw : raw.modules || [];

      if (isDelete) {
        // Remove from bundle list or mark
        modulesList = modulesList.filter((m: any) => m.id !== moduleData.id);
      } else {
        // Construct canonical module JSON representation
        const theorySec = sections.find((s: any) => s.sectionType === "theory");
        const vocabSec = sections.find((s: any) => s.sectionType === "vocab");
        const dialogueSec = sections.find((s: any) => s.sectionType === "dialogue");
        const practiceSec = sections.find((s: any) => s.sectionType === "practice");
        const quizSec = sections.find((s: any) => s.sectionType === "quiz");

        const jsonModule = {
          id: moduleData.id,
          levelId: moduleData.levelId,
          title: moduleData.title,
          cefr: moduleData.cefr,
          group: moduleData.group,
          objective: moduleData.objective,
          complexity: moduleData.complexity,
          estimatedMinutes: moduleData.estimatedMinutes,
          isExam: moduleData.isExam,
          passingScore: moduleData.passingScore,
          orderIndex: moduleData.orderIndex,
          sections: {
            theory: theorySec?.content || {},
            vocab: vocabSec?.content?.items || vocabSec?.content || [],
            dialogue: dialogueSec?.content || { context: "", lines: [] },
            practice: practiceSec?.content || {},
            quiz: quizSec?.content || { passingScore: 70, questions: [] },
          },
        };

        const existingIdx = modulesList.findIndex((m: any) => m.id === moduleData.id);
        if (existingIdx >= 0) {
          modulesList[existingIdx] = jsonModule;
        } else {
          modulesList.push(jsonModule);
        }
      }

      if (Array.isArray(raw)) {
        fs.writeFileSync(bundlePath, JSON.stringify(modulesList, null, 2), "utf-8");
      } else {
        raw.modules = modulesList;
        raw.totalModules = modulesList.length;
        fs.writeFileSync(bundlePath, JSON.stringify(raw, null, 2), "utf-8");
      }
    } catch (err) {
      console.warn(`[syncModuleToJson] Failed syncing ${moduleData.id} to JSON:`, err);
    }
  }
}

export const curriculumAdminService = new CurriculumAdminService();
