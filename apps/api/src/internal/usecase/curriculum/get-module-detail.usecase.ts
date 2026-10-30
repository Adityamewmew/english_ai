import { curriculumRepository } from "../../repository/curriculum_repository";
import { classRepository } from "../../repository/class_repository";
import { NotFoundError, ForbiddenError } from "../../../common/errors/app-error";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

import { isUserAdmin } from "@english-ai/shared";

export async function getModuleDetailUsecase(moduleId: string, userId?: string) {
  const module = await curriculumRepository.findModuleById(moduleId);
  if (!module) {
    throw new NotFoundError(`Curriculum module '${moduleId}' not found`);
  }

  const rawSections = await curriculumRepository.findSectionsByModuleId(moduleId);
  const subModulesList = await curriculumRepository.findSubModulesByModuleId(moduleId);

  let userProgress = null;
  let progressList: any[] = [];
  let isAdmin = false;

  if (userId) {
    const [u] = await db
      .select({ role: users.role, accessType: users.accessType, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (isUserAdmin(u)) {
      isAdmin = true;
    }

    if (!isAdmin) {
      const baseCefr = (module.levelId || "A1").toUpperCase().slice(0, 2);
      const access = await classRepository.findUserAccessByCefr(userId, baseCefr);
      if (!access) {
        throw new ForbiddenError(
          `Access to ${baseCefr} class is locked. Please unlock the class package first.`
        );
      }
      const validity = await classRepository.checkAccessValidity(access, userId);
      if (!validity.hasAccess) {
        throw new ForbiddenError(
          `Your 1-month class access for ${baseCefr} has expired. Please renew your class package to continue learning.`
        );
      }
    }

    userProgress = await curriculumRepository.findUserModuleProgress(userId, moduleId);
    if (subModulesList.length > 0) {
      progressList = await curriculumRepository.findUserSubModuleProgressList(
        userId,
        subModulesList.map((s: any) => s.id)
      );
    }
  }

  // Handle sub-modules if present
  const subModulesData = subModulesList.map((sub: any, idx: number) => {
    const subRawSections = rawSections.filter((s: any) => s.subModuleId === sub.id);
    const subSections = enrichPracticeSections(subRawSections);
    const existingProg = progressList.find((p: any) => p.subModuleId === sub.id);

    let status = "locked";
    if (isAdmin) {
      status = existingProg?.status === "completed" ? "completed" : "unlocked";
    } else if (existingProg) {
      status = existingProg.status;
    } else if (idx === 0) {
      status = "unlocked";
    } else {
      const prevProg = progressList.find((p: any) => p.subModuleId === subModulesList[idx - 1].id);
      if (prevProg?.status === "completed") {
        status = "unlocked";
      }
    }

    return {
      ...sub,
      sections: subSections,
      userProgress: existingProg
        ? { ...existingProg, status }
        : { status, score: null, completedAt: null },
    };
  });

  // Legacy sections have subModuleId = null (or empty if none)
  const legacyRawSections = subModulesList.length > 0
    ? rawSections.filter((s: any) => !s.subModuleId)
    : rawSections;
  const sections = enrichPracticeSections(legacyRawSections);

  return {
    module,
    sections,
    subModules: subModulesData,
    userProgress,
  };
}

function enrichPracticeSections(sections: any[]) {
  const vocabSec = sections.find((s: any) => s.sectionType === "vocab");

  return sections.map((sec: any) => {
    if (sec.sectionType !== "practice") return sec;

    const content = sec.content || {};
    const exercises = Array.isArray(content.exercises) ? [...content.exercises] : [];

    if (exercises.length === 0 && vocabSec?.content?.words) {
      const words = vocabSec.content.words;
      const vocabExercises = words.map((w: any, i: number) => ({
        id: `auto-vocab-${i + 1}`,
        type: "pronunciation",
        prompt: `Practice saying: "${w.word}"`,
        targetText: w.word,
        phonetic: w.phonetic || "",
        meaning: w.meaning || "",
        example: w.example || "",
      }));

      return {
        ...sec,
        content: {
          ...content,
          exercises: vocabExercises,
        },
      };
    }

    return sec;
  });
}
