"use client";

import React from "react";
import { Check, MessageCircle, HelpCircle } from "lucide-react";

interface ExamCard {
  id: string;
  badge: string;
  name: string;
  headline: string;
  description: string;
  features: string[];
  ctaUrl: string;
  isPopular?: boolean;
}

const EXAM_CARDS: ExamCard[] = [
  {
    id: "toefl",
    badge: "Official ETS Partner",
    name: "TOEFL ITP®",
    headline: "Syarat Kelulusan & BUMN",
    description: "Format tes akademik paper-based untuk wisuda S1/S2, CPNS, dan seleksi BUMN.",
    features: [
      "Drilling Structure & Written Expression",
      "Audio Listening resmi standar ETS",
      "Reading Comprehension & vocab mastery",
      "Simulasi prediksi skor berkala",
      "Sertifikat resmi terbitan ETS Princeton USA",
    ],
    ctaUrl:
      "https://wa.me/6281336712345?text=Halo%20Admin%20Eddy's%20AI%20Academy,%20saya%20ingin%20konsultasi%20kelas%20persiapan%20TOEFL%20ITP",
  },
  {
    id: "ielts",
    badge: "Rekomendasi Global",
    name: "IELTS™ Prep",
    headline: "Target Band 6.5 – 8.0+",
    description: "Persiapan intensif studi perguruan tinggi dunia, visa kerja, dan beasiswa internasional.",
    features: [
      "Simulasi interaktif Speaking Part 1, 2, 3",
      "Evaluasi instan Fluency & Grammar AI",
      "Koreksi Task 1 & Task 2 Writing",
      "Konsultasi 1-on-1 Master Trainer",
      "Kurikulum standar resmi IDP & British Council",
    ],
    ctaUrl:
      "https://wa.me/6281336712345?text=Halo%20Admin%20Eddy's%20AI%20Academy,%20saya%20ingin%20konsultasi%20kelas%20persiapan%20IELTS",
    isPopular: true,
  },
  {
    id: "toeic",
    badge: "Corporate Standard",
    name: "TOEIC® L&R",
    headline: "Dunia Kerja & Korporat",
    description: "Standar kemahiran bahasa Inggris kerja untuk BUMN, perbankan, dan multinasional.",
    features: [
      "Drilling 200 soal Business English L&R",
      "Kosakata kerja, negosiasi & korespondensi",
      "Analisis kelemahan per sub-kompetensi",
      "Penyusunan target skor kerja terarah",
      "Sertifikat resmi terbitan ETS USA",
    ],
    ctaUrl:
      "https://wa.me/6281336712345?text=Halo%20Admin%20Eddy's%20AI%20Academy,%20saya%20ingin%20konsultasi%20kelas%20persiapan%20TOEIC",
  },
];

export function ExamPrepSection() {
  return (
    <section
      id="exam-prep"
      className="py-14 md:py-20 relative overflow-hidden scroll-mt-24 bg-gradient-to-b from-white via-[#F4F6FF]/40 to-white border-t border-slate-200/50"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header - Rata Kanan */}
        <div className="flex flex-col items-end text-right mb-8 ml-auto max-w-2xl">
          <h2 className="font-heading font-bold text-primary text-2xl sm:text-3xl tracking-tight">
            Belajar TOEFL, IELTS &amp; TOEIC dengan <span className="text-secondary">Cara Baru</span>
          </h2>

          <p className="font-body text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Persiapan terarah standar resmi ETS &amp; Cambridge dengan simulasi AI dan konsultasi kurikulum Master Trainer di{" "}
            <strong className="text-primary font-semibold">EDDY&apos;S AI ACADEMY</strong>.
          </p>
        </div>

        {/* 3 Skeuomorphic Exam Cards - Struktur & Font Identik Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {EXAM_CARDS.map((exam) => {
            const isPopular = exam.isPopular;

            return (
              <div
                key={exam.id}
                className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? "border border-[#184A78] border-b-6 border-b-[#061726] md:-translate-y-2 z-10 hover:md:-translate-y-3.5 hover:shadow-2xl"
                    : "border border-slate-200 border-b-4 border-b-slate-300 bg-white hover:-translate-y-1.5 hover:shadow-md"
                }`}
                style={
                  isPopular
                    ? {
                        background:
                          "linear-gradient(180deg, #184A78 0%, #10375C 45%, #0A243D 100%)",
                        boxShadow:
                          "0 24px 48px -12px rgba(16, 55, 92, 0.45), 0 8px 18px rgba(16, 55, 92, 0.2), inset 0 1.5px 1px rgba(255, 255, 255, 0.35)",
                      }
                    : {
                        boxShadow: "0 4px 12px rgba(16, 55, 92, 0.04), inset 0 1px 0 #FFFFFF",
                      }
                }
              >
                <div>
                  {/* Card Header: Name + Badge */}
                  <div
                    className={`flex items-center justify-between gap-2 pb-2.5 border-b min-h-[36px] ${
                      isPopular ? "border-white/15" : "border-slate-100"
                    }`}
                  >
                    <span
                      className={`font-heading font-extrabold text-sm tracking-tight ${
                        isPopular ? "text-white drop-shadow-xs" : "text-primary"
                      }`}
                    >
                      {exam.name}
                    </span>
                    <span
                      className={`text-[10px] font-heading font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        isPopular
                          ? "bg-amber-300 text-[#10375C] shadow-xs border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {exam.badge}
                    </span>
                  </div>

                  {/* Headline Tag */}
                  <div className="mt-3.5">
                    <h3
                      className={`font-heading font-black text-xl sm:text-2xl tracking-tight leading-snug ${
                        isPopular ? "text-white drop-shadow-xs" : "text-primary"
                      }`}
                    >
                      {exam.headline}
                    </h3>
                  </div>

                  {/* Short Minimalist Description */}
                  <p
                    className={`font-body text-xs mt-2 leading-relaxed min-h-[36px] ${
                      isPopular ? "text-blue-100 font-medium" : "text-slate-600"
                    }`}
                  >
                    {exam.description}
                  </p>

                  {/* Action Button - Identik Tombol Pricing */}
                  <div className="mt-4">
                    <a
                      href={exam.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-heading font-extrabold text-xs sm:text-[13px] transition-all active:translate-y-0.5 cursor-pointer ${
                        isPopular
                          ? "hover:bg-slate-100"
                          : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 border-b-3 border-b-slate-400 active:border-b-1 shadow-2xs"
                      }`}
                      style={
                        isPopular
                          ? {
                              background:
                                "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)",
                              borderBottom: "3px solid #CBD5E1",
                              boxShadow:
                                "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 #FFFFFF",
                              color: "#10375C",
                            }
                          : undefined
                      }
                    >
                      Konsultasi &amp; Daftar Kelas
                    </a>
                  </div>

                  {/* Features List - Identik Format Checklist Pricing */}
                  <div
                    className={`mt-5 pt-4 border-t space-y-2.5 ${
                      isPopular ? "border-white/15" : "border-slate-100"
                    }`}
                  >
                    {exam.features.map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-start gap-2.5 text-xs ${
                          isPopular ? "text-white/95" : "text-slate-700"
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 stroke-[2.5] ${
                            isPopular ? "text-amber-300" : "text-primary"
                          }`}
                        />
                        <span className="font-body font-medium leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Callout Banner: Gradient Putih & Konsultasi Gratis */}
        <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-white/95 border border-slate-200 border-b-4 border-b-slate-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-heading font-bold uppercase tracking-wider">
              <HelpCircle className="w-3 h-3 text-secondary shrink-0" />
              <span>Panduan Penentuan Ujian</span>
            </div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-primary tracking-tight">
              Belum yakin memilih TOEFL, IELTS, atau TOEIC?
            </h3>
            <p className="font-body text-xs text-slate-500 max-w-xl leading-relaxed">
              Konsultasikan target skor dan tujuan studi atau karir Anda langsung dengan Master Trainer untuk panduan tes yang tepat.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/6281336712345?text=Halo%20Admin%20Eddy's%20AI%20Academy,%20saya%20ingin%20konsultasi%20gratis%20pemilihan%20kelas%20ujian%20TOEFL/IELTS/TOEIC"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#10375C] font-heading font-black text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 border-b-3 border-amber-600"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Konsultasi Gratis via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
