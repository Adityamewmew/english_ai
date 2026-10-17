import { pgTable, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 200 }).notNull().default("Percakapan Baru"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sessionId: varchar("session_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<{
    tokens?: number;
    guardrailTriggered?: boolean;
    curriculumContext?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
