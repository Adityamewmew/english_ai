import { placementRepository } from "../placement.repository";
import { usersRepository } from "../../users/users.repository";
import { GeminiService } from "../../../lib/gemini";
import fs from "fs";
import path from "path";

function getAnswerKeyMap(): Record<string, { answer: string; level: string }> {
  const candidatePaths = [
    path.resolve(process.cwd(), "placement_test.json"),
    path.resolve(process.cwd(), "apps/api/placement_test.json"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const bank = JSON.parse(fs.readFileSync(p, "utf8"));
      const map: Record<string, { answer: string; level: string }> = {};
      for (const q of bank.sections.grammar_vocab) {
        map[q.id] = { answer: q.answer, level: q.level };
      }
      return map;
    }
  }
  return {};
}

export async function submitPlacementUsecase(body: {
  userId?: string;
  answers: Record<string, string>;
  writingText?: string;
  writingEvaluation?: any;
  speakingAudioBase64?: string;
  speakingTranscript?: string;
  speakingEvaluation?: any;
}) {
  const userId = body.userId || "anonymous";
  const answerKeyMap = getAnswerKeyMap();

  let correctCount = 0;
  let totalMCQ = 0;
  const levelScores: Record<string, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 },
  };

  for (const [qId, userAns] of Object.entries(body.answers)) {
    const key = answerKeyMap[qId];
    if (key) {
      totalMCQ++;
      if (levelScores[key.level]) levelScores[key.level]!.total++;
      if (userAns.trim().toLowerCase() === key.answer.trim().toLowerCase()) {
        correctCount++;
        if (levelScores[key.level]) levelScores[key.level]!.correct++;
      }
    }
  }

  const mcqScore = totalMCQ > 0 ? Math.round((correctCount / totalMCQ) * 100) : 0;

  // Determine tentative CEFR from MCQ
  let tentativeCefr = "A1";
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  for (const lvl of levels) {
    const sc = levelScores[lvl];
    if (sc && sc.total > 0 && sc.correct / sc.total >= 0.5) {
      tentativeCefr = lvl;
    }
  }

  let finalCefr = tentativeCefr;
  let writingScore = body.writingEvaluation?.overall_score || 0;
  let speakingScore = body.speakingEvaluation?.overall_score || 0;

  const scorePercent = Math.round(
    mcqScore * 0.4 + (writingScore || mcqScore) * 0.3 + (speakingScore || mcqScore) * 0.3
  );

  const result = await placementRepository.createResult({
    userId,
    overallCefr: finalCefr,
    mcqScore,
    writingScore: writingScore || undefined,
    speakingScore: speakingScore || undefined,
    scorePercent,
    details: {
      levelScores,
      writingEvaluation: body.writingEvaluation,
      speakingEvaluation: body.speakingEvaluation,
      speakingTranscript: body.speakingTranscript,
    },
  });

  if (userId && userId !== "anonymous") {
    await usersRepository.update(userId, { currentCefr: finalCefr });
  }

  return {
    ...result,
    recommendedLevel: finalCefr,
  };
}
