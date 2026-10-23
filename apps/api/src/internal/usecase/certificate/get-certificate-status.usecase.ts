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
  nameXPercent?: number | null;
  nameYPercent?: number | null;
  nameFontSize?: number | null;
  scoresXPercent?: number | null;
  scoresYPercent?: number | null;
  scoresFontSize?: number | null;
  dateXPercent?: number | null;
  dateYPercent?: number | null;
  dateFontSize?: number | null;
  placeXPercent?: number | null;
  placeYPercent?: number | null;
  placeFontSize?: number | null;
  refNoXPercent?: number | null;
  refNoYPercent?: number | null;
  refNoFontSize?: number | null;
  orientation?: string | null;
  placeOfEntry?: string | null;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  averageScore: number;
  status: "unlocked" | "locked" | "no_template";
  certificate: {
    id: string;
    certificateNumber: string;
    score: number;
    scoresBreakdown?: any;
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
        orientation: "portrait",
        placeOfEntry: "PBN Kelapa Gading, D.18 Jember East Java",
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
      const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      const now = new Date();
      const romanMonth = romanMonths[now.getMonth()];
      const year2Digit = String(now.getFullYear()).slice(-2);
      const tierMap: Record<string, string> = { A1: "E", A2: "E", B1: "I", B2: "I", C1: "A", C2: "A" };
      const tier = tierMap[cefr] || "E";
      const totalCount = await certificateRepository.countCertificates();
      const sequenceNumber = String(totalCount + 1).padStart(3, "0");
      const certificateNumber = `EE-RC-${tier}-${cefr}-${romanMonth}/${year2Digit}-${sequenceNumber}`;

      const baseScore = Math.min(100, Math.max(60, stats.averageScore || 85));
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

      existingCert = await certificateRepository.createUserCertificate({
        id: certId,
        certificateNumber,
        userId,
        cefrLevel: cefr,
        userName: user?.name || "Student",
        score: baseScore,
        scoresBreakdown,
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
      nameXPercent: template.nameXPercent ?? 50,
      nameYPercent: template.nameYPercent ?? 34,
      nameFontSize: template.nameFontSize ?? 26,
      scoresXPercent: template.scoresXPercent ?? 50,
      scoresYPercent: template.scoresYPercent ?? 52,
      scoresFontSize: template.scoresFontSize ?? 10,
      dateXPercent: template.dateXPercent ?? 18,
      dateYPercent: template.dateYPercent ?? 80,
      dateFontSize: template.dateFontSize ?? 8,
      placeXPercent: template.placeXPercent ?? 50,
      placeYPercent: template.placeYPercent ?? 80,
      placeFontSize: template.placeFontSize ?? 8,
      refNoXPercent: template.refNoXPercent ?? 82,
      refNoYPercent: template.refNoYPercent ?? 80,
      refNoFontSize: template.refNoFontSize ?? 8,
      orientation: template.orientation ?? "portrait",
      placeOfEntry: template.placeOfEntry ?? "PBN Kelapa Gading, D.18 Jember East Java",
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
            scoresBreakdown: existingCert.scoresBreakdown,
            completedAt: existingCert.completedAt,
            issuedAt: existingCert.issuedAt,
          }
        : null,
    });
  }

  return result;
};
