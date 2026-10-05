import { pgTable, varchar, integer, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";

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
