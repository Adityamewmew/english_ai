import { pgTable, varchar, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const itemBank = pgTable("item_bank", {
  id: varchar("id", { length: 50 }).primaryKey(),
  skill: varchar("skill", { length: 20 }).notNull(),
  cefr: varchar("cefr", { length: 10 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("MCQ"),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>(),
  answer: text("answer").notNull(),
  audioScript: text("audio_script"),
  audioUrl: varchar("audio_url", { length: 255 }),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const placementResults = pgTable("placement_results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  overallCefr: varchar("overall_cefr", { length: 10 }).notNull(),
  mcqScore: integer("mcq_score").notNull(),
  writingScore: integer("writing_score"),
  speakingScore: integer("speaking_score"),
  scorePercent: integer("score_percent").notNull(),
  details: jsonb("details").$type<Record<string, any>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
