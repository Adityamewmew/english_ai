import { paymentRepository } from "../../repository/payment.repository";
import { classRepository } from "../../repository/class_repository";
import { NotFoundError, ValidationError } from "../../../common/errors/app-error";

export async function simulateSandboxPaymentUsecase(orderId: string) {
  const tx = await paymentRepository.findByOrderId(orderId);
  if (!tx) {
    throw new NotFoundError("Pesanan pembayaran tidak ditemukan.");
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
