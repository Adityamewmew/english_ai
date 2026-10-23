import { apiClient } from "@/lib/api-client";

export interface CefrCertificateStatus {
  cefr: string;
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
  templateExists?: boolean;
  averageScore: number;
  status: "unlocked" | "locked" | "no_template" | "claimed" | "eligible";
  certificate: {
    id: string;
    certificateNumber: string;
    score: number;
    completedAt: string | Date;
    issuedAt: string | Date;
  } | null;
}

export interface UserCertificateItem {
  id: string;
  certificateNumber: string;
  userId: string;
  userName: string;
  cefrLevel: string;
  score: number;
  structureScore?: number | null;
  readingScore?: number | null;
  listeningScore?: number | null;
  dictationScore?: number | null;
  conversationScore?: number | null;
  compositionScore?: number | null;
  grade?: string | null;
  completedAt: string | Date;
  issuedAt: string | Date;
  template: {
    title: string;
    description: string | null;
    instructorName: string | null;
    instructorTitle: string | null;
    signatureUrl: string | null;
    backgroundUrl: string | null;
    themeColor: string | null;
  } | null;
}

export const certificatesApi = {
  getStatus: async (userId?: string, cefr?: string) => {
    const { data, error } = await apiClient.api.curriculum.certificates.status.get({
      query: {
        userId: userId || undefined,
        cefr: cefr || undefined,
      },
    });
    if (error) throw new Error(String(error.value));
    return (data?.data ?? []) as CefrCertificateStatus[];
  },

  claim: async (cefr: string, userId?: string) => {
    const { data, error } = await apiClient.api.curriculum.certificates.claim.post({
      cefr,
      userId,
    });
    if (error) {
      const errVal = error.value as any;
      const msg = errVal?.message || String(error.value);
      throw new Error(msg);
    }
    return data?.data;
  },

  getMyCertificates: async (userId?: string) => {
    const { data, error } = await apiClient.api.curriculum.certificates.my.get({
      query: userId ? { userId } : undefined,
    });
    if (error) throw new Error(String(error.value));
    return (data?.data ?? []) as UserCertificateItem[];
  },
};
