import { paymentRepository } from "../../repository/payment.repository";
import { NotFoundError, ValidationError } from "../../../common/errors/app-error";

export async function uploadTransferProofUsecase(orderId: string, proofUrl: string) {
  if (!proofUrl || !proofUrl.trim()) {
    throw new ValidationError("Bukti transfer wajib diunggah.");
  }

  const tx = await paymentRepository.findByOrderId(orderId);
  if (!tx) {
    throw new NotFoundError("Pesanan pembayaran tidak ditemukan.");
  }

  if (tx.status === "paid") {
    throw new ValidationError("Pesanan ini sudah lunas.");
  }

  if (tx.status === "expired") {
    throw new ValidationError("Batas waktu pembayaran untuk pesanan ini telah berakhir.");
  }

  const updated = await paymentRepository.updateTransferProof(orderId, proofUrl.trim());
  return {
    message: "Bukti transfer berhasil dikirim. Menunggu verifikasi dari admin.",
    transaction: updated,
  };
}
