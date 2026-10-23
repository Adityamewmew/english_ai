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
    structureScore?: number | null;
    readingScore?: number | null;
    listeningScore?: number | null;
    dictationScore?: number | null;
    conversationScore?: number | null;
    compositionScore?: number | null;
    grade?: string | null;
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
      const count = await certificateRepository.countCertificatesByCefr(cefr);
      const runningNo = String(count + 1).padStart(3, "0");
      const certificateNumber = `EE-RC-A-${cefr}-${romanMonth}/${yy}-${runningNo}`;
      const certId = crypto.randomUUID();

      existingCert = await certificateRepository.createUserCertificate({
        id: certId,
        certificateNumber,
        userId,
        cefrLevel: cefr,
        userName: user?.name || "Student",
        score: stats.averageScore || 85,
        structureScore: stats.skills?.structureScore ?? 85,
        readingScore: stats.skills?.readingScore ?? 85,
        listeningScore: stats.skills?.listeningScore ?? 85,
        dictationScore: stats.skills?.dictationScore ?? 85,
        conversationScore: stats.skills?.conversationScore ?? 85,
        compositionScore: stats.skills?.compositionScore ?? 85,
        grade: stats.grade || "GOOD",
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
            structureScore:
              existingCert.structureScore ??
              stats.skills?.structureScore ??
              existingCert.score,
            readingScore:
              existingCert.readingScore ??
              stats.skills?.readingScore ??
              existingCert.score,
            listeningScore:
              existingCert.listeningScore ??
              stats.skills?.listeningScore ??
              existingCert.score,
            dictationScore:
              existingCert.dictationScore ??
              stats.skills?.dictationScore ??
              existingCert.score,
            conversationScore:
              existingCert.conversationScore ??
              stats.skills?.conversationScore ??
              existingCert.score,
            compositionScore:
              existingCert.compositionScore ??
              stats.skills?.compositionScore ??
              existingCert.score,
            grade: existingCert.grade ?? stats.grade ?? "GOOD",
            completedAt: existingCert.completedAt,
            issuedAt: existingCert.issuedAt,
          }
        : null,
    });
  }

  return result;
};
