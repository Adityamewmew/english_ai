import { certificateRepository } from "../../repository/certificate_repository";

export const getMyCertificatesUsecase = async (userId: string) => {
  const userCerts = await certificateRepository.findUserCertificates(userId);
  const templates = await certificateRepository.findTemplates();
  const templateMap = new Map(templates.map((t) => [t.cefr, t]));

  return userCerts.map((cert) => {
    const template = templateMap.get(cert.cefrLevel);
    return {
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      userId: cert.userId,
      userName: cert.userName,
      cefrLevel: cert.cefrLevel,
      score: cert.score,
      structureScore: cert.structureScore ?? cert.score,
      readingScore: cert.readingScore ?? cert.score,
      listeningScore: cert.listeningScore ?? cert.score,
      dictationScore: cert.dictationScore ?? cert.score,
      conversationScore: cert.conversationScore ?? cert.score,
      compositionScore: cert.compositionScore ?? cert.score,
      grade:
        cert.grade ??
        (cert.score >= 89 ? "EXCELLENT" : cert.score >= 76 ? "GOOD" : "FAIR"),
      completedAt: cert.completedAt,
      issuedAt: cert.issuedAt,
      template: template
        ? {
            title: template.title,
            description: template.description,
            instructorName: template.instructorName,
            instructorTitle: template.instructorTitle,
            signatureUrl: template.signatureUrl,
            backgroundUrl: template.backgroundUrl,
            themeColor: template.themeColor,
          }
        : null,
    };
  });
};
