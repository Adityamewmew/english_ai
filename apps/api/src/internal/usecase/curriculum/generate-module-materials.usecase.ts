import { eq } from "drizzle-orm";
import { AppError } from "../../../common/errors/app-error";
import { OmniRouteClient } from "../../../lib/omniroute-client";
import { db } from "../../../db";
import { moduleSections } from "../../../db/schema/curriculum";
import {
  UnitBaseData,
  buildReadingPrompt,
  buildListeningPrompt,
  buildWritingPrompt,
  buildSpeakingPrompt,
  generateListeningQuestionsForModule,
  buildAssessmentSubmodule,
} from "./prompts";

export interface GenerateModuleMaterialsInput {
  moduleId?: string | null;
  moduleTitle: string;
  cefr: string; // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  objective?: string | null;
  customInstructions?: string | null;
  skillType?: "reading" | "listening" | "writing" | "speaking" | "assessment" | "all" | string | null;
  documentBase64?: string | null;
  documentMimeType?: string | null;
  documentText?: string | null;
}

export interface GeneratedModuleResponse {
  moduleTitle: string;
  cefr: string;
  submodule?: any;
  skills?: {
    reading?: any[];
    listening?: any[];
    writing?: any[];
    speaking?: any[];
    assessment?: any[];
    [key: string]: any;
  };
  materials: any[];
}

function buildSkillPrompt(
  skill: string,
  unitData: UnitBaseData
): { system: string; user: string } {
  if (skill === "reading") return buildReadingPrompt(unitData);
  if (skill === "listening") return buildListeningPrompt(unitData);
  if (skill === "writing") return buildWritingPrompt(unitData);
  if (skill === "speaking") return buildSpeakingPrompt(unitData);
  return buildWritingPrompt(unitData);
}

function prepareUserContent(
  baseUserPrompt: string,
  options: {
    customInstructions?: string | null;
    documentText?: string | null;
    documentBase64?: string | null;
    documentMimeType?: string | null;
    cefr: string;
  }
): string | any[] {
  let text = baseUserPrompt;
  if (options.customInstructions) {
    text += `\n\n[ADMIN CUSTOM INSTRUCTIONS]:\n${options.customInstructions}`;
  }

  let docText = options.documentText || "";
  if (!docText && options.documentBase64 && options.documentMimeType === "application/pdf") {
    try {
      const buf = Buffer.from(options.documentBase64, "base64");
      const raw = buf.toString("latin1");
      const matches: string[] = [];
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let m: RegExpExecArray | null;
      while ((m = tjRegex.exec(raw)) !== null) {
        matches.push(m[1]);
      }
      if (matches.length > 5) {
        docText = matches.join(" ");
      } else {
        const wordRegex = /[a-zA-Z0-9.,;:!?'"\-\s]{4,}/g;
        const words: string[] = [];
        while ((m = wordRegex.exec(raw)) !== null && words.length < 2000) {
          words.push(m[0].trim());
        }
        docText = words.filter((w) => w.length > 3).join(" ");
      }
    } catch (e) {
      console.warn("Failed to extract text from PDF buffer:", e);
    }
  }

  if (docText) {
    text += `\n\n[DOCUMENT REFERENCE TEXT / TRANSCRIPT]:\n"""\n${docText.slice(0, 45000)}\n"""\nInstructions: Carefully analyze and distill the attached reference document. Extract core vocabulary, grammar points, contextual dialogue scenarios, and assessment questions directly aligned with this text, formatted to CEFR ${options.cefr.toUpperCase()} standard.`;
  }

  if (
    options.documentBase64 &&
    options.documentMimeType &&
    options.documentMimeType.startsWith("image/")
  ) {
    const docPrompt = `${text}\n\nInstructions: The user attached an image. Thoroughly scan, read, and distill its visual and textual content. Extract the core language skills, key vocabulary, grammar points, and comprehension quiz based directly on this document, adhering strictly to CEFR ${options.cefr.toUpperCase()} level.`;
    return [
      { type: "text", text: docPrompt },
      {
        type: "image_url",
        image_url: {
          url: `data:${options.documentMimeType};base64,${options.documentBase64}`,
        },
      },
    ];
  }

  return text;
}

function ensureReadingPracticeDrills(submodule: any): void {
  if (!submodule?.sections || !Array.isArray(submodule.sections)) return;
  const practiceSec = submodule.sections.find((s: any) => s.sectionType === "practice");
  const vocabSec = submodule.sections.find((s: any) => s.sectionType === "vocab");
  const vocabItems = vocabSec?.content?.items || vocabSec?.content?.words || [];

  if (practiceSec) {
    const existingDrills = practiceSec.content?.drills;
    const hasPairs =
      Array.isArray(existingDrills) &&
      existingDrills.length > 0 &&
      Array.isArray(existingDrills[0]?.pairs) &&
      existingDrills[0].pairs.length > 0;

    if (!hasPairs && vocabItems.length > 0) {
      practiceSec.content = {
        drills: [
          {
            id: "drill-cable-1",
            instruction:
              "Connect each vocabulary term on the left with its accurate meaning on the right.",
            pairs: vocabItems.slice(0, 5).map((it: any) => ({
              left: it.word || it.item || "",
              right: it.meaning || it.meaningId || it.definition || "",
            })),
          },
        ],
      };
    }
  }
}

export async function generateModuleMaterialsUsecase(
  input: GenerateModuleMaterialsInput
): Promise<GeneratedModuleResponse> {
  const {
    moduleId = "custom-module",
    moduleTitle,
    cefr,
    objective,
    customInstructions,
    skillType = "all",
    documentBase64,
    documentMimeType,
    documentText,
  } = input;

  if (!moduleTitle) {
    throw new AppError("Judul modul wajib diisi", 400);
  }

  const safeModuleId = moduleId || "custom-module";
  const unitData: UnitBaseData = {
    id: safeModuleId,
    levelId: cefr,
    title: moduleTitle,
    cefr: cefr.toUpperCase(),
    group: `${cefr.toUpperCase()} Curriculum`,
    objective: (objective && objective.trim()) || `Master ${moduleTitle} at ${cefr.toUpperCase()} level`,
    orderIndex: 1,
  };

  const client = new OmniRouteClient();

  try {
    // 1. ALL SKILLS GENERATION (Reading, Listening, Writing, Speaking, Assessment)
    if (skillType === "all") {
      const skills = ["reading", "listening", "writing", "speaking"];
      const allSubmodules: any[] = [];
      const allSections: any[] = [];
      const skillsMap: Record<string, any[]> = {};

      for (const s of skills) {
        const p = buildSkillPrompt(s, unitData);
        const userContent = prepareUserContent(p.user, {
          customInstructions,
          documentText,
          documentBase64,
          documentMimeType,
          cefr,
        });

        const sub = await client.generateJson<any>(p.system, userContent);
        if (s === "reading" && sub?.sections) {
          ensureReadingPracticeDrills(sub);
        }

        if (s === "listening" && sub?.sections) {
          const lQuestions = generateListeningQuestionsForModule({ subModules: [sub] });
          if (lQuestions && lQuestions.length > 0) {
            const lQuiz = sub.sections.find((sec: any) => sec.sectionType === "quiz");
            if (lQuiz) {
              lQuiz.content = {
                passingScore: 80,
                questions: lQuestions,
                practicumQuestions: lQuestions,
              };
            }
          }
        }

        allSubmodules.push(sub);
        const secList = Array.isArray(sub?.sections) ? sub.sections : [];
        skillsMap[s] = secList;
        allSections.push(...secList);
      }

      // Generate Sub-module 5: Assessment (55 Questions synthesized from skills 1-4 + tier bank)
      const assessmentSub = buildAssessmentSubmodule({
        unitId: safeModuleId,
        title: moduleTitle,
        cefr: cefr.toUpperCase(),
        existingSubmodules: allSubmodules,
      });

      allSubmodules.push(assessmentSub);
      const assessmentSecs = assessmentSub.sections || [];
      skillsMap["assessment"] = assessmentSecs;
      allSections.push(...assessmentSecs);

      return {
        moduleTitle,
        cefr,
        submodule: allSubmodules,
        skills: skillsMap,
        materials: allSections,
      };
    }

    // 2. SINGLE SKILL: ASSESSMENT
    if (skillType === "assessment") {
      let dbQuestions: any = undefined;
      if (moduleId) {
        try {
          const existingSections = await db
            .select()
            .from(moduleSections)
            .where(eq(moduleSections.moduleId, moduleId));

          const reading: any[] = [];
          const listening: any[] = [];
          const writing: any[] = [];
          const speaking: any[] = [];

          for (const sec of existingSections) {
            if (sec.sectionType === "quiz" && sec.content) {
              const c = sec.content as any;
              const subId = (sec.subModuleId || "").toLowerCase();
              if (subId.includes("read") || subId.includes("-r-")) {
                reading.push(...(c.questions || []));
              } else if (subId.includes("listen") || subId.includes("-l-")) {
                listening.push(...(c.practicumQuestions || c.questions || []));
              } else if (subId.includes("write") || subId.includes("-w-")) {
                writing.push(...(c.practicumQuestions || c.questions || []));
              } else if (subId.includes("speak") || subId.includes("-s-")) {
                speaking.push(...(c.practicumQuestions || c.questions || []));
              }
            }
          }
          dbQuestions = { reading, listening, writing, speaking };
        } catch (e) {
          console.warn("Could not query DB questions for assessment synthesis:", e);
        }
      }

      const assessmentSub = buildAssessmentSubmodule({
        unitId: safeModuleId,
        title: moduleTitle,
        cefr: cefr.toUpperCase(),
        dbQuestions,
      });

      const sections = assessmentSub.sections || [];
      return {
        moduleTitle,
        cefr,
        submodule: assessmentSub,
        skills: { assessment: sections },
        materials: sections,
      };
    }

    // 3. SINGLE SKILL: READING, LISTENING, WRITING, SPEAKING
    const targetSkill = skillType || "reading";
    const p = buildSkillPrompt(targetSkill, unitData);
    const userContent = prepareUserContent(p.user, {
      customInstructions,
      documentText,
      documentBase64,
      documentMimeType,
      cefr,
    });

    const submodule = await client.generateJson<any>(p.system, userContent);

    if (targetSkill === "reading" && submodule?.sections) {
      ensureReadingPracticeDrills(submodule);
    }

    if (targetSkill === "listening" && submodule?.sections) {
      const lQuestions = generateListeningQuestionsForModule({ subModules: [submodule] });
      if (lQuestions && lQuestions.length > 0) {
        const lQuiz = submodule.sections.find((sec: any) => sec.sectionType === "quiz");
        if (lQuiz) {
          lQuiz.content = {
            passingScore: 80,
            questions: lQuestions,
            practicumQuestions: lQuestions,
          };
        }
      }
    }

    const sections = Array.isArray(submodule?.sections) ? submodule.sections : [];

    return {
      moduleTitle,
      cefr,
      submodule,
      skills: { [targetSkill]: sections },
      materials: sections,
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError(`AI Generation failed: ${err.message || String(err)}`, 500);
  }
}
