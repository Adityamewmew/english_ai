import { db } from "../../../db";
import { itemBank } from "../../../db/schema/placement";
import { and, eq, isNull, sql } from "drizzle-orm";

export async function getPlacementSessionUsecase() {
  // 1. 12 Calibrated Multiple Choice questions (2 items each for A1, A2, B1, B2, C1, C2)
  const mcqRows: any = await db.execute(sql`
    SELECT id, question, options, cefr
    FROM (
      SELECT id, question, options, cefr,
             ROW_NUMBER() OVER (PARTITION BY cefr ORDER BY RANDOM()) as rn
      FROM item_bank
      WHERE skill = 'mcq' AND deleted_at IS NULL
    ) t
    WHERE rn <= 2
    ORDER BY
      CASE cefr
        WHEN 'A1' THEN 1
        WHEN 'A2' THEN 2
        WHEN 'B1' THEN 3
        WHEN 'B2' THEN 4
        WHEN 'C1' THEN 5
        WHEN 'C2' THEN 6
      END, RANDOM()
  `);

  // 2. 6 Calibrated Listening questions (1 item each for A1, A2, B1, B2, C1, C2)
  const listeningRows: any = await db.execute(sql`
    SELECT id, question, options, audio_script as "audioScript", audio_url as "audioUrl", cefr
    FROM (
      SELECT id, question, options, audio_script, audio_url, cefr,
             ROW_NUMBER() OVER (PARTITION BY cefr ORDER BY RANDOM()) as rn
      FROM item_bank
      WHERE skill = 'listening' AND deleted_at IS NULL
    ) t
    WHERE rn <= 1
    ORDER BY
      CASE cefr
        WHEN 'A1' THEN 1
        WHEN 'A2' THEN 2
        WHEN 'B1' THEN 3
        WHEN 'B2' THEN 4
        WHEN 'C1' THEN 5
        WHEN 'C2' THEN 6
      END, RANDOM()
  `);

  // 3. 2 Writing prompts
  const writingRows = await db
    .select({
      id: itemBank.id,
      question: itemBank.question,
      cefr: itemBank.cefr,
    })
    .from(itemBank)
    .where(and(eq(itemBank.skill, "writing"), isNull(itemBank.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(2);

  // 4. 2 Speaking prompts
  const speakingRows = await db
    .select({
      id: itemBank.id,
      question: itemBank.question,
      cefr: itemBank.cefr,
    })
    .from(itemBank)
    .where(and(eq(itemBank.skill, "speaking"), isNull(itemBank.deletedAt)))
    .orderBy(sql`RANDOM()`)
    .limit(2);

  return {
    sessionId: `PT-${Date.now()}`,
    mcqs: Array.isArray(mcqRows) ? mcqRows : [],
    listening: Array.isArray(listeningRows) ? listeningRows : [],
    writing: writingRows,
    speaking: speakingRows,
    totalQuestions:
      (Array.isArray(mcqRows) ? mcqRows.length : 0) +
      (Array.isArray(listeningRows) ? listeningRows.length : 0) +
      writingRows.length +
      speakingRows.length,
    estimatedMinutes: 20,
  };
}
