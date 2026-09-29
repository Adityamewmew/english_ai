"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  PhoneCall,
  ExternalLink,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { doLogout } from "@/app/(auth)/auth.actions";

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
}

export function AdminSidebar({
  adminName = "Administrator",
  adminEmail = "admin@eddy.ai",
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      title: "Katalog Modul",
      href: "/admin/modules",
      icon: BookOpen,
      active: pathname.startsWith("/admin/modules"),
    },
    {
      title: "Bank Soal",
      href: "/admin/questions",
      icon: HelpCircle,
      active: pathname.startsWith("/admin/questions"),
    },
    {
      title: "Manajemen Pengguna",
      href: "/users",
      icon: Users,
      active: pathname.startsWith("/users"),
    },
    {
      title: "Sesi Panggilan AI",
      href: "/admin/calls",
      icon: PhoneCall,
      active: pathname.startsWith("/admin/calls"),
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight block">
              EDDY&apos;S AI
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 block -mt-0.5">
              Admin Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                item.active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigasi Luar
          </span>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 flex-shrink-0 text-slate-500" />
            <span>Tampilan Siswa</span>
          </div>
        </Link>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-8 h-8 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {adminName.charAt(0)}
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-white block truncate">
                {adminName}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {adminEmail}
              </span>
            </div>
          </div>

          <form action={doLogout}>
            <button
              type="submit"
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
