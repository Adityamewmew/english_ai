import { pgTable, varchar, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export interface UserMemory {
  preferredName?: string;
  facts: string[];
  interests: string[];
  weaknesses: string[];
  totalCalls: number;
  lastSpokenAt?: string;
}

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  currentCefr: varchar("current_cefr", { length: 10 }).notNull().default("A1"),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  memory: jsonb("memory").$type<UserMemory>().default({
    facts: [],
    interests: [],
    weaknesses: [],
    totalCalls: 0,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  createdBy: varchar("created_by", { length: 36 }),
  updatedBy: varchar("updated_by", { length: 36 }),
  deletedBy: varchar("deleted_by", { length: 36 }),
});

export const curriculumModules = pgTable("curriculum_modules", {
  id: varchar("id", { length: 10 }).primaryKey(), // M01, M02, ...
  title: varchar("title", { length: 150 }).notNull(),
  cefr: varchar("cefr", { length: 10 }).notNull(), // A1, A2, B1, ...
  group: varchar("group", { length: 50 }).notNull(), // A - Basic, etc.
  objective: text("objective").notNull(),
  points: jsonb("points").$type<string[]>().notNull(),
  vocab: jsonb("vocab").$type<string[]>().notNull(),
  tests: jsonb("tests").$type<string[]>().notNull(),
  lessonsCount: integer("lessons_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const itemBank = pgTable("item_bank", {
  id: varchar("id", { length: 50 }).primaryKey(), // L-A1-01-Q1, etc.
  skill: varchar("skill", { length: 20 }).notNull(), // listening, reading, grammar, writing, speaking
  cefr: varchar("cefr", { length: 10 }).notNull(), // A1 - C2
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
  overallCefr: varchar("overall_cefr", { length: 10 }).notNull(), // A1, A2, B1, B2, C1, C2
  mcqScore: integer("mcq_score").notNull(),
  writingScore: integer("writing_score"),
  speakingScore: integer("speaking_score"),
  scorePercent: integer("score_percent").notNull(),
  details: jsonb("details").$type<Record<string, any>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const callSessions = pgTable("call_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  moduleId: varchar("module_id", { length: 10 }),
  topic: varchar("topic", { length: 150 }).notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  transcript: text("transcript"),
  evaluation: jsonb("evaluation").$type<{
    fluency?: number;
    lexical?: number;
    grammar?: number;
    pronunciation?: number;
    feedback_id?: string;
    feedback_en?: string;
    student_facts?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type CurriculumModule = typeof curriculumModules.$inferSelect;
export type ItemBank = typeof itemBank.$inferSelect;
export type PlacementResult = typeof placementResults.$inferSelect;
export type CallSession = typeof callSessions.$inferSelect;
