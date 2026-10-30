export interface PricingTier {
  id: "basic" | "pro" | "ultra";
  name: string;
  badge?: string;
  description: string;
  price: number;
  originalPrice?: number;
  savingsPercentage?: number;
  isPopular?: boolean;
  ctaText: string;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "basic",
    name: "Paket Basic",
    description: "Untuk latihan mandiri dengan bimbingan tutor AI setiap hari.",
    price: 97000,
    originalPrice: 162000,
    savingsPercentage: 40,
    ctaText: "Pilih Paket Basic",
    features: [
      "Akses seluruh modul kurikulum",
      "20 pesan chat AI per hari",
      "5 menit voice call per hari",
      "Kuis latihan & evaluasi progres",
      "Sertifikat resmi kelulusan",
    ],
  },
  {
    id: "pro",
    name: "Paket Pro",
    badge: "Rekomendasi",
    description: "Untuk melatih refleks bicara aktif dengan koreksi grammar.",
    price: 149000,
    originalPrice: 249000,
    savingsPercentage: 47,
    isPopular: true,
    ctaText: "Pilih Paket Pro",
    features: [
      "Akses seluruh modul kurikulum",
      "100 pesan chat AI per hari",
      "30 menit voice call per hari",
      "Koreksi grammar & aksen langsung",
      "Prioritas respon tutor AI",
      "Sertifikat resmi kelulusan",
    ],
  },
  {
    id: "ultra",
    name: "Paket Ultra",
    badge: "Paling Lengkap",
    description: "Akses tanpa kuota harian untuk persiapan karir & wawancara.",
    price: 246000,
    originalPrice: 411000,
    savingsPercentage: 40,
    ctaText: "Pilih Paket Ultra",
    features: [
      "Akses seluruh modul kurikulum",
      "Chat AI tanpa batas harian",
      "120 menit voice call per hari",
      "Simulasi wawancara & skenario kerja",
      "Prioritas respon tercepat",
      "Sertifikat resmi kelulusan",
    ],
  },
];
