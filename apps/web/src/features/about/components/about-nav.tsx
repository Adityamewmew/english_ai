"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export function AboutNav() {
  const { data: session } = authClient.useSession();
  const navItems = [
    { id: "utama", label: "Utama", href: "/#beranda" },
    { id: "services", label: "Services", href: "/#services" },
    { id: "about", label: "About", href: "/about" },
    { id: "price", label: "Price", href: "/#biaya" },
    { id: "contact", label: "Contact", href: "/contact" },
  ];

  return (
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
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-102"
              priority
            />
          </Link>
        </div>

        {/* ================= 2. TENGAH: FLOATING PILL MENU ================= */}
        <div className="pointer-events-auto">
          <nav
            className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 px-2 sm:px-3 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06),0_2px_8px_rgb(0,0,0,0.04)]"
            aria-label="Navigasi Utama"
          >
            {navItems.map((item) => {
              const isActive = item.id === "about";
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

        {/* ================= 3. KANAN: AUTH STATE DINAMIS ================= */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5">
          {session?.user ? (
            <>
              <span className="hidden md:inline-block text-xs font-medium text-slate-600">
                Halo, <strong className="text-primary font-bold">{session.user.name?.split(" ")[0]}</strong>
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-heading font-bold text-white bg-primary hover:bg-primary/95 shadow-sm active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
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
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-heading font-bold text-slate-700 hover:text-primary hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                Masuk
              </Link>

              <Link
                href="/register"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-heading font-bold text-xs sm:text-[13px] text-white bg-primary hover:bg-primary/95 transition-all shadow-sm active:translate-y-0.5 cursor-pointer"
                style={{
                  boxShadow: "0 2px 0 #081d33, 0 4px 10px rgba(16, 55, 92, 0.2)",
                }}
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

