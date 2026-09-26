export interface CefrEquivalent {
  cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  ieltsBand: string;
  toeflScore: string;
  descriptionId: string;
  descriptionEn: string;
}

export const CEFR_MAPPINGS: Record<string, CefrEquivalent> = {
  A1: {
    cefr: "A1",
    ieltsBand: "2.0 - 3.0",
    toeflScore: "0 - 31",
    descriptionId: "Pemula (Beginner): Mengenali frasa dasar sehari-hari dan kalimat sederhana.",
    descriptionEn: "Beginner: Can understand and use familiar everyday expressions and very basic phrases.",
  },
  A2: {
    cefr: "A2",
    ieltsBand: "3.5 - 4.5",
    toeflScore: "32 - 45",
    descriptionId: "Dasar (Elementary): Mampu berkomunikasi dalam tugas rutin dan pertukaran informasi langsung.",
    descriptionEn: "Elementary: Can communicate in simple and routine tasks requiring direct exchange of information.",
  },
  B1: {
    cefr: "B1",
    ieltsBand: "4.5 - 5.5",
    toeflScore: "46 - 69",
    descriptionId: "Menengah (Intermediate): Mampu menguraikan pengalaman, impian, dan memberikan alasan singkat.",
    descriptionEn: "Intermediate: Can deal with most situations likely to arise whilst travelling and describe experiences.",
  },
  B2: {
    cefr: "B2",
    ieltsBand: "5.5 - 6.5",
    toeflScore: "70 - 93",
    descriptionId: "Menengah Atas (Upper-Intermediate): Berinteraksi dengan tingkat kefasihan dan spontanitas yang cukup.",
    descriptionEn: "Upper-Intermediate: Can interact with a degree of fluency and spontaneity with native speakers.",
  },
  C1: {
    cefr: "C1",
    ieltsBand: "7.0 - 8.0",
    toeflScore: "94 - 114",
    descriptionId: "Mahir (Advanced): Menggunakan bahasa secara fleksibel dan efektif untuk tujuan sosial, akademis, dan profesional.",
    descriptionEn: "Advanced: Can express ideas fluently and spontaneously without much obvious searching for expressions.",
  },
  C2: {
    cefr: "C2",
    ieltsBand: "8.5 - 9.0",
    toeflScore: "115 - 120",
    descriptionId: "Sangat Mahir (Mastery): Memahami dengan mudah hampir semua hal yang didengar atau dibaca.",
    descriptionEn: "Mastery: Can understand with ease virtually everything heard or read.",
  },
};

export function getCefrMapping(cefr: string): CefrEquivalent {
  return CEFR_MAPPINGS[cefr.toUpperCase()] || CEFR_MAPPINGS["A1"];
}

export function calculateCefrLevel(scorePercent: number): "A1" | "A2" | "B1" | "B2" | "C1" | "C2" {
  if (scorePercent >= 90) return "C2";
  if (scorePercent >= 80) return "C1";
  if (scorePercent >= 65) return "B2";
  if (scorePercent >= 50) return "B1";
  if (scorePercent >= 35) return "A2";
  return "A1";
}
