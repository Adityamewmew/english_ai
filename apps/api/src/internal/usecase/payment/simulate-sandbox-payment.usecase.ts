import { paymentRepository } from "../../repository/payment.repository";
import { classRepository } from "../../repository/class_repository";
import { NotFoundError, ForbiddenError } from "../../../common/errors/app-error";
import { isUserAdmin } from "@english-ai/shared";

export async function simulateSandboxPaymentUsecase(
  orderId: string,
  user?: { id: string; role?: string | null; email?: string | null; accessType?: number | null } | null
) {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.env.SINGAPAY_ENVIRONMENT || "").toLowerCase() === "production";
  if (isProduction) {
    throw new ForbiddenError("Simulasi pembayaran dinonaktifkan di lingkungan produksi.");
  }

  const tx = await paymentRepository.findByOrderId(orderId);
  if (!tx) {
    throw new NotFoundError("Pesanan pembayaran tidak ditemukan.");
  }

  // Validate ownership: only order creator or admin can simulate
  if (user && tx.userId !== user.id && !isUserAdmin(user)) {
    throw new ForbiddenError("Anda tidak memiliki izin untuk mensimulasikan pesanan ini.");
  }

  if (tx.status === "paid") {
    return {
      message: "Pesanan ini sudah lunas sebelumnya.",
      transaction: tx,
    };
  }

  // Update status to paid
  const updatedTx = await paymentRepository.updateStatus(orderId, "paid", {
    paidAt: new Date(),
  });

  // Grant user access to the class automatically
  await classRepository.grantAccess(
    tx.userId,
    tx.cefr,
    tx.tier,
    "singapay_sandbox"
  );

  return {
    message: `Payment for order #${tx.orderId} successfully simulated! Class access for ${tx.cefr} (${tx.tier.toUpperCase()}) is now active.`,
    transaction: updatedTx,
  };
}
