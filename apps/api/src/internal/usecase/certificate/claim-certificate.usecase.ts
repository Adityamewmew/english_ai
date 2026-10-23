import { certificateRepository } from "../../repository/certificate_repository";
import { AppError, ConflictError, NotFoundError } from "../../../common/errors/app-error";
import { isUserAdmin } from "@english-ai/shared";

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

  // Check eligibility: all modules in this CEFR must be completed (admin bypass)
  const stats = await certificateRepository.getCefrCategoryStats(
    userId,
    normalizedCefr
  );
  const isAdmin = isUserAdmin(user);
  if (!stats.isEligible && !isAdmin) {
    throw new AppError(
      `Anda belum menyelesaikan seluruh modul pada level ${normalizedCefr}. Progress: ${stats.completedModules}/${stats.totalModules} modul.`,
      400
    );
  }

  // Generate official Eddy's Reference No.: EE-RC-{Tier}-{CEFR}-{RomanMonth}/{Year2Digit}-{Seq3Digit}
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const now = new Date();
  const romanMonth = romanMonths[now.getMonth()];
  const year2Digit = String(now.getFullYear()).slice(-2);
  
  const tierMap: Record<string, string> = {
    A1: "E",
    A2: "E",
    B1: "I",
    B2: "I",
    C1: "A",
    C2: "A",
  };
  const tier = tierMap[normalizedCefr] || "E";

  const totalCount = await certificateRepository.countCertificates();
  const sequenceNumber = String(totalCount + 1).padStart(3, "0");
  const certificateNumber = `EE-RC-${tier}-${normalizedCefr}-${romanMonth}/${year2Digit}-${sequenceNumber}`;

  // Hybrid 6-subject breakdown based on average score & official qualification standards
  const baseScore = Math.min(100, Math.max(60, stats.averageScore || (isAdmin ? 94 : 85)));
  const calcSubject = (offset: number) => Math.min(100, Math.max(60, baseScore + offset));

  const scoresBreakdown = {
    structureAndVocabulary: calcSubject(baseScore > 88 ? -1 : 1),
    readingComprehension: calcSubject(0),
    listeningComprehension: calcSubject(1),
    dictation: calcSubject(baseScore >= 88 ? 2 : -1),
    conversation: calcSubject(baseScore >= 85 ? 1 : 0),
    composition: calcSubject(-1),
    averageScore: baseScore,
    qualification: baseScore >= 89 ? "EXCELLENT" : baseScore >= 76 ? "GOOD" : "FAIR",
  };

  const certId = crypto.randomUUID();

  const cert = await certificateRepository.createUserCertificate({
    id: certId,
    certificateNumber,
    userId,
    cefrLevel: normalizedCefr,
    userName: user.name || "Student",
    score: baseScore,
    scoresBreakdown,
  });

  const template = await certificateRepository.findTemplateByCefr(normalizedCefr);

  return {
    certificate: cert,
    template,
  };
};
