import { pgTable, varchar, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 200 }).notNull().default("Percakapan Baru"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_chat_sessions_user_created").on(table.userId, table.createdAt),
  ]
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }).notNull(),
    clientMessageId: varchar("client_message_id", { length: 64 }),
    role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<{
      tokens?: number;
      guardrailTriggered?: boolean;
      curriculumContext?: string;
      isPartial?: boolean;
      violation?: string;
      guardrailBlocked?: boolean;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_chat_messages_session_created").on(table.sessionId, table.createdAt),
  ]
);
