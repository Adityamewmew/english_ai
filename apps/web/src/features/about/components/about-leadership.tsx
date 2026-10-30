"use client";

import React from "react";
import Image from "next/image";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";

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
          {/* Photo Column with Tactile Skeuomorphic Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="w-full max-w-md bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-lg relative"
              style={{
                boxShadow: "0 4px 0 #cbd5e1, 0 12px 24px rgba(16, 55, 92, 0.08)",
              }}
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                <Image
                  src="/about/workshop-tourism.webp"
                  alt="Mr. Khoirul Anwar, M.Pd. pada Konferensi & Workshop Internasional"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Konferensi &amp; Workshop Internasional
                  </div>
                  <div className="font-heading font-bold text-lg sm:text-xl text-white">
                    Mr. Khoirul Anwar, M.Pd.
                  </div>
                  <div className="text-xs text-slate-200">
                    Direktur Pendidikan Yayasan Eddys Edukasi Mandiri
                  </div>
                </div>
              </div>

              {/* Physical Stamp / Badge Accent */}
              <div
                className="absolute -top-3 -right-3 bg-primary text-white px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs shadow-md border-2 border-white flex items-center gap-1.5"
                style={{ boxShadow: "0 3px 8px rgba(16, 55, 92, 0.25)" }}
              >
                <Award className="w-3.5 h-3.5 text-accent" />
                <span>Mentor Utama</span>
              </div>
            </div>
          </div>

          {/* Narrative & Pedagogical Bridge to AI */}
          <div className="lg:col-span-7 space-y-6">
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
            <div
              className="p-5 sm:p-6 rounded-2xl bg-surface border border-slate-200/90 relative overflow-hidden"
              style={{
                boxShadow: "0 2px 0 #e2e8f0, inset 0 1px 1px rgba(255,255,255,0.7)",
              }}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-primary">
                    Dari Ruang Kelas Nyata ke AI Interaktif 24/7
                  </h3>
                  <p className="font-body text-sm text-slate-600 mt-1 leading-relaxed">
                    Karakter AI Tutor &ldquo;Mr. Khoirul&rdquo; di dalam platform EDDY&apos;S AI
                    bukan sekadar bot teks biasa. Karakter ini didesain mengadopsi persona, metodologi
                    koreksi ramah, serta kurikulum terstruktur yang telah teruji secara langsung di kelas-kelas nyata.
                  </p>
                </div>
              </div>
            </div>

            {/* Qualifications list */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kompetensi &amp; Rekam Jejak Akademik:
              </div>
              <ul className="space-y-2">
                {credentials.map((cred) => (
                  <li key={cred} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{cred}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

