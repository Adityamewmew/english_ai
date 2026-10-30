"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, FileCheck2, Globe2 } from "lucide-react";
import { ABOUT_VISION_MISSION } from "../data/about-data";

export function AboutVisionMission() {
  const certifications = [
    {
      icon: ShieldCheck,
      title: "Akreditasi B Resmi",
      issuer: "BAN PAUD & PNF (Kemendikbud)",
      desc: "Menjamin mutu tata kelola lembaga, kompetensi pendidik, dan fasilitas pembelajaran.",
    },
    {
      icon: FileCheck2,
      title: "Badan Hukum Terdaftar",
      issuer: "Yayasan Eddys Edukasi Mandiri",
      desc: "Legalitas hukum resmi dari Kementerian Hukum dan HAM Republik Indonesia.",
    },
    {
      icon: Globe2,
      title: "Cambridge Framework",
      issuer: "CEFR A1 — C2 Alignment",
      desc: "Silabus dan kurikulum diselaraskan dengan standar kemahiran bahasa Eropa internasional.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F4F6FF]/50 via-white to-[#F4F6FF]/40 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10">
            Arah &amp; Kepatuhan
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
            Visi, Misi, &amp; Legalitas Lembaga
          </h2>
          <p className="font-body text-sm sm:text-base text-slate-600">
            Komitmen kami untuk menyelenggarakan pendidikan bahasa Inggris yang akuntabel,
            terstandar, dan berorientasi pada kemajuan nyata peserta didik.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Vision Card */}
          <div
            className="lg:col-span-5 bg-primary text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              boxShadow: "0 4px 0 #081d33, 0 10px 25px rgba(16, 55, 92, 0.2)",
            }}
          >
            <div className="relative z-10 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-heading font-bold uppercase tracking-wider">
                Visi Lembaga
              </span>
              <p className="font-heading font-bold text-xl sm:text-2xl text-white leading-relaxed">
                &ldquo;{ABOUT_VISION_MISSION.vision}&rdquo;
              </p>
            </div>
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-xs text-white/70">
              Ditetapkan sebagai pedoman utama tata kelola Yayasan Eddys Edukasi Mandiri.
            </div>
          </div>

          {/* Mission Card */}
          <div
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between"
            style={{
              boxShadow: "0 2px 0 #e2e8f0, 0 8px 20px rgba(16, 55, 92, 0.04)",
            }}
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10 mb-4">
                Misi Strategis
              </span>
              <ul className="space-y-4">
                {ABOUT_VISION_MISSION.missions.map((mission, index) => (
                  <li key={mission} className="flex items-start gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-md bg-surface text-primary font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                      0{index + 1}
                    </div>
                    <span className="font-body text-sm sm:text-base leading-relaxed">
                      {mission}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Certifications & Accreditation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
                style={{
                  boxShadow: "0 2px 0 #e2e8f0",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-slate-200 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-base text-primary">
                  {item.title}
                </h3>
                <div className="text-xs font-semibold text-secondary mt-0.5 mb-2">
                  {item.issuer}
                </div>
                <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

