import { certificateRepository } from "../../repository/certificate_repository";

export interface CefrCertificateStatus {
  cefr: string;
  templateExists: boolean;
  title: string;
  description: string | null;
  instructorName: string | null;
  instructorTitle: string | null;
  signatureUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  nameYPercent?: number | null;
  nameFontSize?: number | null;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  averageScore: number;
  status: "unlocked" | "locked" | "no_template";
  certificate: {
    id: string;
    certificateNumber: string;
    score: number;
    completedAt: Date;
    issuedAt: Date;
  } | null;
}

export const getCertificateStatusUsecase = async (
  userId: string,
  targetCefr?: string
): Promise<CefrCertificateStatus[]> => {
  // If targetCefr specified (e.g. "A1"), only evaluate that CEFR level
  const normalizedTarget = targetCefr ? targetCefr.slice(0, 2).toUpperCase() : undefined;
  const CEFR_LEVELS = normalizedTarget ? [normalizedTarget] : ["A1", "A2", "B1", "B2", "C1", "C2"];

  const templates = await certificateRepository.findTemplates();
  const userCerts = await certificateRepository.findUserCertificates(userId);
  const user = await certificateRepository.getUserById(userId);

  const templateMap = new Map(templates.map((t) => [t.cefr, t]));
  const certMap = new Map(userCerts.map((c) => [c.cefrLevel, c]));

  const result: CefrCertificateStatus[] = [];

  for (const cefr of CEFR_LEVELS) {
    const template = templateMap.get(cefr);
    let existingCert = certMap.get(cefr);

    const stats = await certificateRepository.getCefrCategoryStats(userId, cefr);

    // If template has not been created by admin yet
    if (!template) {
      result.push({
        cefr,
        templateExists: false,
        title: `Certificate of CEFR ${cefr} Proficiency`,
        description: null,
        instructorName: null,
        instructorTitle: null,
        signatureUrl: null,
        backgroundUrl: null,
        themeColor: "#0D3B66",
        totalModules: stats.totalModules,
        completedModules: stats.completedModules,
        progressPercent: stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0,
        averageScore: stats.averageScore,
        status: "no_template",
        certificate: null,
      });
      continue;
    }

    // Auto-issue certificate if all modules completed and not already issued
    if (!existingCert && stats.isEligible) {
      const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
      const randomSuffix = crypto.randomUUID().slice(0, 8).toUpperCase();
      const certificateNumber = `EDDY-${cefr}-${dateStr}-${randomSuffix}`;
      const certId = crypto.randomUUID();

      existingCert = await certificateRepository.createUserCertificate({
        id: certId,
        certificateNumber,
        userId,
        cefrLevel: cefr,
        userName: user?.name || "Student",
        score: stats.averageScore || 85,
      });
    }

    const isUnlocked = !!existingCert || stats.isEligible;
    const progressPercent =
      stats.totalModules > 0
        ? Math.min(100, Math.round((stats.completedModules / stats.totalModules) * 100))
        : 0;

    result.push({
      cefr,
      templateExists: true,
      title: template.title,
      description: template.description,
      instructorName: template.instructorName,
      instructorTitle: template.instructorTitle,
      signatureUrl: template.signatureUrl,
      backgroundUrl: template.backgroundUrl,
      themeColor: template.themeColor,
      nameYPercent: template.nameYPercent ?? 48,
      nameFontSize: template.nameFontSize ?? 36,
      totalModules: stats.totalModules,
      completedModules: stats.completedModules,
      progressPercent,
      averageScore: existingCert ? existingCert.score : stats.averageScore,
      status: isUnlocked ? "unlocked" : "locked",
      certificate: existingCert
        ? {
            id: existingCert.id,
            certificateNumber: existingCert.certificateNumber,
            score: existingCert.score,
            completedAt: existingCert.completedAt,
            issuedAt: existingCert.issuedAt,
          }
        : null,
    });
  }

  return result;
};
