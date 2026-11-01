"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ContactNav() {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const { data: session } = authClient.useSession();

  const navItems = [
    { id: "utama", label: "Utama", href: "/#beranda" },
    { id: "services", label: "Services", href: "/#services" },
    { id: "about", label: "About", href: "/about" },
    { id: "price", label: "Price", href: "/#biaya" },
    { id: "contact", label: "Contact", href: "/contact" },
  ];

  const mobileNavLinks = [
    { label: "Beranda", href: "/#beranda" },
    { label: "Keunggulan & Metode AI", href: "/#keunggulan" },
    { label: "Alur Belajar", href: "/#alur" },
    { label: "Pilihan Paket Belajar", href: "/#biaya" },
    { label: "Kelas Ujian (TOEFL/IELTS)", href: "/#exam-prep" },
    { label: "Pertanyaan Umum (FAQ)", href: "/#faq" },
    { label: "Tentang Lembaga (40+ Thn)", href: "/about" },
    { label: "Kontak & Alamat Cabang", href: "/contact", isActive: true },
  ];

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 flex items-center justify-between">
          {/* ================= 1. KIRI: LOGO BRAND ================= */}
          <div className="pointer-events-auto">
            <Link
              href="/#beranda"
              className="flex items-center gap-2 group focus:outline-none"
              title="Kembali ke Beranda EDDY'S"
            >
              <Image
                src="/images/logo-academy.webp"
                alt="EDDY'S AI Academy"
                width={140}
                height={38}
                className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-102"
                priority
              />
            </Link>
          </div>

          {/* ================= 2. TENGAH: FLOATING PILL MENU (DESKTOP ONLY) ================= */}
          <div className="pointer-events-auto hidden md:block">
            <nav
              className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 px-2 sm:px-3 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06),0_2px_8px_rgb(0,0,0,0.04)]"
              aria-label="Navigasi Utama"
            >
              {navItems.map((item) => {
                const isActive = item.id === "contact";
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-[13px] font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "text-primary bg-slate-100 font-black shadow-2xs"
                        : "text-slate-600 hover:text-primary hover:bg-slate-100/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ================= 3. KANAN: AUTH & MOBILE TRIGGER ================= */}
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
            {session?.user ? (
              <>
                <span className="hidden lg:inline-block text-xs font-medium text-slate-600">
                  Halo, <strong className="text-primary font-bold">{session.user.name?.split(" ")[0]}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-heading font-bold text-white bg-primary hover:bg-primary/95 shadow-sm active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    boxShadow: "0 2px 0 #081d33, 0 4px 10px rgba(16, 55, 92, 0.2)",
                  }}
                >
                  <span>Dashboard</span>
                  <span>&rarr;</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-block text-xs sm:text-sm font-heading font-bold text-primary/80 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-white/80 transition-all cursor-pointer whitespace-nowrap"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-heading font-bold text-white bg-primary hover:bg-primary/95 shadow-sm active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    boxShadow: "0 2px 0 #081d33, 0 4px 10px rgba(16, 55, 92, 0.2)",
                  }}
                >
                  Mulai
                </Link>
              </>
            )}

            {/* HAMBURGER TOGGLE BUTTON (MOBILE ONLY) */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Buka Menu Navigasi"
              className="md:hidden w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-primary flex items-center justify-center shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 4. MOBILE SLIDE-OVER DRAWER ================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-5 sm:p-6 z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Image
                  src="/images/logo-academy.webp"
                  alt="EDDY'S AI Academy"
                  width={130}
                  height={35}
                  className="h-7 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Tutup Menu"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-5 space-y-1">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-heading font-bold text-sm transition-colors ${
                      link.isActive
                        ? "text-primary bg-slate-100 font-extrabold shadow-2xs"
                        : "text-slate-700 hover:text-primary hover:bg-slate-50"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-slate-100 space-y-3 mt-6">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-heading font-bold text-sm text-white bg-primary shadow-sm"
                >
                  <span>Buka Dashboard Siswa</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="inline-flex items-center justify-center py-2.5 rounded-xl font-heading font-bold text-xs text-primary bg-slate-100 hover:bg-slate-200 text-center transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className="inline-flex items-center justify-center py-2.5 rounded-xl font-heading font-bold text-xs text-white bg-primary text-center shadow-xs"
                  >
                    Daftar Akun
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-500 font-heading font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terakreditasi BAN PAUD &amp; PNF &bull; 1980</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
