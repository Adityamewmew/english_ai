import type { Metadata } from "next";
import { AboutView } from "@/features/about";

export const metadata: Metadata = {
  title: "Tentang Kami — Yayasan Eddys Edukasi Mandiri & EDDY'S AI",
  description:
    "Empat dekade membina kemahiran bahasa Inggris berstandar Cambridge di Indonesia. Sejarah pendiri mendiang Bapak Eddy Wartana, akreditasi BAN PAUD & PNF, hingga platform EDDY'S AI.",
};

export default function AboutPage() {
  return <AboutView />;
}

