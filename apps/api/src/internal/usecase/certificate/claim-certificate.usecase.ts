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

  // Generate Official Reference Number: EE-RC-A-{CEFR}-{ROMAN_MONTH}/{YY}-{RUNNING_NO}
  const romanMonths = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  const now = new Date();
  const romanMonth = romanMonths[now.getMonth()];
  const yy = String(now.getFullYear()).slice(-2);
  const count = await certificateRepository.countCertificatesByCefr(normalizedCefr);
  const runningNo = String(count + 1).padStart(3, "0");
  const certificateNumber = `EE-RC-A-${normalizedCefr}-${romanMonth}/${yy}-${runningNo}`;

  const certId = crypto.randomUUID();

  const cert = await certificateRepository.createUserCertificate({
    id: certId,
    certificateNumber,
    userId,
    cefrLevel: normalizedCefr,
    userName: user.name || "Student",
    score: stats.averageScore || 85,
    structureScore: stats.skills?.structureScore ?? 85,
    readingScore: stats.skills?.readingScore ?? 85,
    listeningScore: stats.skills?.listeningScore ?? 85,
    dictationScore: stats.skills?.dictationScore ?? 85,
    conversationScore: stats.skills?.conversationScore ?? 85,
    compositionScore: stats.skills?.compositionScore ?? 85,
    grade: stats.grade || "GOOD",
  });

  const template = await certificateRepository.findTemplateByCefr(normalizedCefr);

  return {
    certificate: cert,
    template,
  };
};
