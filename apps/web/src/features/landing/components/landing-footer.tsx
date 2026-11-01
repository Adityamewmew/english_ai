"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer id="kontak" className="bg-surface border-t border-slate-200/80 pt-14 pb-10 text-slate-600 font-body text-xs sm:text-sm relative z-10 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200/80">
          {/* ================= COL 1: BRAND & YAYASAN (4 COLS) ================= */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-academy.webp"
                alt="EDDY'S AI Academy"
                width={140}
                height={38}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>

            <p className="text-slate-600 leading-relaxed max-w-sm">
              Platform akselerasi speaking Bahasa Inggris dengan tutor AI personal Mr. Khoirul.
              Di bawah naungan yayasan pendidikan berpengalaman 40+ tahun.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300/80 shadow-2xs text-xs font-semibold text-primary">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
              <span>Terakreditasi Resmi BAN PAUD &amp; PNF</span>
            </div>
          </div>

          {/* ================= COL 2: PROGRAM BELAJAR (3 COLS) ================= */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Program Belajar
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/#alur" className="hover:text-primary transition-colors">
                  Placement Test CEFR
                </Link>
              </li>
              <li>
                <Link href="/#alur" className="hover:text-primary transition-colors">
                  Daily Essentials (A1–A2)
                </Link>
              </li>
              <li>
                <Link href="/#alur" className="hover:text-primary transition-colors">
                  Professional Fluency (B1–B2)
                </Link>
              </li>
              <li>
                <Link href="/#alur" className="hover:text-primary transition-colors">
                  Executive Mastery (C1–C2)
                </Link>
              </li>
              <li>
                <Link href="/#exam-prep" className="hover:text-primary transition-colors">
                  TOEFL Preparation
                </Link>
              </li>
              <li>
                <Link href="/#exam-prep" className="hover:text-primary transition-colors">
                  TOEIC Preparation
                </Link>
              </li>
              <li>
                <Link href="/#exam-prep" className="hover:text-primary transition-colors">
                  IELTS Preparation
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= COL 3: TAUTAN CEPAT (2 COLS) ================= */}
          <div className="lg:col-span-2 space-y-3">
            <div className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Navigasi
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/#beranda" className="hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#keunggulan" className="hover:text-primary transition-colors">
                  Keunggulan
                </Link>
              </li>
              <li>
                <Link href="/#alur" className="hover:text-primary transition-colors">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="/#biaya" className="hover:text-primary transition-colors">
                  Paket Biaya
                </Link>
              </li>
              <li>
                <Link href="/#exam-prep" className="hover:text-primary transition-colors">
                  Kelas Ujian (TOEFL/IELTS)
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Tanya Jawab
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Kontak &amp; Cabang
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= COL 4: LEGALITAS & KREDIBILITAS (3 COLS) ================= */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Kredibilitas &amp; Legal
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Berbadan Hukum dan SK Kemenhum
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Berijin Resmi Dinas Pendidikan Kabupaten
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Merk Eddy&apos;s Terdaftar di Hak Paten Kekayaan Intelektual
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Sertifikasi Resmi BAN PAUD &amp; PNF
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Accreditation Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            &copy; 2026 EDDY&apos;S AI. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Berbadan Hukum Resmi</span>
            <span>&bull;</span>
            <span>Ijin Resmi Dinas Pendidikan</span>
            <span>&bull;</span>
            <span>Mitra Resmi ETS (TOEFL ITP &amp; TOEIC)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
