import {
  pgTable,
  varchar,
  integer,
  text,
  timestamp,
  serial,
  smallint,
} from "drizzle-orm/pg-core";

// Payment Methods Table (Transfer Bank Manual)
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountName: varchar("account_name", { length: 150 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  bankLogo: text("bank_logo"),
  instructions: text("instructions"),
  isActive: smallint("is_active").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(1),
  createdBy: varchar("created_by", { length: 36 }),
  updatedBy: varchar("updated_by", { length: 36 }),
  deletedBy: varchar("deleted_by", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Payment Settings Table (WhatsApp Admin & Payment Configurations)
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
