import {
  pgTable,
  varchar,
  text,
  timestamp,
  bigserial,
  smallint,
  jsonb,
  boolean,
  decimal,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// 1. Wallets Table (Bavix Laravel Wallet)
export const wallets = pgTable(
  "wallets",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    holderType: varchar("holder_type", { length: 255 }).notNull(),
    holderId: varchar("holder_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    uuid: varchar("uuid", { length: 36 }).notNull().unique(),
    description: varchar("description", { length: 255 }),
    meta: jsonb("meta"),
    balance: decimal("balance", { precision: 64, scale: 0 }).notNull().default("0"),
    decimalPlaces: smallint("decimal_places").notNull().default(2),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("wallets_holder_slug_unique").on(table.holderType, table.holderId, table.slug),
    index("wallets_holder_idx").on(table.holderType, table.holderId),
    index("wallets_slug_idx").on(table.slug),
  ]
);

// 2. Transactions Table (Wallet Ledger)
export const walletTransactions = pgTable(
  "transactions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    payableType: varchar("payable_type", { length: 255 }).notNull(),
    payableId: varchar("payable_id", { length: 255 }).notNull(),
    walletId: bigserial("wallet_id", { mode: "number" }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // 'deposit', 'withdraw'
    amount: decimal("amount", { precision: 64, scale: 0 }).notNull(),
    confirmed: boolean("confirmed").notNull().default(true),
    meta: jsonb("meta"),
    uuid: varchar("uuid", { length: 36 }).notNull().unique(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("payable_type_payable_id_ind").on(table.payableType, table.payableId),
    index("payable_type_ind").on(table.payableType, table.payableId, table.type),
    index("payable_confirmed_ind").on(table.payableType, table.payableId, table.confirmed),
    index("transactions_wallet_id_idx").on(table.walletId),
    index("transactions_type_idx").on(table.type),
  ]
);

// 3. Transfers Table (Internal Wallet Transfers)
export const walletTransfers = pgTable(
  "transfers",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    fromId: bigserial("from_id", { mode: "number" }).notNull(),
    toId: bigserial("to_id", { mode: "number" }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("transfer"),
    statusLast: varchar("status_last", { length: 20 }),
    depositId: bigserial("deposit_id", { mode: "number" }).notNull(),
    withdrawId: bigserial("withdraw_id", { mode: "number" }).notNull(),
    discount: decimal("discount", { precision: 64, scale: 0 }).notNull().default("0"),
    fee: decimal("fee", { precision: 64, scale: 0 }).notNull().default("0"),
    uuid: varchar("uuid", { length: 36 }).notNull().unique(),
    extra: jsonb("extra"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("transfers_from_id_idx").on(table.fromId),
    index("transfers_to_id_idx").on(table.toId),
  ]
);

// 4. User Bank Accounts Table (Rekening Tujuan Penarikan)
export const userBankAccounts = pgTable(
  "user_bank_accounts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    bankCode: varchar("bank_code", { length: 20 }).notNull(),
    bankSwiftCode: varchar("bank_swift_code", { length: 20 }),
    bankName: varchar("bank_name", { length: 100 }).notNull(),
    accountNumber: varchar("account_number", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 150 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    createdBy: varchar("created_by", { length: 255 }),
    updatedBy: varchar("updated_by", { length: 255 }),
    deletedBy: varchar("deleted_by", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("user_bank_accounts_user_primary_idx").on(table.userId, table.isPrimary),
  ]
);

// 5. Withdrawals Table (Pengajuan & Transaksi Penarikan SingaPay)
export const withdrawals = pgTable(
  "withdrawals",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    bankAccountId: varchar("bank_account_id", { length: 36 }).notNull(),
    referenceNo: varchar("reference_no", { length: 100 }).notNull().unique(),
    singapayTrxId: varchar("singapay_trx_id", { length: 100 }),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    adminFee: decimal("admin_fee", { precision: 15, scale: 2 }).notNull().default("2500"),
    totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).notNull(),
    singapayCost: decimal("singapay_cost", { precision: 15, scale: 2 }).notNull().default("1200"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    notes: text("notes"),
    failureReason: text("failure_reason"),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("withdrawals_user_status_idx").on(table.userId, table.status),
    index("withdrawals_reference_no_idx").on(table.referenceNo),
  ]
);
