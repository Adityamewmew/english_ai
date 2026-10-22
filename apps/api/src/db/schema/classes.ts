import { pgTable, varchar, integer, text, jsonb, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const courseClasses = pgTable("course_classes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  cefr: varchar("cefr", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: integer("price").notNull().default(0),
  originalPrice: integer("original_price"),
  features: jsonb("features").$type<string[]>(),
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
    grantedBy: varchar("granted_by", { length: 50 }).notNull().default("admin"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_class_access_user_cefr_idx").on(table.userId, table.cefr),
  ]
);
