"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { doLogout } from "@/app/(auth)/auth.actions";

interface StudentMobileHeaderProps {
  studentName?: string;
  currentCefr?: string;
}

export function StudentMobileHeader({
  studentName = "",
  currentCefr = "A1.1",
}: StudentMobileHeaderProps) {
  const initial = studentName ? studentName.charAt(0).toUpperCase() : "S";

  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 flex items-center justify-between shadow-2xs">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/images/logo-academy.webp"
          alt="EDDY'S AI Academy"
          width={115}
          height={32}
          className="h-7 w-auto object-contain"
          priority
        />
        <span className="text-[10px] font-bold text-slate-500 bg-surface px-1.5 py-0.5 rounded border border-slate-200">
          {currentCefr}
        </span>
      </Link>

      {/* Right: Student Avatar & Logout */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#0D3B66]/10 border border-[#0D3B66]/30 flex items-center justify-center text-[#0D3B66] font-bold text-xs">
          {initial}
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm("Keluar dari sesi akun?")) {
              doLogout();
            }
          }}
          title="Keluar akun"
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
