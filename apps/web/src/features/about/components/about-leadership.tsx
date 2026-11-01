"use client";

import React from "react";
import Image from "next/image";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";
import { FadeIn } from "./fade-in";

export function AboutLeadership() {
  const credentials = [
    "Magister Pendidikan Bahasa Inggris (M.Pd.) dengan fokus Applied Linguistics",
    "Praktisi & pengembang kurikulum berstandar Cambridge CEFR selama lebih dari 15 tahun",
    "Instruktur resmi Corporate Training & Business Speaking berbagai instansi korporasi",
    "Narasumber Workshop MGMP Guru Bahasa Inggris & Konferensi Internasional",
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F4F6FF]/30 via-white to-[#F4F6FF]/50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Photo Column - Tanpa Border & Rata Tengah with Fade */}
          <FadeIn delay={0} duration={600} className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-primary/15">
              <Image
                src="/about/mr-khoirul-portrait.webp"
                alt="Mr. Khoirul Anwar, M.Pd. - Direktur Pendidikan Yayasan Eddys Edukasi Mandiri"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 440px"
                quality={95}
                priority
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              {/* Stamp Badge Accent */}
              <div className="absolute top-4 right-4 bg-primary/95 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl font-heading font-bold text-xs shadow-md flex items-center gap-1.5 z-10">
                <Award className="w-3.5 h-3.5 text-accent" />
                <span>Mentor Utama</span>
              </div>

              {/* Caption Nama Tengah */}
              <div className="absolute bottom-5 left-5 right-5 text-white text-center z-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Master Trainer &amp; Kurikulum
                </div>
                <div className="font-heading font-bold text-lg sm:text-xl text-white mt-0.5">
                  Mr. Khoirul Anwar, M.Pd.
                </div>
                <div className="text-xs text-slate-200 mt-0.5">
                  Direktur Pendidikan Yayasan Eddys Edukasi Mandiri
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Narrative & Pedagogical Bridge to AI with Fade */}
          <FadeIn delay={120} duration={600} className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10">
              Kepemimpinan Akademik
            </div>

            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-primary tracking-tight leading-tight">
              Sosok di Balik Karakter Tutor &amp; Pedagogi EDDY&apos;S AI
            </h2>

            <p className="font-body text-slate-600 text-sm sm:text-base leading-relaxed">
              Mr. Khoirul Anwar, M.Pd. memimpin pengembangan kurikulum dan standar mutu akademik
              Yayasan Eddys Edukasi Mandiri. Berbekal pengalaman lebih dari satu dekade membina ribuan
              pelajar, guru MGMP, dan tenaga profesional, beliau memastikan setiap materi memiliki
              landasan linguistik yang kuat dan aplikatif.
            </p>

            {/* Bridge to AI Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/90 border-b-3 border-b-slate-300/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-primary">
                    Dari Ruang Kelas Nyata ke AI Interaktif 24/7
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Karakter AI Tutor &ldquo;Mr. Khoirul&rdquo; di dalam platform EDDY&apos;S AI
                    bukan sekadar bot teks biasa. Karakter ini didesain mengadopsi persona, metodologi
                    koreksi ramah, serta kurikulum terstruktur yang telah teruji secara langsung di kelas-kelas nyata.
                  </p>
                </div>
              </div>
            </div>

            {/* Qualifications list */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700">
                Kompetensi &amp; Rekam Jejak Akademik:
              </div>
              <ul className="space-y-2">
                {credentials.map((cred) => (
                  <li key={cred} className="group/item flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 transition-colors hover:text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.2] group-hover/item:scale-110 transition-transform duration-200" />
                    <span className="font-body leading-relaxed">{cred}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

