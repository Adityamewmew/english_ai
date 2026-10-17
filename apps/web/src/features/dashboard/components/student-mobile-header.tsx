"use client";

import React from "react";
import Link from "next/link";
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
        <div className="w-8 h-8 rounded-xl bg-[#0D3B66] border-b-2 border-[#082542] shadow-[0_1px_2px_rgba(13,59,102,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
          <span className="text-[#F4B41A] font-black text-xs">E</span>
        </div>
        <div className="leading-tight">
          <span className="font-black text-[#0D3B66] text-xs tracking-tight block">
            EDDY&apos;S <span className="text-[#F4B41A]">ENGLISH</span>
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Level {currentCefr}
          </span>
        </div>
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
