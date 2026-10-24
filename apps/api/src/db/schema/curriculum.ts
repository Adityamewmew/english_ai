import { pgTable, varchar, integer, text, jsonb, timestamp, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";

export const curriculumLevels = pgTable("curriculum_levels", {
  id: varchar("id", { length: 20 }).primaryKey(),
  cefr: varchar("cefr", { length: 10 }).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const curriculumModules = pgTable(
  "curriculum_modules",
  {
    id: varchar("id", { length: 20 }).primaryKey(),
    levelId: varchar("level_id", { length: 20 }).notNull().default("A1.1"),
    title: varchar("title", { length: 150 }).notNull(),
    cefr: varchar("cefr", { length: 10 }).notNull(),
    group: varchar("group", { length: 100 }).notNull(),
    objective: text("objective").notNull(),
    complexity: varchar("complexity", { length: 20 }).notNull().default("medium"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(15),
    isExam: boolean("is_exam").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    passingScore: integer("passing_score").notNull().default(70),
    orderIndex: integer("order_index").notNull().default(1),
    bannerUrl: text("banner_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_curriculum_modules_cefr_level").on(table.cefr, table.levelId, table.orderIndex),
  ]
);

export const subModules = pgTable(
  "sub_modules",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    moduleId: varchar("module_id", { length: 20 }).notNull(),
    skillType: varchar("skill_type", { length: 20 }).notNull(),
    title: varchar("title", { length: 150 }).notNull(),
    orderIndex: integer("order_index").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_sub_modules_module_id").on(table.moduleId, table.orderIndex),
  ]
);

export const moduleSections = pgTable(
  "module_sections",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    moduleId: varchar("module_id", { length: 20 }).notNull(),
    subModuleId: varchar("sub_module_id", { length: 36 }),
    sectionType: varchar("section_type", { length: 30 }).notNull(),
    title: varchar("title", { length: 150 }).notNull(),
    content: jsonb("content").$type<any>().notNull(),
    orderIndex: integer("order_index").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_module_sections_module_id").on(table.moduleId, table.orderIndex),
    index("idx_module_sections_sub_module_id").on(table.subModuleId),
  ]
);

export const userModuleProgress = pgTable(
  "user_module_progress",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    moduleId: varchar("module_id", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("locked"),
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
  },
  (table) => [
    uniqueIndex("idx_user_module_progress_user_mod").on(table.userId, table.moduleId),
    index("idx_user_module_progress_user_status").on(table.userId, table.status),
  ]
);

export const userSubModuleProgress = pgTable(
  "user_sub_module_progress",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    subModuleId: varchar("sub_module_id", { length: 36 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("locked"),
    score: integer("score"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_sub_module_idx").on(table.userId, table.subModuleId),
  ]
);
