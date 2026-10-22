import { certificateRepository } from "../../repository/certificate_repository";

export interface CefrCertificateStatus {
  cefr: string;
  title: string;
  description: string | null;
  instructorName: string | null;
  instructorTitle: string | null;
  signatureUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  averageScore: number;
  status: "claimed" | "eligible" | "locked";
  certificate: {
    id: string;
    certificateNumber: string;
    score: number;
    completedAt: Date;
    issuedAt: Date;
  } | null;
}

export const getCertificateStatusUsecase = async (
  userId: string
): Promise<CefrCertificateStatus[]> => {
  const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const templates = await certificateRepository.findTemplates();
  const userCerts = await certificateRepository.findUserCertificates(userId);

  const templateMap = new Map(templates.map((t) => [t.cefr, t]));
  const certMap = new Map(userCerts.map((c) => [c.cefrLevel, c]));

  const result: CefrCertificateStatus[] = [];

  for (const cefr of CEFR_LEVELS) {
    const template = templateMap.get(cefr);
    const existingCert = certMap.get(cefr);

    const stats = await certificateRepository.getCefrCategoryStats(userId, cefr);

    let status: "claimed" | "eligible" | "locked" = "locked";
    if (existingCert) {
      status = "claimed";
    } else if (stats.isEligible) {
      status = "eligible";
    }

    const progressPercent =
      stats.totalModules > 0
        ? Math.min(100, Math.round((stats.completedModules / stats.totalModules) * 100))
        : 0;

    result.push({
      cefr,
      title: template?.title ?? `Certificate of CEFR ${cefr} Proficiency`,
      description: template?.description ?? null,
      instructorName: template?.instructorName ?? "EDDY'S Academic Council",
      instructorTitle: template?.instructorTitle ?? "Director of Language Assessment",
      signatureUrl: template?.signatureUrl ?? null,
      backgroundUrl: template?.backgroundUrl ?? null,
      themeColor: template?.themeColor ?? "#0D3B66",
      totalModules: stats.totalModules,
      completedModules: stats.completedModules,
      progressPercent,
      averageScore: existingCert ? existingCert.score : stats.averageScore,
      status,
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
