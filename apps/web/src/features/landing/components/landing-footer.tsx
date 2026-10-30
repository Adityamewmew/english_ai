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
          {/* ================= COL 1: BRAND & YAYASAN (5 COLS) ================= */}
          <div className="lg:col-span-5 space-y-3.5">
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

          {/* ================= COL 2: PROGRAM BELAJAR (2 COLS) ================= */}
          <div className="lg:col-span-2 space-y-3">
            <div className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Program Belajar
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/modules" className="hover:text-primary transition-colors">
                  Placement Test CEFR
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-primary transition-colors">
                  Daily Essentials (A1–A2)
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-primary transition-colors">
                  Professional Fluency (B1–B2)
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-primary transition-colors">
                  Executive Mastery (C1–C2)
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
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Tanya Jawab
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors font-medium text-secondary">
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
                <span className="text-slate-700">Standar Kurikulum Cambridge</span>
              </li>
              <li>
                <span className="text-slate-700">Sertifikasi Resmi BAN PAUD &amp; PNF</span>
              </li>
              <li>
                <span className="text-slate-500">Kebijakan Privasi</span>
              </li>
              <li>
                <span className="text-slate-500">Syarat &amp; Ketentuan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Accreditation Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            &copy; 2026 EDDY&apos;S AI. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Standar Cambridge CEFR</span>
            <span>&bull;</span>
            <span>Yayasan Pendidikan Berpengalaman 40+ Tahun</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

