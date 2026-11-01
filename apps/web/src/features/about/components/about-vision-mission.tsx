"use client";

import React from "react";
import { ShieldCheck, FileCheck2, Globe2 } from "lucide-react";
import { ABOUT_VISION_MISSION } from "../data/about-data";
import { FadeIn } from "./fade-in";

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
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-[#F4F6FF]/50 via-white to-[#F4F6FF]/40 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        {/* Section Header with Fade */}
        <FadeIn delay={0} duration={600} className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
            Arah &amp; Kepatuhan
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
            Visi, Misi, &amp; Legalitas Lembaga
          </h2>
          <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
            Komitmen kami untuk menyelenggarakan pendidikan bahasa Inggris yang akuntabel,
            terstandar, dan berorientasi pada kemajuan nyata peserta didik.
          </p>
        </FadeIn>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch mb-8 sm:mb-10">
          {/* Vision Card with Fade */}
          <FadeIn delay={80} duration={600} className="lg:col-span-5 h-full">
            <div className="h-full bg-gradient-to-b from-[#184A78] via-[#10375C] to-[#0A243D] text-white rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col justify-between relative overflow-hidden border border-[#1e588f] border-b-6 border-b-[#061726] shadow-[0_20px_40px_-12px_rgba(16,55,92,0.45),inset_0_1.5px_1px_rgba(255,255,255,0.25)] hover:shadow-2xl transition-all duration-300">
              <div className="relative z-10 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-300 text-[#10375C] text-xs font-heading font-black uppercase tracking-wider shadow-2xs">
                  Visi Lembaga
                </span>
                <p className="font-heading font-bold text-xl sm:text-2xl text-white leading-relaxed">
                  &ldquo;{ABOUT_VISION_MISSION.vision}&rdquo;
                </p>
              </div>
              <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-xs text-blue-100/80 font-body">
                Ditetapkan sebagai pedoman utama tata kelola Yayasan Eddys Edukasi Mandiri.
              </div>
            </div>
          </FadeIn>

          {/* Mission Card with Fade */}
          <FadeIn delay={160} duration={600} className="lg:col-span-7 h-full">
            <div className="h-full bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/90 border-b-4 border-b-slate-300/80 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10 mb-4">
                  Misi Strategis
                </span>
                <ul className="space-y-4">
                  {ABOUT_VISION_MISSION.missions.map((mission, index) => (
                    <li
                      key={mission}
                      className="group/item flex items-start gap-3.5 text-slate-700 transition-transform duration-200 hover:translate-x-1"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/8 text-primary font-heading font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-primary/15 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                        0{index + 1}
                      </div>
                      <span className="font-body text-xs sm:text-sm leading-relaxed">
                        {mission}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Certifications & Accreditation Cards with Fade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {certifications.map((item, idx) => {
            const Icon = item.icon;
            return (
              <FadeIn
                key={item.title}
                delay={100 + idx * 80}
                duration={500}
                className="h-full"
              >
                <div className="h-full group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 border-b-4 border-b-slate-300/80 shadow-[0_4px_16px_rgba(16,55,92,0.04)] hover:shadow-xl hover:shadow-slate-300/40 hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    <Icon className="w-5 h-5 transition-colors" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-primary">
                    {item.title}
                  </h3>
                  <div className="text-xs font-heading font-bold text-secondary mt-0.5 mb-2">
                    {item.issuer}
                  </div>
                  <p className="font-body text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
