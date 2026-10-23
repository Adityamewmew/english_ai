import { AppError } from "../../../common/errors/app-error";
import { OmniRouteClient } from "../../../lib/omniroute-client";
import {
  UnitBaseData,
  buildReadingPrompt,
  buildListeningPrompt,
  buildWritingPrompt,
  buildSpeakingPrompt,
  generateListeningQuestionsForModule,
} from "./prompts";

export interface GenerateModuleMaterialsInput {
  moduleId?: string;
  moduleTitle: string;
  cefr: string; // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  objective?: string;
  customInstructions?: string;
  skillType?: "reading" | "listening" | "writing" | "speaking" | "assessment" | "all";
  documentBase64?: string;
  documentMimeType?: string;
  documentText?: string;
}

export interface GeneratedModuleResponse {
  moduleTitle: string;
  cefr: string;
  submodule?: any;
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
    customInstructions?: string;
    documentText?: string;
    documentBase64?: string;
    documentMimeType?: string;
    cefr: string;
  }
): string | any[] {
  let text = baseUserPrompt;
  if (options.customInstructions) {
    text += `\n\n[ADMIN CUSTOM INSTRUCTIONS]:\n${options.customInstructions}`;
  }
  if (options.documentText) {
    text += `\n\n[DOCUMENT REFERENCE TEXT / TRANSCRIPT]:\n"""\n${options.documentText.slice(0, 45000)}\n"""\nInstructions: Carefully analyze and distill the attached reference document. Extract core vocabulary, grammar points, contextual dialogue scenarios, and assessment questions directly aligned with this text, formatted to CEFR ${options.cefr.toUpperCase()} standard.`;
  }

  if (options.documentBase64 && options.documentMimeType) {
    const docPrompt = `${text}\n\nInstructions: The user attached a document/image. Thoroughly scan, read, and distill its visual and textual content. Extract the core language skills, key vocabulary, grammar points, and comprehension quiz based directly on this document, adhering strictly to CEFR ${options.cefr.toUpperCase()} level.`;
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

  const unitData: UnitBaseData = {
    id: moduleId,
    levelId: cefr,
    title: moduleTitle,
    cefr: cefr.toUpperCase(),
    group: `${cefr.toUpperCase()} Curriculum`,
    objective: objective || `Master ${moduleTitle} at ${cefr.toUpperCase()} level`,
    orderIndex: 1,
  };

  const client = new OmniRouteClient();

  try {
    if (skillType === "all") {
      const skills = ["reading", "listening", "writing", "speaking"];
      const allSubmodules: any[] = [];
      const allSections: any[] = [];

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
        if (Array.isArray(sub?.sections)) {
          allSections.push(...sub.sections);
        }
      }

      return {
        moduleTitle,
        cefr,
        submodule: allSubmodules,
        materials: allSections,
      };
    }

    // Single skill generation
    const targetSkill = skillType === "assessment" ? "writing" : skillType;
    const p = buildSkillPrompt(targetSkill, unitData);
    const userContent = prepareUserContent(p.user, {
      customInstructions,
      documentText,
      documentBase64,
      documentMimeType,
      cefr,
    });

    const submodule = await client.generateJson<any>(p.system, userContent);

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
      materials: sections,
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError(`AI Generation failed: ${err.message || String(err)}`, 500);
  }
}
