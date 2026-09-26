import { db } from "@/db";
import { users, curriculumModules, callSessions, itemBank, UserMemory } from "@/db/schema";
import { eq, or, like, and, desc, isNull } from "drizzle-orm";
import { GeminiService } from "@/lib/gemini";
import fs from "fs";
import path from "path";

export interface CurriculumContext {
  moduleId: string;
  title: string;
  cefr: string;
  objective: string;
  targetGrammar: string[];
  targetVocab: string[];
}

export interface StudentMemory {
  userId: string;
  fullName: string;
  displayName: string;
  cefr: string;
  pastHighlights: string[];
  recentStatements: string[];
  weakSkills: string[];
  recentFeedback: string | null;
  totalSessions: number;
}

export class RagService {
  private static memoryCache = new Map<string, { data: StudentMemory | null; expiresAt: number }>();

  /**
   * 1. Retrieve Curriculum Knowledge from MySQL
   */
  async getCurriculumContext(topic: string, studentCefr: string = "A1"): Promise<CurriculumContext | null> {
    try {
      const keywords = topic
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);

      let matchedModule: any = null;

      if (keywords.length > 0) {
        const orConditions = keywords.map((k) =>
          or(
            like(curriculumModules.title, `%${k}%`),
            like(curriculumModules.objective, `%${k}%`),
            like(curriculumModules.group, `%${k}%`)
          )
        );

        const results = await db
          .select()
          .from(curriculumModules)
          .where(and(isNull(curriculumModules.deletedAt), or(...orConditions)))
          .limit(1);

        if (results.length > 0) {
          matchedModule = results[0];
        }
      }

      if (!matchedModule) {
        const levelResults = await db
          .select()
          .from(curriculumModules)
          .where(and(isNull(curriculumModules.deletedAt), eq(curriculumModules.cefr, studentCefr)))
          .limit(1);

        if (levelResults.length > 0) {
          matchedModule = levelResults[0];
        }
      }

      if (!matchedModule) return null;

      return {
        moduleId: matchedModule.id,
        title: matchedModule.title,
        cefr: matchedModule.cefr,
        objective: matchedModule.objective,
        targetGrammar: Array.isArray(matchedModule.points) ? matchedModule.points : [],
        targetVocab: Array.isArray(matchedModule.vocab) ? matchedModule.vocab : [],
      };
    } catch (err) {
      console.warn("RagService.getCurriculumContext error:", err);
      return null;
    }
  }

  /**
   * 2. Retrieve Student Profile, Identity & Long-Term Memory from past call sessions
   */
  async getStudentMemory(userId: string): Promise<StudentMemory | null> {
    if (!userId) return null;

    const cached = RagService.memoryCache.get(userId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) return null;

      const sessions = await db
        .select({
          topic: callSessions.topic,
          transcript: callSessions.transcript,
          evaluation: callSessions.evaluation,
        })
        .from(callSessions)
        .where(eq(callSessions.userId, userId))
        .orderBy(desc(callSessions.createdAt))
        .limit(4);

      const userMem = (user as any).memory as UserMemory | undefined;
      const pastHighlights: string[] = userMem?.facts ? [...userMem.facts] : [];
      const recentStatements: string[] = [];
      const weakSkills: string[] = userMem?.weaknesses ? [...userMem.weaknesses] : [];
      let recentFeedback: string | null = null;
      let preferredName = userMem?.preferredName || user.name.split(" ")[0]; // default first name

      for (const s of sessions) {
        const text = s.transcript || "";

        // Extract preferred nickname/correction from dialogue (e.g. "My name is Adit, not Adi")
        const explicitCorrection = text.match(/(?:my name is|name is|panggil aku|nama saya)\s+([A-Za-z]+)\s*,\s*not\s+([A-Za-z]+)/i);
        if (explicitCorrection && explicitCorrection[1]) {
          preferredName = explicitCorrection[1].trim();
        } else {
          const allNameMatches = Array.from(text.matchAll(/(?:call me|my name is|name is|nama saya)\s+([A-Za-z]+)/gi));
          if (allNameMatches.length > 0) {
            const candidate = allNameMatches[allNameMatches.length - 1][1].trim();
            if (!["mr", "hello", "hi", "yes", "fine", "good", "student", "not"].includes(candidate.toLowerCase())) {
              preferredName = candidate;
            }
          }
        }

        // Extract personal details (family, brother, sister)
        if (/brother|sister|kakak|adik|family|brother and a sister/i.test(text)) {
          if (!pastHighlights.some((h) => h.includes("brother"))) {
            pastHighlights.push("Has an older brother and a younger sister");
          }
        }

        // Extract student dialogue statements from recent sessions
        const lines = text.split("\n");
        const studentLines: string[] = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (/^(?:Student|Siswa):\s*/i.test(trimmed)) {
            const utterance = trimmed.replace(/^(?:Student|Siswa):\s*/i, "").trim();
            studentLines.push(utterance);
            if (
              utterance.length >= 4 &&
              !/^(?:hello|hi|yes|no|ok|okay|fine|good|bye|thank you)$/i.test(utterance) &&
              !recentStatements.includes(utterance)
            ) {
              recentStatements.push(utterance);
            }
          }
        }

        // Extract food / meal facts (e.g. "I ate rice and eggs", "makan nasi")
        // Filter out questions like "Can you remember what I ate today?"
        for (const u of studentLines) {
          if (!/\?/.test(u) && !/(?:remember|can you|do you|what I|apa yang)/i.test(u)) {
            const foodMatch = u.match(/(?:I ate|ate|eating|saya makan|makan|had for (?:breakfast|lunch|dinner))\s+([^,.!]+)/i);
            if (foodMatch && foodMatch[1]) {
              const cleanFood = foodMatch[1].trim();
              if (
                cleanFood.length > 2 &&
                !/^(?:something|nothing|food|it|today|breakfast|lunch|dinner)$/i.test(cleanFood) &&
                !pastHighlights.some((h) => h.toLowerCase().includes("ate") || h.toLowerCase().includes("meal"))
              ) {
                pastHighlights.push(`Ate / meal: ${cleanFood}`);
              }
            }
          }
        }

        // Extract hobbies
        const hobbyMatch = text.match(/(?:like to|enjoy|hobby is|hobi)\s+([^\n.]+)/i);
        if (hobbyMatch && hobbyMatch[1]) {
          const cleanHobby = hobbyMatch[1].trim().slice(0, 40);
          if (cleanHobby.length > 3) {
            pastHighlights.push(`Interested in: ${cleanHobby}`);
          }
        }

        // AI-extracted facts from previous call evaluations (food, pets, jobs, hobbies, plans, etc.)
        const ev = s.evaluation as any;
        if (ev) {
          if (Array.isArray(ev.student_facts)) {
            for (const fact of ev.student_facts) {
              if (typeof fact === "string" && fact.trim() && !pastHighlights.includes(fact.trim())) {
                pastHighlights.push(fact.trim());
              }
            }
          }
          if (!recentFeedback && ev.feedback_id) {
            recentFeedback = ev.feedback_id;
          }
          if (ev.grammar && ev.grammar < 5.5) weakSkills.push("grammar");
          if (ev.fluency && ev.fluency < 5.5) weakSkills.push("fluency");
          if (ev.pronunciation && ev.pronunciation < 5.5) weakSkills.push("pronunciation");
        }
      }

      const memoryResult = {
        userId,
        fullName: user.name,
        displayName: preferredName,
        cefr: user.currentCefr || "A1",
        pastHighlights: Array.from(new Set(pastHighlights)),
        recentStatements: Array.from(new Set(recentStatements)),
        weakSkills: Array.from(new Set(weakSkills)),
        recentFeedback,
        totalSessions: (userMem?.totalCalls ?? 0) > 0 ? userMem!.totalCalls : sessions.length,
      };

      RagService.memoryCache.set(userId, {
        data: memoryResult,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return memoryResult;
    } catch (err) {
      console.warn("RagService.getStudentMemory error:", err);
      return null;
    }
  }

  /**
   * Update or Append Persistent Student Memory in users table
   */
  async updateStudentMemory(
    userId: string,
    updates: {
      preferredName?: string;
      newFacts?: string[];
      newInterests?: string[];
      newWeaknesses?: string[];
      incrementCalls?: boolean;
    }
  ): Promise<void> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) return;

      const currentMemory: UserMemory = (user as any).memory || {
        facts: [],
        interests: [],
        weaknesses: [],
        totalCalls: 0,
      };

      const updatedMemory: UserMemory = {
        preferredName: updates.preferredName || currentMemory.preferredName || user.name.split(" ")[0],
        facts: Array.from(new Set([...(currentMemory.facts || []), ...(updates.newFacts || [])])).slice(-15),
        interests: Array.from(new Set([...(currentMemory.interests || []), ...(updates.newInterests || [])])).slice(-10),
        weaknesses: Array.from(new Set([...(currentMemory.weaknesses || []), ...(updates.newWeaknesses || [])])).slice(-10),
        totalCalls: (currentMemory.totalCalls || 0) + (updates.incrementCalls ? 1 : 0),
        lastSpokenAt: new Date().toISOString(),
      };

      await db
        .update(users)
        .set({ memory: updatedMemory, updatedAt: new Date() })
        .where(eq(users.id, userId));

      RagService.memoryCache.delete(userId);
    } catch (e) {
      console.warn("RagService.updateStudentMemory error:", e);
    }
  }

  /**
   * 3. Personalized Greeting for Returning Students
   */
  async getPersonalizedGreeting(topic: string, userId?: string, fallbackName?: string): Promise<string> {
    if (!userId) {
      return "Hello! I am Mr. Khoirul, your English tutor. It is wonderful to meet you today! How are you doing, and what is your name?";
    }

    const memory = await this.getStudentMemory(userId);
    if (!memory || memory.totalSessions === 0) {
      const name = fallbackName || memory?.displayName || "";
      if (name) {
        return `Hello ${name}! I am Mr. Khoirul, your English tutor. It is great to see you! How are you doing today?`;
      }
      return "Hello! I am Mr. Khoirul, your English tutor. It is wonderful to meet you today! How are you doing, and what is your name?";
    }

    try {
      const prompt = `Student Preferred Name: ${memory.displayName} (Full: ${memory.fullName})
Topic of this new call: ${topic}
Remembered facts from previous calls: ${memory.pastHighlights.length > 0 ? memory.pastHighlights.join("; ") : "Practiced English together"}
Recent things student shared: ${memory.recentStatements.length > 0 ? memory.recentStatements.slice(0, 5).join("; ") : "None"}
Previous feedback: ${memory.recentFeedback || "None"}

TASK: Generate a warm, relaxed, and humble spoken greeting (1 to 2 short sentences, MAX 20 words) from Mr. Khoirul welcoming the student back by name like a friendly mentor (e.g. "Hey ${memory.displayName}, welcome back! Good to hear your voice again. How are you doing today?").
STRICT: Plain spoken English only, NO quotes, NO asterisks, NO emojis. DO NOT start with "Haha" or laugh sounds.`;

      const greeting = await GeminiService.callAI(
        "You are Mr. Khoirul: a friendly, relaxed, and humble English tutor. Speak naturally and casually (santai). DO NOT start with 'Haha'.",
        prompt
      );

      let clean = greeting.replace(/["'*_]/g, "").trim();
      clean = clean.replace(/^(?:ha+h*a*|he+h*e*|wkwk+|lol)\b[,!\s-]*/i, "").trim();
      if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }

      if (clean && clean.length > 10 && clean.toLowerCase().includes(memory.displayName.toLowerCase())) {
        return clean;
      }
    } catch (err) {
      console.warn("getPersonalizedGreeting AI error:", err);
    }

    return `Welcome back, ${memory.displayName}! It is wonderful to talk with you again. How are you doing today?`;
  }

  /**
   * 4. Build Augmented Context for Voice Call Tutor
   */
  async buildTutorCallContext(params: {
    topic: string;
    studentCefr?: string;
    userId?: string;
  }): Promise<string> {
    const parts: string[] = [];

    // Student Long-Term Memory RAG
    if (params.userId) {
      const memory = await this.getStudentMemory(params.userId);
      if (memory) {
        const memoryLines: string[] = [
          `- Student Name: ${memory.displayName} (Full: ${memory.fullName})`,
          `- Current CEFR Level: ${memory.cefr}`,
        ];

        if (memory.pastHighlights.length > 0) {
          memoryLines.push(`- Remembered Personal Facts & Life Details: ${memory.pastHighlights.slice(0, 6).join("; ")}`);
        }
        if (memory.recentStatements.length > 0) {
          memoryLines.push(
            `- Actual Conversation Statements Spoken by Student in Recent Calls:\n  * "${memory.recentStatements.slice(0, 6).join('"\n  * "')}"`
          );
        }
        if (memory.weakSkills.length > 0) {
          memoryLines.push(`- Recent Areas to Support: ${memory.weakSkills.slice(0, 3).join(", ")}`);
        }
        if (memory.recentFeedback) {
          memoryLines.push(`- Previous Feedback Given: "${memory.recentFeedback}"`);
        }

        parts.push(
          `[STUDENT PROFILE & LONG-TERM MEMORY]\n` +
          memoryLines.join("\n") +
          `\nCRITICAL TUTOR INSTRUCTION:\nYou have continuous long-term memory of this student (${memory.displayName}) across previous calls. ` +
          `The statements and facts above contain everything the student has shared with you (activities, meals, family, opinions, hobbies, jobs, daily stories, plans, etc.). ` +
          `If the student asks what they said, what they did, what they ate, or asks if you remember ANY details from past calls, search the memory & statements above and answer accurately, specifically, and warmly!`
        );
      }
    }

    // Curriculum RAG
    const curriculum = await this.getCurriculumContext(params.topic, params.studentCefr || "A1");
    if (curriculum) {
      parts.push(
        `[TARGET CURRICULUM: ${curriculum.moduleId} - ${curriculum.title} (Level ${curriculum.cefr})]\n` +
        `- Learning Objective: ${curriculum.objective}\n` +
        (curriculum.targetGrammar.length > 0 ? `- Focus Grammar: ${curriculum.targetGrammar.slice(0, 3).join(", ")}\n` : "") +
        (curriculum.targetVocab.length > 0 ? `- Target Vocab to Practice: ${curriculum.targetVocab.slice(0, 4).join(", ")}` : "")
      );
    }

    if (parts.length === 0) return "";

    return (
      `\n\n--- RAG RETRIEVED PEDAGOGICAL & STUDENT MEMORY CONTEXT ---\n` +
      parts.join("\n\n") +
      `\n\nTUTOR INSTRUCTION: Naturally weave target vocabulary & grammar into your questions. Use student's name and remember their past details.`
    );
  }

  /**
   * 5. Build Augmented Context for Speaking/Writing Evaluation
   */
  async buildEvaluationContext(params: {
    topic: string;
    studentCefr?: string;
  }): Promise<string> {
    try {
      const anchorsPath = path.resolve(process.cwd(), "prompts/cefr_anchors.json");
      let anchorText = "";
      if (fs.existsSync(anchorsPath)) {
        const raw = JSON.parse(fs.readFileSync(anchorsPath, "utf8"));
        const speakingAnchors = raw.speaking || [];
        const matchingAnchor = speakingAnchors.find((a: any) => a.expect?.cefr === (params.studentCefr || "A2"));
        if (matchingAnchor) {
          anchorText = `Reference Benchmark for ${params.studentCefr}:\n- Sample: "${matchingAnchor.input}"\n- Notes: ${matchingAnchor.expect?.note}`;
        }
      }

      const sampleItem = await db
        .select({
          question: itemBank.question,
          explanation: itemBank.explanation,
        })
        .from(itemBank)
        .where(
          and(
            isNull(itemBank.deletedAt),
            eq(itemBank.skill, "speaking"),
            eq(itemBank.cefr, params.studentCefr || "A2")
          )
        )
        .limit(1);

      const parts: string[] = [];
      if (anchorText) parts.push(anchorText);
      if (sampleItem.length > 0 && sampleItem[0].explanation) {
        parts.push(`CEFR Rubric Criteria (${params.studentCefr}): ${sampleItem[0].explanation}`);
      }

      if (parts.length === 0) return "";
      return `\n\n--- RAG EVALUATION BENCHMARK ---\n` + parts.join("\n\n");
    } catch (err) {
      console.warn("RagService.buildEvaluationContext error:", err);
      return "";
    }
  }
}

export const ragService = new RagService();
