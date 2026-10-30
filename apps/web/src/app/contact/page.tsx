import type { Metadata } from "next";
import { ContactView } from "@/features/contact";

export const metadata: Metadata = {
  title: "Kontak & Cabang Eddy's English Jember — EDDY'S AI",
  description:
    "Informasi kontak resmi, nomor telepon, WhatsApp, dan alamat lengkap 2 lokasi Eddy's English di Jember: Jl. Kalimantan No. 77 (Sekolah Bahasa Inggris) dan Jl. Tidar (Kantor Perusahaan).",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Kontak & Cabang Eddy's English Jember — EDDY'S AI",
    description:
      "Alamat lengkap 2 lokasi Eddy's English di Jember (Jl. Kalimantan No. 77 & Jl. Tidar), jam operasional, telepon resmi 0813-3671-2345, dan konsultasi via WhatsApp.",
    url: "/contact",
    siteName: "EDDY'S AI",
    locale: "id_ID",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactView />;
}

