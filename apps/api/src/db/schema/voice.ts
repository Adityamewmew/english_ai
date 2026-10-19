import { pgTable, varchar, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const callSessions = pgTable("call_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  moduleId: varchar("module_id", { length: 10 }),
  topic: varchar("topic", { length: 150 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // "active" | "completed" | "abandoned"
  durationSeconds: integer("duration_seconds").notNull().default(0),
  transcript: text("transcript"),
  sttProvider: varchar("stt_provider", { length: 30 }).default("web-speech"),
  evaluation: jsonb("evaluation").$type<{
    overallBand?: number;
    cefr?: string;
    fluency?: number;
    lexical?: number;
    grammar?: number;
    pronunciation?: number;
    feedback_id?: string;
    feedback_en?: string;
    student_facts?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
