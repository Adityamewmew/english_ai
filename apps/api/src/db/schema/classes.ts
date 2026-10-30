import {
  pgTable,
  varchar,
  integer,
  text,
  jsonb,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export interface TierPlanDetail {
  name: string;
  price: number;
  originalPrice?: number | null;
  dailyChatLimit: number; // e.g. 20, 100, -1 for unlimited
  dailyVoiceMinutes: number; // e.g. 5, 30, 120
  features: string[];
}

export interface TierPlansConfig {
  basic: TierPlanDetail;
  pro: TierPlanDetail;
  ultra: TierPlanDetail;
}

export const courseClasses = pgTable("course_classes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  cefr: varchar("cefr", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: integer("price").notNull().default(0),
  originalPrice: integer("original_price"),
  features: jsonb("features").$type<string[]>(),
  tierPlans: jsonb("tier_plans").$type<TierPlansConfig>(),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userClassAccess = pgTable(
  "user_class_access",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    cefr: varchar("cefr", { length: 10 }).notNull(),
    tier: varchar("tier", { length: 20 }).notNull().default("basic"),
    grantedBy: varchar("granted_by", { length: 50 }).notNull().default("admin"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_class_access_user_cefr_idx").on(table.userId, table.cefr),
  ]
);

export const userDailyAiUsage = pgTable(
  "user_daily_ai_usage",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    usageDate: varchar("usage_date", { length: 10 }).notNull(), // 'YYYY-MM-DD'
    chatCount: integer("chat_count").notNull().default(0),
    voiceSeconds: integer("voice_seconds").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_daily_ai_usage_user_date_idx").on(
      table.userId,
      table.usageDate
    ),
  ]
);
