import { paymentRepository } from "../../repository/payment.repository";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  UnauthorizedError,
} from "../../../common/errors/app-error";
import { isUserAdmin } from "@english-ai/shared";

export async function uploadTransferProofUsecase(
  orderId: string,
  proofUrl: string,
  user?: { id: string; role?: string | null; email?: string | null; accessType?: number | null } | null
) {
  if (!user) {
    throw new UnauthorizedError("Autentikasi diperlukan untuk mengunggah bukti transfer.");
  }

  if (!proofUrl || !proofUrl.trim()) {
    throw new ValidationError("Bukti transfer wajib diunggah.");
  }

  const tx = await paymentRepository.findByOrderId(orderId);
  if (!tx) {
    throw new NotFoundError("Pesanan pembayaran tidak ditemukan.");
  }

  // Validate ownership: only order creator or admin can upload proof (SK04)
  if (tx.userId !== user.id && !isUserAdmin(user)) {
    throw new ForbiddenError("Anda tidak memiliki izin untuk mengunggah bukti pada pesanan ini.");
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
