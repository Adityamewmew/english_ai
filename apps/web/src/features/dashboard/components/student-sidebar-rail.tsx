"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  PhoneCall,
  Award,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import { doLogout } from "@/app/(auth)/auth.actions";
import { animeButtonPop, animeSidebarSlide } from "@/lib/anime-effects";

interface StudentSidebarRailProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function StudentSidebarRail({ isOpen, onToggle }: StudentSidebarRailProps) {
  const pathname = usePathname();
  const asideRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Trigger Anime.js width & opacity animation on open/close
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (asideRef.current) {
      animeSidebarSlide(asideRef.current, isOpen, 248);
    }
  }, [isOpen]);

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { href: "/modules", icon: BookOpen, label: "Curriculum Modules" },
    { href: "/call", icon: PhoneCall, label: "AI Voice Call" },
    { href: "/placement", icon: Award, label: "CEFR Placement Test" },
  ];

  return (
    <aside
      ref={asideRef}
      style={{
        width: isOpen ? 248 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      className="bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-40"
    >
      {/* Fixed inner width container prevents text wrapping or distortion during animation */}
      <div className="w-[248px] h-full flex flex-col justify-between p-5">
        {/* Header & Navigation */}
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="text-white font-black text-sm">E</span>
                </div>
              </div>
              <div className="leading-none">
                <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight block">
                  EDDY&apos;S <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mt-1">
                  Student Portal
                </span>
              </div>
            </Link>

            {/* Collapse Button with Anime.js */}
            <button
              type="button"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onToggle();
              }}
              title="Collapse sidebar"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => animeButtonPop(e.currentTarget)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <form action={doLogout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
