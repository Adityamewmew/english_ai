import { db } from "../../../db";
import { itemBank } from "../../../db/schema/placement";
import { and, eq, isNull, sql } from "drizzle-orm";

export async function getPlacementSessionUsecase() {
  // 1. 10 Random Multiple Choice questions (Grammar, Vocab, Reading)
  const mcqRows = await db
    .select({
      id: itemBank.id,
      question: itemBank.question,
      options: itemBank.options,
    })
    .from(itemBank)
    .where(and(eq(itemBank.skill, "mcq"), isNull(itemBank.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(10);

  // 2. 5 Random Listening comprehension questions
  const listeningRows = await db
    .select({
      id: itemBank.id,
      question: itemBank.question,
      options: itemBank.options,
      audioScript: itemBank.audioScript,
      audioUrl: itemBank.audioUrl,
    })
    .from(itemBank)
    .where(and(eq(itemBank.skill, "listening"), isNull(itemBank.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(5);

  // 3. 5 Random Writing prompts
  const writingRows = await db
    .select({
      id: itemBank.id,
      question: itemBank.question,
    })
    .from(itemBank)
    .where(and(eq(itemBank.skill, "writing"), isNull(itemBank.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(5);

  // 4. 2 Random Speaking prompts
  const speakingRows = await db
    .select({
      id: itemBank.id,
      question: itemBank.question,
    })
    .from(itemBank)
    .where(and(eq(itemBank.skill, "speaking"), isNull(itemBank.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(2);

  return {
    sessionId: `PT-${Date.now()}`,
    mcqs: mcqRows,
    listening: listeningRows,
    writing: writingRows,
    speaking: speakingRows,
    totalQuestions:
      mcqRows.length + listeningRows.length + writingRows.length + speakingRows.length,
    estimatedMinutes: 25,
  };
}
