import { voiceRepository } from "./voice.repository";

export interface CurriculumContext {
  moduleId: string;
  title: string;
  cefr: string;
  objective: string;
  targetGrammar: string[];
  targetVocab: string[];
}

export interface StudentMemoryContext {
  preferredName?: string;
  fullName?: string;
  cefr: string;
  facts: string[];
  interests: string[];
  weaknesses: string[];
  totalCalls: number;
}

export const voiceRagService = {
  async getCurriculumContext(topic: string, studentCefr = "A1"): Promise<CurriculumContext | null> {
    try {
      const keywords = topic
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);

      const matched = await voiceRepository.findCurriculumContext(keywords, studentCefr);
      if (!matched) return null;

      const sections = await voiceRepository.getModuleSections(matched.id);
      const theorySection = sections.find((s) => s.sectionType === "theory");
      const vocabSection = sections.find((s) => s.sectionType === "vocab");

      const targetGrammar: string[] = [];
      if (theorySection?.content?.rules && Array.isArray(theorySection.content.rules)) {
        theorySection.content.rules.forEach((r: any) => {
          if (r?.pattern) targetGrammar.push(r.pattern);
          else if (typeof r === "string") targetGrammar.push(r);
        });
      }

      const targetVocab: string[] = [];
      if (vocabSection?.content?.items && Array.isArray(vocabSection.content.items)) {
        vocabSection.content.items.forEach((item: any) => {
          if (item?.word) targetVocab.push(item.word);
          else if (typeof item === "string") targetVocab.push(item);
        });
      }

      return {
        moduleId: matched.id,
        title: matched.title,
        cefr: matched.cefr,
        objective: matched.objective,
        targetGrammar,
        targetVocab,
      };
    } catch (err) {
      console.warn("voiceRagService.getCurriculumContext error:", err);
      return null;
    }
  },

  async getStudentMemory(userId?: string): Promise<StudentMemoryContext | null> {
    if (!userId) return null;

    try {
      const user = await voiceRepository.getUserInfo(userId);
      if (!user) return null;

      const mem = user.memory || { facts: [], interests: [], weaknesses: [], totalCalls: 0 };
      return {
        preferredName: mem.preferredName,
        fullName: user.name,
        cefr: user.currentCefr || "A1",
        facts: mem.facts || [],
        interests: mem.interests || [],
        weaknesses: mem.weaknesses || [],
        totalCalls: mem.totalCalls || 0,
      };
    } catch (err) {
      console.warn("voiceRagService.getStudentMemory error:", err);
      return null;
    }
  },

  async buildTutorCallContext(params: {
    topic: string;
    userId?: string;
    studentCefr?: string;
  }): Promise<string> {
    const parts: string[] = [];

    const curr = await this.getCurriculumContext(params.topic, params.studentCefr || "A1");
    if (curr) {
      parts.push(`[ACTIVE CURRICULUM MODULE]`);
      parts.push(`Module ID: ${curr.moduleId}`);
      parts.push(`Title: ${curr.title} (Level ${curr.cefr})`);
      parts.push(`Objective: ${curr.objective}`);
      if (curr.targetGrammar.length > 0) {
        parts.push(`Target Patterns: ${curr.targetGrammar.slice(0, 3).join(", ")}`);
      }
      if (curr.targetVocab.length > 0) {
        parts.push(`Target Vocabulary: ${curr.targetVocab.slice(0, 5).join(", ")}`);
      }
    }

    if (params.userId) {
      const student = await this.getStudentMemory(params.userId);
      if (student) {
        parts.push(`[STUDENT LONG-TERM PROFILE]`);
        if (student.preferredName) parts.push(`Preferred Name: ${student.preferredName}`);
        parts.push(`Current Level: CEFR ${student.cefr}`);
        if (student.facts.length > 0) {
          parts.push(`Known Student Facts: ${student.facts.slice(0, 4).join("; ")}`);
        }
        if (student.weaknesses.length > 0) {
          parts.push(`Areas to Nudge: ${student.weaknesses.slice(0, 3).join(", ")}`);
        }
      }
    }

    return parts.length > 0 ? parts.join("\n") : "";
  },

  async buildEvaluationContext(params: { topic: string }): Promise<string> {
    const curr = await this.getCurriculumContext(params.topic);
    if (!curr) return "";
    return `Evaluasi kesesuaian dengan materi modul: ${curr.title} (${curr.cefr}). Target: ${curr.objective}`;
  },

  async updateStudentMemory(
    userId: string,
    update: {
      newFacts?: string[];
      newWeaknesses?: string[];
      incrementCalls?: boolean;
    }
  ) {
    if (!userId) return;

    try {
      const user = await voiceRepository.getUserInfo(userId);
      if (!user) return;

      const mem = user.memory || { facts: [], interests: [], weaknesses: [], totalCalls: 0 };
      const factsSet = new Set(mem.facts || []);
      (update.newFacts || []).forEach((f) => {
        if (f && f.trim().length > 3) factsSet.add(f.trim());
      });

      const weaknessesSet = new Set(mem.weaknesses || []);
      (update.newWeaknesses || []).forEach((w) => {
        if (w && w.trim().length > 2) weaknessesSet.add(w.trim());
      });

      const updatedMemory = {
        ...mem,
        facts: Array.from(factsSet).slice(-10),
        weaknesses: Array.from(weaknessesSet).slice(-8),
        totalCalls: (mem.totalCalls || 0) + (update.incrementCalls ? 1 : 0),
        lastSpokenAt: new Date().toISOString(),
      };

      await voiceRepository.updateUserMemory(userId, updatedMemory);
    } catch (err) {
      console.warn("voiceRagService.updateStudentMemory error:", err);
    }
  },
};
