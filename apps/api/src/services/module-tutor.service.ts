import { db } from "@/db";
import { curriculumModules, moduleSections, userModuleProgress, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import { GeminiService } from "@/lib/gemini";
import { sanitizeRepeatedChars } from "@/lib/gemini-chat";

export class ModuleTutorService {
  /**
   * Menghasilkan salam pembuka interaktif yang langsung mengajar konsep pertama modul
   * dengan memori historis jika siswa mengulang/refresh modul ini.
   */
  async getGreeting(
    moduleId: string,
    studentName?: string,
    userId?: string
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
      const rules = theorySec?.content?.rules || [];
      const trap = theorySec?.content?.commonTrap;

      const namePart = studentName ? `Halo ${studentName.split(" ")[0]}!` : "Halo!";

      // Cek apakah siswa pernah menyelesaikan / belajar modul ini sebelumnya
      let isReturning = false;
      let previousScore: number | null = null;
      let previousSummary = "";

      if (userId) {
        const [progress] = await db
          .select()
          .from(userModuleProgress)
          .where(and(eq(userModuleProgress.userId, userId), eq(userModuleProgress.moduleId, moduleId)))
          .limit(1);

        if (progress && (progress.status === "completed" || progress.status === "in_progress")) {
          isReturning = true;
          previousScore = progress.score;
        }

        const [u] = await db
          .select({ memory: users.memory })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (u?.memory?.moduleMemories?.[moduleId]) {
          const modMem = u.memory.moduleMemories[moduleId];
          previousSummary = modMem.summary || "";
          if (modMem.lastScore !== undefined) {
            previousScore = modMem.lastScore;
          }
        }
      }

      let starterDrill = "";

      // Jika siswa mengulang/refresh materi modul
      if (isReturning) {
        const scoreNote =
          previousScore !== null
            ? `Terakhir kali kamu sudah meraih skor kuis ${previousScore}%. `
            : "";
        starterDrill = `Senang bertemu lagi! ${scoreNote}Hari ini kita segarkan pemahaman dan latih refleks bicaramu di ${module.title}. Coba sapa saya atau tirukan: 'I am ready to practice again!'`;
      } else if (moduleId === "A1-M01") {
        starterDrill = `Di modul kata ganti ini, kita mulai dari dasar: 'She' (dibaca 'syi' untuk dia perempuan) dan 'He' (dibaca 'hii' untuk dia laki-laki). Coba tirukan saya: 'She is a student'.`;
      } else if (moduleId === "A1-M02") {
        starterDrill = `Di modul to be ini, ingat rumus dasarnya: 'I am', 'You are', dan 'He is'. Ingat, jangan bilang 'I am agree' ya! Coba ucapkan: 'I am ready'.`;
      } else if (rules.length > 0) {
        const firstRule = rules[0];
        const key = Object.keys(firstRule)[0];
        const val = firstRule[key];
        const ex = firstRule.example || "";
        starterDrill = `Kita mulai modul ${module.title}. Fokus pertama kita adalah '${val}'${ex ? `, contohnya: '${ex}'` : ""}. Coba tirukan saya mengucapkannya!`;
      } else {
        starterDrill = `Selamat datang di modul ${module.title}! Kita akan kuasai langkah demi langkah. Coba sapa saya dalam bahasa Inggris!`;
      }

      const greeting = `${namePart} Saya Mr. Khoirul. ${starterDrill}`;

      return Response.buildSuccess({
        moduleId,
        moduleTitle: module.title,
        greeting: sanitizeRepeatedChars(greeting),
        isReturning,
        previousScore,
      });
    } catch (e) {
      console.error("ModuleTutorService getGreeting error:", e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  /**
   * Menjawab percakapan siswa sebagai tutor privat aktif yang membimbing pemula:
   * Mengajari pengucapan (cara baca), melatih kalimat, dan respons ringkas (1-2 kalimat)
   */
  async chatWithTutor(
    moduleId: string,
    studentMessage: string,
    history: Array<{ role: "assistant" | "user"; content: string }>,
    studentName?: string,
    userId?: string
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

      let memoryPromptSnippet = "";
      if (userId) {
        const [progress] = await db
          .select()
          .from(userModuleProgress)
          .where(and(eq(userModuleProgress.userId, userId), eq(userModuleProgress.moduleId, moduleId)))
          .limit(1);

        const [u] = await db
          .select({ memory: users.memory })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        const modMem = u?.memory?.moduleMemories?.[moduleId];
        if (progress || modMem) {
          memoryPromptSnippet = `
STUDENT HISTORICAL MEMORY & RETURNING CONTEXT:
- The student has studied this module before and is reviewing/refreshing.
- Past status: ${progress?.status || "in_progress"}, Past quiz score: ${progress?.score ?? modMem?.lastScore ?? "N/A"}%
${modMem?.summary ? `- Learning Notes: "${modMem.summary}"` : ""}
- Acknowledge that they are refreshing this module and warmly encourage their progress!`;
        }
      }

      const systemPrompt = `You are Mr. Khoirul, an interactive, patient, and highly practical bilingual (Indonesian - English) personal tutor for EDDY'S AI.
You are teaching a beginner student in the specific module: "${module.title}" (Level ${module.cefr}).
${memoryPromptSnippet}

TARGET MODULE CURRICULUM:
- Objective: ${module.objective}
- Grammar Rules: ${JSON.stringify(theorySec?.content?.rules || [])}
- Common Trap for Indonesian Learners: ${JSON.stringify(theorySec?.content?.commonTrap || {})}
- Target Vocabularies: ${JSON.stringify(vocabSec?.content?.items || [])}
- Reference Dialogue: ${JSON.stringify(dialogueSec?.content?.dialogue || [])}

PEDAGOGICAL TEACHING METHOD (VERY IMPORTANT):
1. ACTIVE COACHING: Do NOT be a passive assistant waiting for questions. You are a teacher actively drilling the student through this module's topics step-by-step!
2. PRONUNCIATION GUIDANCE (CARA BACA): Always provide simple Indonesian phonetic guides for beginners when introducing or correcting words!
   - Examples:
     * 'She' dibaca 'syi' (dia perempuan)
     * 'He' dibaca 'hii' (dia laki-laki)
     * 'They' dibaca 'dey' (mereka)
     * 'We' dibaca 'wii' (kami/kita)
3. ULTRA-FAST & ULTRA-CONCISE (MAX 1-2 SHORT SENTENCES):
   - You MUST keep your reply under 25 words!
   - Short replies ensure zero audio latency and keep beginner students engaged without overwhelming them.
4. CORRECTION & IMMEDIATE DRILL:
   - If the student tries a sentence, give quick warm feedback.
   - If they make a mistake (e.g., 'me like' or 'I am agree'), explain the fix in 1 sentence.
   - Always end your sentence with a single clear instruction: "Coba ucapkan: '[Sentence]'."
5. STRICT CONTEXT LOCK:
   - Stay 100% strictly within "${module.title}". Never wander off to unrelated topics.`;

      const formattedHistory = (history || [])
        .slice(-4)
        .map((h) => `${h.role === "assistant" ? "Mr. Khoirul" : studentName || "Student"}: ${h.content}`)
        .join("\n");

      const userPrompt = `${formattedHistory ? `${formattedHistory}\n` : ""}Student: ${studentMessage}
Mr. Khoirul:`;

      const rawReply = await GeminiService.callAI(systemPrompt, userPrompt);
      const cleanedReply = sanitizeRepeatedChars(rawReply.replace(/^Mr\.\s*Khoirul:\s*/i, "").trim());

      // Asynchronously update student module memory
      if (userId && studentMessage.length > 5) {
        try {
          const [u] = await db
            .select({ memory: users.memory })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (u) {
            const mem = u.memory || { facts: [], interests: [], weaknesses: [], totalCalls: 0 };
            const modMems = mem.moduleMemories || {};
            const prev = modMems[moduleId] || {};
            modMems[moduleId] = {
              ...prev,
              attempts: (prev.attempts || 0) + 1,
              lastPracticedAt: new Date().toISOString(),
              summary: `Berlatih aktif di materi ${module.title}. Terakhir berlatih: "${studentMessage.slice(0, 60)}"`,
            };
            await db
              .update(users)
              .set({ memory: { ...mem, moduleMemories: modMems } })
              .where(eq(users.id, userId));
          }
        } catch (memErr) {
          console.warn("Gagal memperbarui memori modul siswa:", memErr);
        }
      }

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
