import { db } from "../../../db";
import { itemBank, placementResults } from "../../../db/schema";
import { inArray } from "drizzle-orm";
import { userRepository } from "../../repository/user_repository";
import { ValidationError } from "../../../common/errors/app-error";
import { IrtScoringService, ItemScoreData } from "./irt-scoring.service";
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
}) {
  const userId = body.userId || "anonymous";

  const mcqAnswers = { ...(body.mcqAnswers || {}), ...(body.answers || {}) };
  const listeningAnswers = { ...(body.listeningAnswers || {}) };
  const writingAnswers = { ...(body.writingAnswers || {}) };
  const speakingAnswers = { ...(body.speakingAnswers || {}) };

  // Support single text fallback from legacy callers
  if (body.writingText && Object.keys(writingAnswers).length === 0) {
    writingAnswers["writing-legacy"] = body.writingText;
  }
  if (body.speakingTranscript && Object.keys(speakingAnswers).length === 0) {
    speakingAnswers["speaking-legacy"] = body.speakingTranscript;
  }

  // Guard: Reject empty or insufficient submissions (prevents 0-answer exploits)
  const totalAnswered =
    Object.keys(mcqAnswers).length +
    Object.keys(listeningAnswers).length +
    Object.values(writingAnswers).filter((t) => t && t.trim().length > 3).length +
    Object.values(speakingAnswers).filter((t) => t && t.trim().length > 3).length;

  if (totalAnswered < 5) {
    throw new ValidationError(
      "Minimal harus menjawab setidaknya 5 pertanyaan sebelum mengirim tes penempatan."
    );
  }

  // 1. Fetch item bank items from database
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

  // 2. Map answers to item score data
  const mcqItems: ItemScoreData[] = [];
  for (const [qId, userAns] of Object.entries(mcqAnswers)) {
    const item = itemsMap[qId];
    if (item && userAns) {
      const isCorrect = userAns.trim().toLowerCase() === item.answer.trim().toLowerCase();
      mcqItems.push({
        id: qId,
        userAnswer: userAns,
        correctAnswer: item.answer,
        cefr: item.cefr || "A1",
        isCorrect,
      });
    }
  }

  const listeningItems: ItemScoreData[] = [];
  for (const [qId, userAns] of Object.entries(listeningAnswers)) {
    const item = itemsMap[qId];
    if (item && userAns) {
      const isCorrect = userAns.trim().toLowerCase() === item.answer.trim().toLowerCase();
      listeningItems.push({
        id: qId,
        userAnswer: userAns,
        correctAnswer: item.answer,
        cefr: item.cefr || "A1",
        isCorrect,
      });
    }
  }

  const writingText = Object.values(writingAnswers).join(" ");
  const speakingTranscript = Object.values(speakingAnswers).join(" ");

  // 3. Evaluate via Item-Weighted Psychometric Scoring Engine (IRT)
  const evaluation = IrtScoringService.evaluate({
    mcqItems,
    listeningItems,
    writingText,
    speakingTranscript,
  });

  // 4. Persist result in database
  const resultId = crypto.randomUUID();
  const [dbResult] = await db
    .insert(placementResults)
    .values({
      id: resultId,
      userId,
      overallCefr: evaluation.overallCefr,
      mcqScore: evaluation.mcqScore,
      writingScore: evaluation.writingScore,
      speakingScore: evaluation.speakingScore,
      scorePercent: evaluation.scorePercent,
      details: {
        skills: {
          mcq: {
            score: evaluation.mcqScore,
            correct: mcqItems.filter((i) => i.isCorrect).length,
            total: mcqItems.length,
          },
          listening: {
            score: evaluation.listeningScore,
            correct: listeningItems.filter((i) => i.isCorrect).length,
            total: listeningItems.length,
          },
          writing: {
            score: evaluation.writingScore,
            wordCount: writingText.trim().split(/\s+/).filter(Boolean).length,
          },
          speaking: {
            score: evaluation.speakingScore,
            wordCount: speakingTranscript.trim().split(/\s+/).filter(Boolean).length,
          },
        },
        levelBreakdown: evaluation.levelBreakdown,
        weightedScore: evaluation.weightedScore,
        maxWeightedScore: evaluation.maxWeightedScore,
        masteryCeiling: evaluation.masteryCeiling,
        feedback: evaluation.summaryFeedback,
      },
      createdAt: new Date(),
    })
    .returning();

  // 5. Update user's currentCefr in users table
  if (userId && userId !== "anonymous") {
    try {
      await userRepository.update(userId, { currentCefr: evaluation.overallCefr });
    } catch (e) {
      console.warn("Could not update user currentCefr:", e);
    }
  }

  const correctCount =
    mcqItems.filter((i) => i.isCorrect).length +
    listeningItems.filter((i) => i.isCorrect).length;

  return {
    ...dbResult,
    correctCount,
    totalQuestions: mcqItems.length + listeningItems.length,
    overallCefr: evaluation.overallCefr,
    scorePercent: evaluation.scorePercent,
    skills: {
      mcqScore: evaluation.mcqScore,
      listeningScore: evaluation.listeningScore,
      writingScore: evaluation.writingScore,
      speakingScore: evaluation.speakingScore,
    },
    writingEvaluation: {
      overall_score: evaluation.writingScore,
      cefr: evaluation.overallCefr,
      feedback_id: evaluation.summaryFeedback,
    },
    speakingEvaluation: {
      overall_score: evaluation.speakingScore,
      cefr: evaluation.overallCefr,
      feedback_id: evaluation.summaryFeedback,
    },
  };
}
