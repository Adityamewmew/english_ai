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

  const trimmedProof = proofUrl.trim();
  // SK19: Enforce strict format validation (valid image data URI or trusted HTTPS URL)
  const isImageDataUri = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmedProof);
  const isHttpsUrl = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/.*$/.test(trimmedProof);
  if (!isImageDataUri && !isHttpsUrl) {
    throw new ValidationError(
      "Format bukti transfer tidak valid. Harap unggah gambar bukti transfer dalam format JPEG, PNG, atau WEBP."
    );
  }

  if (trimmedProof.length > 5 * 1024 * 1024) {
    throw new ValidationError("Ukuran file bukti transfer melebihi batas maksimal 5MB.");
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
