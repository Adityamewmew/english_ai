import { pgTable, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

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
