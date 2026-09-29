import { db } from "@/db";
import { curriculumModules, moduleSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import { GeminiService } from "@/lib/gemini";
import { sanitizeRepeatedChars } from "@/lib/gemini-chat";

export class ModuleTutorService {
  /**
   * Menghasilkan salam pembuka interaktif yang strictly terikat dengan materi modul
   */
  async getGreeting(moduleId: string, studentName?: string): Promise<ServiceResult<any>> {
    try {
      const [module] = await db
        .select()
        .from(curriculumModules)
        .where(eq(curriculumModules.id, moduleId))
        .limit(1);

      if (!module) return Response.buildErrorNotFound("Modul tidak ditemukan");

      const sections = await db
        .select()
        .from(moduleSections)
        .where(eq(moduleSections.moduleId, moduleId));

      const theorySection = sections.find((s) => s.sectionType === "theory");
      const trap = theorySection?.content?.commonTrap;

      const namePart = studentName ? `Halo ${studentName.split(" ")[0]}!` : "Halo!";
      const greeting = `${namePart} Saya Mr. Khoirul, tutor pribadi Anda untuk modul "${module.title}". Di modul ini, kita akan melatih ${module.objective.toLowerCase()}. ${
        trap?.trapTitle ? `Kita juga akan bedah ${trap.trapTitle.toLowerCase()} agar Anda makin percaya diri.` : ""
      } Ada yang ingin Anda tanyakan atau mau kita langsung coba latihan kalimat bersama?`;

      return Response.buildSuccess({
        moduleId,
        moduleTitle: module.title,
        greeting: sanitizeRepeatedChars(greeting),
      });
    } catch (e) {
      console.error("ModuleTutorService getGreeting error:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  /**
   * Menjawab pertanyaan / percakapan siswa strictly di dalam ruang lingkup modul
   */
  async chatWithTutor(
    moduleId: string,
    studentMessage: string,
    history: Array<{ role: "assistant" | "user"; content: string }>,
    studentName?: string
  ): Promise<ServiceResult<any>> {
    try {
      const [module] = await db
        .select()
        .from(curriculumModules)
        .where(eq(curriculumModules.id, moduleId))
        .limit(1);

      if (!module) return Response.buildErrorNotFound("Modul tidak ditemukan");

      const sections = await db
        .select()
        .from(moduleSections)
        .where(eq(moduleSections.moduleId, moduleId));

      const theorySec = sections.find((s) => s.sectionType === "theory");
      const vocabSec = sections.find((s) => s.sectionType === "vocab");
      const dialogueSec = sections.find((s) => s.sectionType === "dialogue");

      const systemPrompt = `You are Mr. Khoirul, a friendly, encouraging, and highly practical bilingual (Indonesian - English) English Tutor for EDDY'S AI.
The student is currently inside the specific learning module: "${module.title}" (CEFR ${module.cefr}).

MODULE CONTEXT & KNOWLEDGE BASE:
- Target Objective: ${module.objective}
- Theory Summary: ${JSON.stringify(theorySec?.content?.summary || "")}
- Grammar Rules: ${JSON.stringify(theorySec?.content?.rules || [])}
- Common Trap for Indonesian Speakers: ${JSON.stringify(theorySec?.content?.commonTrap || {})}
- Module Vocabulary: ${JSON.stringify(vocabSec?.content?.items || [])}
- Example Dialogue: ${JSON.stringify(dialogueSec?.content?.dialogue || [])}

STRICT CONSTRAINTS & BEHAVIOR:
1. STRICT BOUNDARY: You MUST strictly constrain your answers to this module: "${module.title}". Do NOT wander to unrelated advanced topics or unrelated lessons.
2. If the student asks something outside this module, gently guide them back: e.g., "Topik itu menarik, tapi fokus kita di modul ${module.title} ini adalah [objective]. Yuk kita kuasai ini dulu! Coba buat kalimat dengan [target pattern]."
3. SPOKEN VOICE STYLE: Keep replies very concise (1 to 3 sentences maximum), natural, and engaging.
4. BILINGUAL INTERACTION: The student may speak Indonesian or beginner English. Reply in clear, supportive bilingual Indonesian-English, teaching them the exact English phrasing.
5. CORRECTION: If the student falls into the common trap (like saying 'me like coffee' or 'I am agree'), warmly point out the fix with an example.
6. CALL TO ACTION: Always end your turn by prompting the student to speak or formulate one sentence using the target rule.`;

      const formattedHistory = (history || [])
        .slice(-6)
        .map((h) => `${h.role === "assistant" ? "Mr. Khoirul" : studentName || "Student"}: ${h.content}`)
        .join("\n");

      const userPrompt = `${formattedHistory ? `${formattedHistory}\n` : ""}Student: ${studentMessage}
Mr. Khoirul:`;

      const rawReply = await GeminiService.callAI(systemPrompt, userPrompt);
      const cleanedReply = sanitizeRepeatedChars(rawReply.replace(/^Mr\.\s*Khoirul:\s*/i, "").trim());

      return Response.buildSuccess({
        reply: cleanedReply,
      });
    } catch (e) {
      console.error("ModuleTutorService chat error:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const moduleTutorService = new ModuleTutorService();
