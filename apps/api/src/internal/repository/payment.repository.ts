import { db } from "../../db";
import {
  paymentTransactions,
  paymentMethods,
  paymentSettings,
} from "../../db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export const paymentRepository = {
  createTransaction: async (data: typeof paymentTransactions.$inferInsert) => {
    const [inserted] = await db
      .insert(paymentTransactions)
      .values(data)
      .returning();
    return inserted;
  },

  findByOrderId: async (orderId: string) => {
    const [tx] = await db
      .select()
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.orderId, orderId),
          isNull(paymentTransactions.deletedAt)
        )
      )
      .limit(1);
    return tx || null;
  },

  findById: async (id: string) => {
    const [tx] = await db
      .select()
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.id, id),
          isNull(paymentTransactions.deletedAt)
        )
      )
      .limit(1);
    return tx || null;
  },

  updateStatus: async (
    orderId: string,
    status: string,
    extra?: {
      paidAt?: Date | null;
      approvedBy?: string | null;
      approvedAt?: Date | null;
      rejectionReason?: string | null;
      singapayPayload?: any;
    }
  ) => {
    const updatePayload: any = {
      status,
      updatedAt: new Date(),
    };

    if (extra?.paidAt !== undefined) updatePayload.paidAt = extra.paidAt;
    if (extra?.approvedBy !== undefined) updatePayload.approvedBy = extra.approvedBy;
    if (extra?.approvedAt !== undefined) updatePayload.approvedAt = extra.approvedAt;
    if (extra?.rejectionReason !== undefined) updatePayload.rejectionReason = extra.rejectionReason;
    if (extra?.singapayPayload !== undefined) updatePayload.singapayPayload = extra.singapayPayload;

    const [updated] = await db
      .update(paymentTransactions)
      .set(updatePayload)
      .where(eq(paymentTransactions.orderId, orderId))
      .returning();
    return updated;
  },

  updateTransferProof: async (orderId: string, proofUrl: string) => {
    const [updated] = await db
      .update(paymentTransactions)
      .set({
        transferProofUrl: proofUrl,
        status: "waiting_approval",
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.orderId, orderId))
      .returning();
    return updated;
  },

  getActiveManualBanks: async () => {
    return await db
      .select()
      .from(paymentMethods)
      .where(and(eq(paymentMethods.isActive, 1), isNull(paymentMethods.deletedAt)))
      .orderBy(paymentMethods.sortOrder);
  },

  getManualBankById: async (id: number) => {
    const [b] = await db
      .select()
      .from(paymentMethods)
      .where(and(eq(paymentMethods.id, id), isNull(paymentMethods.deletedAt)))
      .limit(1);
    return b || null;
  },

  getSettings: async () => {
    const rows = await db.select().from(paymentSettings);
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.value) map[r.key] = r.value;
    }
    return map;
  },
};
