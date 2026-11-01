"use client";

import React from "react";
import { ABOUT_TIMELINE } from "../data/about-data";
import { FadeIn } from "./fade-in";

export function AboutStory() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-white via-[#FAFBFD] to-[#F4F6FF]/40 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-start">
          {/* Left Column: Founder Legacy & Narrative with Fade */}
          <FadeIn delay={0} duration={600} className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
              Warisan Pendiri
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight leading-tight">
              Dedikasi Mendiang Bapak Eddy Wartana untuk Kemajuan Generasi
            </h2>

            <div className="space-y-4 font-body text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>
                Perjalanan dimulai pada tahun 1980 di Jember, Jawa Timur. Mendiang Bapak Eddy Wartana
                mendirikan bimbingan belajar bahasa Inggris rumahan dengan satu tekad: membuka pintu
                peluang global bagi anak-anak daerah melalui kefasihan berkomunikasi.
              </p>
              <p>
                Pada tahun 1988, sekembalinya dari studi di Bell College, Inggris, beliau menjadi pelopor
                pengenalan standar British English di Jawa Timur. Beliau menggabungkan kurikulum nasional
                dengan pendekatan immersion praktis, melatih siswa untuk berani berbicara secara spontan
                tanpa rasa takut akan kekeliruan tata bahasa.
              </p>
            </div>

            {/* Tactile Founder Quote Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/90 border-b-4 border-b-slate-300/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden">
              <div className="text-4xl font-serif text-primary/20 leading-none select-none">
                &ldquo;
              </div>
              <p className="font-body italic text-slate-700 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Bahasa Inggris bukan sekadar mata pelajaran untuk dihafal di atas kertas,
                melainkan instrumen kepercayaan diri untuk melangkah ke panggung dunia.
              </p>
              <div className="mt-4 pt-3.5 border-t border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-xs text-primary">
                    Mendiang Bapak Eddy Wartana
                  </div>
                  <div className="text-[11px] text-slate-500 font-body">
                    Pendiri Yayasan Eddys Edukasi Mandiri &bull; Alumnus Bell College (1988)
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Column: Timeline Milestones 1980 - 2026 */}
          <div className="lg:col-span-7">
            <FadeIn delay={60} duration={500} className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10 mb-1.5">
                Rekam Jejak Historis
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-primary tracking-tight">
                Evolusi Lembaga (1980 &mdash; 2026)
              </h3>
            </FadeIn>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6">
              {ABOUT_TIMELINE.map((item, idx) => (
                <FadeIn
                  key={item.year}
                  delay={100 + idx * 70}
                  duration={500}
                >
                  <div className="group relative p-5 rounded-2xl bg-white border border-slate-200/90 border-b-3 border-b-slate-300/70 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                    {/* Timeline Dot Indicator */}
                    <div
                      className="absolute -left-[33px] sm:-left-[41px] top-6 w-4 h-4 rounded-full bg-white border-3 border-primary group-hover:border-secondary group-hover:scale-125 transition-all duration-300"
                      style={{ boxShadow: "0 0 0 3px #F4F6FF" }}
                    />

                    {/* Year Tag */}
                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-primary group-hover:bg-[#0c2a47] text-white text-[11px] font-heading font-bold tracking-tight transition-colors">
                      {item.year}
                    </div>

                    {/* Content */}
                    <h4 className="font-heading font-bold text-base text-primary mt-2">
                      {item.title}
                    </h4>
                    <p className="font-body text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
