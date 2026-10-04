import { pgTable, varchar, integer, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";

export interface UserMemory {
  preferredName?: string;
  facts: string[];
  interests: string[];
  weaknesses: string[];
  totalCalls: number;
  lastSpokenAt?: string;
  moduleMemories?: Record<
    string,
    {
      attempts?: number;
      lastScore?: number;
      summary?: string;
      weaknesses?: string[];
      lastPracticedAt?: string;
    }
  >;
}

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  accessType: integer("access_type").notNull().default(2), // 1 = Admin, 2 = Student (Siswa)
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

export const curriculumLevels = pgTable("curriculum_levels", {
  id: varchar("id", { length: 20 }).primaryKey(), // "A1.1", "A1.2"
  cefr: varchar("cefr", { length: 10 }).notNull(), // "A1"
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const curriculumModules = pgTable("curriculum_modules", {
  id: varchar("id", { length: 20 }).primaryKey(), // "A1-M01", "A1-M02"
  levelId: varchar("level_id", { length: 20 }).notNull().default("A1.1"),
  title: varchar("title", { length: 150 }).notNull(),
  cefr: varchar("cefr", { length: 10 }).notNull(), // A1, A2, B1, ...
  group: varchar("group", { length: 50 }).notNull(),
  objective: text("objective").notNull(),
  complexity: varchar("complexity", { length: 20 }).notNull().default("medium"), // short, medium, deep
  estimatedMinutes: integer("estimated_minutes").notNull().default(15),
  isExam: boolean("is_exam").notNull().default(false),
  passingScore: integer("passing_score").notNull().default(70),
  orderIndex: integer("order_index").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const moduleSections = pgTable("module_sections", {
  id: varchar("id", { length: 36 }).primaryKey(),
  moduleId: varchar("module_id", { length: 20 }).notNull(),
  sectionType: varchar("section_type", { length: 30 }).notNull(), // "theory" | "vocab" | "dialogue" | "quiz"
  title: varchar("title", { length: 150 }).notNull(),
  content: jsonb("content").$type<any>().notNull(),
  orderIndex: integer("order_index").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userModuleProgress = pgTable("user_module_progress", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  moduleId: varchar("module_id", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("locked"), // "locked" | "unlocked" | "completed"
  score: integer("score"),
  stepProgress: jsonb("step_progress").$type<{
    currentStep: number;
    unlockedStep: number;
    completedSteps: number[];
    isPracticeUnlocked: boolean;
    isSpeakingComplete: boolean;
  }>(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export type CurriculumLevel = typeof curriculumLevels.$inferSelect;
export type CurriculumModule = typeof curriculumModules.$inferSelect;
export type ModuleSection = typeof moduleSections.$inferSelect;
export type UserModuleProgress = typeof userModuleProgress.$inferSelect;
export type ItemBank = typeof itemBank.$inferSelect;
export type PlacementResult = typeof placementResults.$inferSelect;
export type CallSession = typeof callSessions.$inferSelect;
