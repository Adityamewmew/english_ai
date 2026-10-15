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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    animeButtonPop(e.currentTarget);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar overlay"
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Escape") onToggle();
          }}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden cursor-pointer animate-in fade-in duration-200"
        />
      )}

      <aside
        ref={asideRef}
        style={{
          width: isOpen ? 248 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className={`bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen overflow-hidden transition-shadow ${
          isOpen
            ? "fixed inset-y-0 left-0 z-50 shadow-2xl lg:shadow-none lg:sticky lg:top-0 lg:z-30"
            : "hidden lg:flex lg:sticky lg:top-0 lg:z-30"
        }`}
      >
        {/* Fixed inner width container prevents text wrapping or distortion during animation */}
        <div className="w-[248px] h-full flex flex-col justify-between p-5">
          {/* Header & Navigation */}
          <div className="space-y-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between px-1">
              <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0D3B66] border-b-2 border-[#082542] shadow-[0_1px_2px_rgba(13,59,102,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
                  <span className="text-[#F4B41A] font-black text-base tracking-tighter">E</span>
                </div>
                <div className="leading-none">
                  <span className="font-black text-[#0D3B66] dark:text-white text-sm tracking-tight block">
                    EDDY&apos;S <span className="text-[#F4B41A]">ENGLISH</span>
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
                className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-[#0D3B66] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm min-h-[44px] transition-all touch-manipulation ${
                      isActive
                        ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-[0_1px_2px_rgba(13,59,102,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]"
                        : "text-slate-600 dark:text-slate-400 hover:text-[#0D3B66] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 stroke-[2.2] ${isActive ? "text-[#F4B41A]" : ""}`} />
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
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[44px] transition-all cursor-pointer touch-manipulation"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
