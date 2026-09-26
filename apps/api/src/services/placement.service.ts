import { db } from "@/db";
import { placementResults, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import { GeminiService } from "@/lib/gemini";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export class PlacementService {
  private getTestBank() {
    const candidatePaths = [
      path.resolve(process.cwd(), "placement_test.json"),
      path.resolve(process.cwd(), "apps/api/placement_test.json"),
      path.resolve(process.cwd(), "../placement_test.json"),
      path.resolve(process.cwd(), "../../placement_test.json"),
      path.resolve(__dirname, "../../placement_test.json"),
      path.resolve(__dirname, "../../../placement_test.json"),
      path.resolve(__dirname, "../../../../placement_test.json"),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      }
    }
    return null;
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  async getDynamicTestSession(): Promise<ServiceResult<any>> {
    try {
      const bank = this.getTestBank();
      if (!bank) {
        return Response.buildErrorService("Bank soal penempatan tidak ditemukan.");
      }

      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const sampledMCQs: any[] = [];

      // Ambil 2 soal acak tiap level A1 s/d C2
      for (const lvl of levels) {
        const questionsAtLvl = bank.sections.grammar_vocab.filter((q: any) => q.level === lvl);
        const shuffled = this.shuffle(questionsAtLvl);
        const selected = shuffled.slice(0, 2).map(({ answer, options, ...rest }: any) => ({
          ...rest,
          options: this.shuffle(options),
        }));
        sampledMCQs.push(...selected);
      }

      // Ambil 1 listening acak
      const rawListening = this.shuffle<any>(bank.sections.listening)[0];
      const sampledListening = rawListening
        ? {
            ...rawListening,
            options: rawListening.options ? this.shuffle<string>(rawListening.options) : [],
          }
        : null;

      // Ambil 1 writing acak
      const sampledWriting = this.shuffle(bank.sections.writing)[0];

      // Bagian 4: Self-Introduction speaking
      const speakingSelfIntro = {
        id: "spk_self_intro",
        title: "Perkenalan Diri (Self-Introduction)",
        prompt: "Perkenalkan dirimu dalam Bahasa Inggris: sebutkan nama, kota asal, pekerjaan/kegiatan, hobi favorit, dan alasan ingin belajar Bahasa Inggris.",
        duration_seconds: 60,
      };

      return Response.buildSuccess({
        mcqs: sampledMCQs,
        listening: sampledListening,
        writing: sampledWriting,
        speaking: speakingSelfIntro,
      });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async transcribeSpeaking(base64Audio: string, mimeType: string = "audio/webm"): Promise<ServiceResult<string>> {
    try {
      const transcript = await GeminiService.transcribeAudioSelfIntro(base64Audio, mimeType);
      return Response.buildSuccess(transcript);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async evaluateSpeaking(transcript: string): Promise<ServiceResult<any>> {
    try {
      const evalResult = await GeminiService.evaluateSpeakingSelfIntro(transcript);
      return Response.buildSuccess(evalResult);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async evaluateWriting(text: string): Promise<ServiceResult<any>> {
    try {
      const evalResult = await GeminiService.evaluateWriting(text);
      return Response.buildSuccess(evalResult);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async submit(
    userId: string,
    answers: {
      mcqAnswers: Record<string, string>;
      writingText?: string;
      speakingTranscript?: string;
      speakingEvaluation?: any;
    }
  ): Promise<ServiceResult<any>> {
    try {
      const bank = this.getTestBank();
      if (!bank) {
        return Response.buildErrorService("Bank soal tidak ditemukan.");
      }

      // 1. Nilai MCQ deterministik
      let correctCount = 0;
      const allQuestions = [...bank.sections.grammar_vocab];
      const totalMCQ = Object.keys(answers.mcqAnswers).length || 12;

      for (const [qId, chosenAnswer] of Object.entries(answers.mcqAnswers)) {
        const item = allQuestions.find((q: any) => q.id === qId);
        if (item && item.answer.trim().toLowerCase() === chosenAnswer.trim().toLowerCase()) {
          correctCount++;
        }
      }

      const mcqScorePercent = Math.round((correctCount / totalMCQ) * 100);

      // 2. Hitung CEFR Level
      let finalCefr = "A1";
      if (mcqScorePercent >= 93) finalCefr = "C2";
      else if (mcqScorePercent >= 81) finalCefr = "C1";
      else if (mcqScorePercent >= 66) finalCefr = "B2";
      else if (mcqScorePercent >= 46) finalCefr = "B1";
      else if (mcqScorePercent >= 26) finalCefr = "A2";

      // 3. Simpan ke placement_results
      const resultId = crypto.randomUUID();
      await db.insert(placementResults).values({
        id: resultId,
        userId,
        overallCefr: finalCefr,
        mcqScore: correctCount,
        scorePercent: mcqScorePercent,
        details: {
          totalQuestions: totalMCQ,
          correctAnswers: correctCount,
          submittedAnswers: answers.mcqAnswers,
          writingText: answers.writingText,
          speakingTranscript: answers.speakingTranscript,
          speakingEvaluation: answers.speakingEvaluation,
        },
        createdAt: new Date(),
      });

      // 4. Update level user di tabel users
      if (userId && userId !== "anonymous") {
        try {
          await db.update(users).set({ currentCefr: finalCefr }).where(eq(users.id, userId));
        } catch {}
      }

      return Response.buildSuccess({
        id: resultId,
        overallCefr: finalCefr,
        mcqScore: correctCount,
        totalQuestions: totalMCQ,
        scorePercent: mcqScorePercent,
        speakingEvaluation: answers.speakingEvaluation || null,
      });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getLatestByUser(userId: string): Promise<ServiceResult<any>> {
    try {
      const [latest] = await db
        .select()
        .from(placementResults)
        .where(eq(placementResults.userId, userId))
        .orderBy(desc(placementResults.createdAt))
        .limit(1);

      return Response.buildSuccess(latest ?? null);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const placementService = new PlacementService();
