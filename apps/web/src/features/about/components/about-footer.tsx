"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function AboutFooter() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-xs border border-white/20">
              <Image
                src="/images/logo-academy.webp"
                alt="EDDY'S AI Academy"
                width={120}
                height={32}
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-xs text-slate-500">
              &bull; Yayasan Eddys Edukasi Mandiri
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <Link href="/about" className="text-white font-medium">
              Tentang Kami
            </Link>
            <Link href="/modules" className="hover:text-white transition-colors">
              Kurikulum
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Masuk
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Yayasan Eddys Edukasi Mandiri. Terakreditasi BAN PAUD &amp; PNF. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-[11px] text-slate-600">
            Platform Pembelajaran Bahasa Inggris Berbasis AI
          </p>
        </div>
      </div>
    </footer>
  );
}

