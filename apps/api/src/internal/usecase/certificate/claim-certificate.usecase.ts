import { certificateRepository } from "../../repository/certificate_repository";
import { AppError, ConflictError, NotFoundError } from "../../../common/errors/app-error";

export const claimCertificateUsecase = async (
  userId: string,
  cefr: string
) => {
  const normalizedCefr = cefr.toUpperCase().trim();
  const validCefr = ["A1", "A2", "B1", "B2", "C1", "C2"];
  if (!validCefr.includes(normalizedCefr)) {
    throw new AppError(`Level CEFR '${cefr}' tidak valid.`, 400);
  }

  // Check if already claimed
  const existingCert = await certificateRepository.findUserCertificateByCefr(
    userId,
    normalizedCefr
  );
  if (existingCert) {
    throw new ConflictError(
      `Sertifikat level ${normalizedCefr} sudah pernah diklaim sebelumnya.`
    );
  }

  // Get user details
  const user = await certificateRepository.getUserById(userId);
  if (!user) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  // Check eligibility: all modules in this CEFR must be completed
  const stats = await certificateRepository.getCefrCategoryStats(
    userId,
    normalizedCefr
  );
  if (!stats.isEligible) {
    throw new AppError(
      `Anda belum menyelesaikan seluruh modul pada level ${normalizedCefr}. Progress: ${stats.completedModules}/${stats.totalModules} modul.`,
      400
    );
  }

  // Generate unique Certificate Number
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // e.g. 202610
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const certificateNumber = `EDDY-${normalizedCefr}-${dateStr}-${randomSuffix}`;

  const certId = crypto.randomUUID();
  const now = new Date();

  const cert = await certificateRepository.createUserCertificate({
    id: certId,
    certificateNumber,
    userId,
    cefrLevel: normalizedCefr,
    userName: user.name || "Student",
    score: stats.averageScore || 85,
  });

  const template = await certificateRepository.findTemplateByCefr(normalizedCefr);

  return {
    certificate: cert,
    template,
  };
};
