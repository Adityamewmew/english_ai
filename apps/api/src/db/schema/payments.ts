import {
  pgTable,
  varchar,
  integer,
  text,
  timestamp,
  serial,
  smallint,
  jsonb,
  index,
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

// Payment Transactions Table (Order / Invoice Konfirmasi Pembayaran)
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 50 }).notNull().unique(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  cefr: varchar("cefr", { length: 10 }).notNull(),
  tier: varchar("tier", { length: 20 }).notNull().default("basic"),
  paymentCategory: varchar("payment_category", { length: 30 }).notNull(), // 'va', 'qris', 'ewallet', 'manual_transfer'
  paymentChannel: varchar("payment_channel", { length: 50 }).notNull(), // 'BCA_VA', 'MANDIRI_VA', 'QRIS', 'GOPAY', dll
  amount: integer("amount").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'waiting_approval', 'paid', 'rejected', 'expired'
  vaNumber: varchar("va_number", { length: 50 }),
  qrData: text("qr_data"),
  qrImageUrl: text("qr_image_url"),
  transferProofUrl: text("transfer_proof_url"),
  rejectionReason: text("rejection_reason"),
  expiresAt: timestamp("expires_at").notNull(),
  paidAt: timestamp("paid_at"),
  approvedBy: varchar("approved_by", { length: 36 }),
  approvedAt: timestamp("approved_at"),
  singapayPayload: jsonb("singapay_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("idx_payment_tx_created_status").on(table.createdAt, table.status),
  index("idx_payment_tx_user_id").on(table.userId),
]);
