"use client";

import React from "react";
import { ABOUT_TIMELINE } from "../data/about-data";

export function AboutStory() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-[#FAFBFD] to-[#F4F6FF]/40 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Founder Legacy & Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10">
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
            <div
              className="p-6 rounded-2xl bg-surface border border-slate-200/90 relative overflow-hidden"
              style={{
                boxShadow: "0 2px 0 #e2e8f0, inset 0 1px 1px rgba(255,255,255,0.8)",
              }}
            >
              <div className="text-3xl font-serif text-primary/30 leading-none select-none">
                &ldquo;
              </div>
              <p className="font-body italic text-slate-700 text-sm mt-1 leading-relaxed">
                Bahasa Inggris bukan sekadar mata pelajaran untuk dihafal di atas kertas,
                melainkan instrumen kepercayaan diri untuk melangkah ke panggung dunia.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-xs text-primary">
                    Mendiang Bapak Eddy Wartana
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pendiri Yayasan Eddys Edukasi Mandiri &bull; Alumnus Bell College (1988)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Milestones 1980 - 2026 */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10 mb-1">
                Rekam Jejak Historis
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-primary mt-1">
                Evolusi Lembaga (1980 &mdash; 2026)
              </h3>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8">
              {ABOUT_TIMELINE.map((item) => (
                <div key={item.year} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-white border-4 border-primary group-hover:scale-110 transition-transform"
                    style={{
                      boxShadow: "0 0 0 2px #F4F6FF",
                    }}
                  />

                  {/* Year Tag */}
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-primary text-white text-xs font-heading font-bold tracking-tight">
                    {item.year}
                  </div>

                  {/* Content */}
                  <h4 className="font-heading font-bold text-base sm:text-lg text-primary mt-2">
                    {item.title}
                  </h4>
                  <p className="font-body text-sm text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

