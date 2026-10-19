import { db } from "../../../db";
import { itemBank, placementResults } from "../../../db/schema";
import { inArray } from "drizzle-orm";
import { userRepository } from "../../repository/user_repository";
import { AiChatService } from "../../../lib/ai-chat";
import { LlmGuardrailService } from "../../../lib/llm-guardrail.service";
import crypto from "crypto";

export async function submitPlacementUsecase(body: {
  userId?: string;
  answers?: Record<string, string>;
  mcqAnswers?: Record<string, string>;
  listeningAnswers?: Record<string, string>;
  writingAnswers?: Record<string, string>;
  speakingAnswers?: Record<string, string>;
  writingText?: string;
  speakingTranscript?: string;
  writingEvaluation?: any;
  speakingEvaluation?: any;
}) {
  const userId = body.userId || "anonymous";

  const mcqAnswers = { ...(body.mcqAnswers || {}), ...(body.answers || {}) };
  const listeningAnswers = { ...(body.listeningAnswers || {}) };
  const writingAnswers = { ...(body.writingAnswers || {}) };
  const speakingAnswers = { ...(body.speakingAnswers || {}) };

  // Support single text fallback from older frontend formats
  if (body.writingText && Object.keys(writingAnswers).length === 0) {
    writingAnswers["writing-legacy"] = body.writingText;
  }
  if (body.speakingTranscript && Object.keys(speakingAnswers).length === 0) {
    speakingAnswers["speaking-legacy"] = body.speakingTranscript;
  }

  // 1. Fetch all answered question items from database
  const allQuestionIds = [
    ...Object.keys(mcqAnswers),
    ...Object.keys(listeningAnswers),
    ...Object.keys(writingAnswers),
    ...Object.keys(speakingAnswers),
  ].filter((id) => id && !id.includes("legacy"));

  let itemsMap: Record<string, any> = {};
  if (allQuestionIds.length > 0) {
    const dbItems = await db
      .select()
      .from(itemBank)
      .where(inArray(itemBank.id, allQuestionIds));
    for (const it of dbItems) {
      itemsMap[it.id] = it;
    }
  }

  // 2. Score MCQ (30% weight)
  let mcqCorrect = 0;
  let mcqTotal = 0;
  const levelBreakdown: Record<string, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 },
  };

  for (const [qId, userAns] of Object.entries(mcqAnswers)) {
    const item = itemsMap[qId];
    if (item && userAns) {
      mcqTotal++;
      const lvl = item.cefr || "A1";
      if (!levelBreakdown[lvl]) levelBreakdown[lvl] = { correct: 0, total: 0 };
      levelBreakdown[lvl].total++;

      if (userAns.trim().toLowerCase() === item.answer.trim().toLowerCase()) {
        mcqCorrect++;
        levelBreakdown[lvl].correct++;
      }
    }
  }
  const mcqScore = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 50;

  // 3. Score Listening (25% weight)
  let lisCorrect = 0;
  let lisTotal = 0;
  for (const [qId, userAns] of Object.entries(listeningAnswers)) {
    const item = itemsMap[qId];
    if (item && userAns) {
      lisTotal++;
      const lvl = item.cefr || "A1";
      if (!levelBreakdown[lvl]) levelBreakdown[lvl] = { correct: 0, total: 0 };
      levelBreakdown[lvl].total++;

      if (userAns.trim().toLowerCase() === item.answer.trim().toLowerCase()) {
        lisCorrect++;
        levelBreakdown[lvl].correct++;
      }
    }
  }
  const listeningScore = lisTotal > 0 ? Math.round((lisCorrect / lisTotal) * 100) : mcqScore;

  // 4. Score Writing with AI evaluation (25% weight)
  let writingScore = body.writingEvaluation?.overall_score || 0;
  let writingEval = body.writingEvaluation || null;
  const writingEntries = Object.entries(writingAnswers).filter(([_, text]) => text && text.trim().length > 5);

  if (!writingEval && writingEntries.length > 0) {
    const hasWritingViolation = writingEntries.some(([_, text]) => !LlmGuardrailService.checkGeneralInput(text).allowed);
    if (hasWritingViolation) {
      writingScore = 20;
      writingEval = {
        overall_score: 20,
        cefr: "A1",
        feedback_id: "Jawaban terdeteksi tidak mematuhi panduan akademik tes. Silakan jawab pertanyaan sesuai topik yang diminta.",
        strengths: ["Mengikuti tes"],
        improvements: ["Fokus pada penulisan bahasa Inggris yang relevan"],
      };
    } else {
      try {
        const writingPrompts = writingEntries
          .map(([id, text], idx) => `Task ${idx + 1} (${itemsMap[id]?.question || "Prompt"}):\nStudent: "${text}"`)
          .join("\n\n");

        const sys = `You are a certified Cambridge English CEFR examiner.
Evaluate the student's writing samples.
Analyze grammar accuracy, vocabulary range, and task achievement across CEFR A1-C2.
Return valid JSON only:
{
  "overall_score": 0-100,
  "cefr": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "feedback_id": "Catatan singkat penyemangat dan area evaluasi tata bahasa dalam Bahasa Indonesia (2-3 kalimat)",
  "strengths": ["string"],
  "improvements": ["string"]
}`;
        const responseText = await AiChatService.callAI(sys, `Evaluate these student writing submissions:\n\n${writingPrompts}`);
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
        const evalRes = JSON.parse(cleanJson);
        if (evalRes && typeof evalRes.overall_score === "number") {
          writingScore = evalRes.overall_score;
          writingEval = evalRes;
        }
      } catch (err) {
        console.warn("Writing AI evaluation fallback:", err);
        writingScore = Math.max(40, mcqScore);
      }
    }
  } else if (!writingEval) {
    writingScore = Math.max(40, mcqScore);
  }

  // 5. Score Speaking with AI evaluation (20% weight)
  let speakingScore = body.speakingEvaluation?.overall_score || 0;
  let speakingEval = body.speakingEvaluation || null;
  const speakingEntries = Object.entries(speakingAnswers).filter(([_, text]) => text && text.trim().length > 3);

  if (!speakingEval && speakingEntries.length > 0) {
    const hasSpeakingViolation = speakingEntries.some(([_, text]) => !LlmGuardrailService.checkGeneralInput(text).allowed);
    if (hasSpeakingViolation) {
      speakingScore = 20;
      speakingEval = {
        overall_score: 20,
        cefr: "A1",
        feedback_id: "Jawaban terdeteksi tidak sesuai topik tes. Silakan ikuti instruksi berbicara pada tes selanjutnya.",
        strengths: ["Mengikuti tes"],
        improvements: ["Bicara sesuai topik tugas speaking"],
      };
    } else {
      try {
        const speakingTranscripts = speakingEntries
          .map(([id, transcript], idx) => `Task ${idx + 1} (${itemsMap[id]?.question || "Prompt"}):\nSpoken Transcript: "${transcript}"`)
          .join("\n\n");

        const sys = `You are an IELTS and CEFR Speaking examiner.
Evaluate the spoken transcript responses for fluency, grammar, lexical resource, and coherence.
Return valid JSON only:
{
  "overall_score": 0-100,
  "cefr": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "feedback_id": "Ulasan ramah mengenai kelancaran dan pengucapan dalam Bahasa Indonesia (2-3 kalimat)",
  "strengths": ["string"],
  "improvements": ["string"]
}`;
        const responseText = await AiChatService.callAI(sys, `Evaluate these spoken transcripts:\n\n${speakingTranscripts}`);
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
        const evalRes = JSON.parse(cleanJson);
        if (evalRes && typeof evalRes.overall_score === "number") {
          speakingScore = evalRes.overall_score;
          speakingEval = evalRes;
        }
      } catch (err) {
        console.warn("Speaking AI evaluation fallback:", err);
        speakingScore = Math.max(40, mcqScore);
      }
    }
  } else if (!speakingEval) {
    speakingScore = Math.max(40, mcqScore);
  }

  // 6. Calculate Weighted Composite Score (MCQ 30%, Listening 25%, Writing 25%, Speaking 20%)
  const scorePercent = Math.min(
    100,
    Math.max(
      10,
      Math.round(
        mcqScore * 0.3 +
        listeningScore * 0.25 +
        writingScore * 0.25 +
        speakingScore * 0.2
      )
    )
  );

  // 7. Map to Final CEFR Category (0-35: A1, 36-50: A2, 51-65: B1, 66-79: B2, 80-89: C1, 90-100: C2)
  let overallCefr = "A1";
  if (scorePercent >= 90) overallCefr = "C2";
  else if (scorePercent >= 80) overallCefr = "C1";
  else if (scorePercent >= 66) overallCefr = "B2";
  else if (scorePercent >= 51) overallCefr = "B1";
  else if (scorePercent >= 36) overallCefr = "A2";
  else overallCefr = "A1";

  // 8. Persist to database
  const resultId = crypto.randomUUID();
  const [dbResult] = await db
    .insert(placementResults)
    .values({
      id: resultId,
      userId,
      overallCefr,
      mcqScore,
      writingScore,
      speakingScore,
      scorePercent,
      details: {
        skills: {
          mcq: { score: mcqScore, correct: mcqCorrect, total: mcqTotal },
          listening: { score: listeningScore, correct: lisCorrect, total: lisTotal },
          writing: { score: writingScore, evaluation: writingEval },
          speaking: { score: speakingScore, evaluation: speakingEval },
        },
        levelBreakdown,
      },
      createdAt: new Date(),
    })
    .returning();

  // 9. Update user's currentCefr in users table
  if (userId && userId !== "anonymous") {
    try {
      await userRepository.update(userId, { currentCefr: overallCefr });
    } catch (e) {
      console.warn("Could not update user currentCefr:", e);
    }
  }

  return {
    ...dbResult,
    correctCount: mcqCorrect + lisCorrect,
    totalQuestions: mcqTotal + lisTotal + writingEntries.length + speakingEntries.length,
    overallCefr,
    scorePercent,
    skills: {
      mcqScore,
      listeningScore,
      writingScore,
      speakingScore,
    },
    writingEvaluation: writingEval,
    speakingEvaluation: speakingEval,
  };
}
