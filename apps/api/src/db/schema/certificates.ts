import { pgTable, varchar, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const certificateTemplates = pgTable("certificate_templates", {
  cefr: varchar("cefr", { length: 20 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructorName: varchar("instructor_name", { length: 150 }),
  instructorTitle: varchar("instructor_title", { length: 150 }),
  signatureUrl: text("signature_url"),
  backgroundUrl: text("background_url"),
  themeColor: varchar("theme_color", { length: 50 }),
  nameYPercent: integer("name_y_percent").default(48),
  nameFontSize: integer("name_font_size").default(36),
  orientation: varchar("orientation", { length: 20 }).default("portrait"),
  placeOfEntry: varchar("place_of_entry", { length: 255 }).default("PBN Kelapa Gading, D.18 Jember East Java"),
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
  scoresBreakdown: jsonb("scores_breakdown"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

