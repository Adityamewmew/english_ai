import { pgTable, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";

export const certificateTemplates = pgTable("certificate_templates", {
  cefr: varchar("cefr", { length: 20 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructorName: varchar("instructor_name", { length: 150 }),
  instructorTitle: varchar("instructor_title", { length: 150 }),
  signatureUrl: text("signature_url"),
  backgroundUrl: text("background_url"),
  themeColor: varchar("theme_color", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userCertificates = pgTable("user_certificates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  certificateNumber: varchar("certificate_number", { length: 100 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  cefrLevel: varchar("cefr_level", { length: 20 }).notNull(),
  userName: varchar("user_name", { length: 150 }).notNull(),
  score: integer("score").notNull().default(85),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});
