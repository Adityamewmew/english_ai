"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  PhoneCall,
  MessageSquare,
  Award,
  GraduationCap,
  LogOut,
  PanelLeftClose,
  Loader2,
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
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state when navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

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
    { href: "/chat", icon: MessageSquare, label: "AI Study Chat" },
    { href: "/modules", icon: BookOpen, label: "Curriculum Modules" },
    { href: "/call", icon: PhoneCall, label: "AI Voice Call" },
    { href: "/placement", icon: Award, label: "CEFR Placement Test" },
    { href: "/certificates", icon: GraduationCap, label: "Sertifikat CEFR" },
  ];

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      setPendingHref(href);
    }
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
              <Link
                href="/dashboard"
                onClick={() => handleNavClick("/dashboard")}
                className="flex items-center gap-2 rounded-xl transition-transform active:scale-95"
              >
                <Image
                  src="/images/logo-academy.webp"
                  alt="EDDY'S AI Academy"
                  width={130}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
                />
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
            <nav className="space-y-1.5" aria-label="Sidebar Navigation">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isPending = pendingHref === item.href && !isActive;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm min-h-[44px] select-none transition-all duration-100 ease-out touch-manipulation focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0D3B66] focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-[0_2px_4px_rgba(13,59,102,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.96] active:translate-y-0.5 active:bg-[#082542] active:shadow-inner"
                        : isPending
                        ? "bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-slate-800 dark:text-white ring-1 ring-[#0D3B66]/30 font-extrabold shadow-inner scale-[0.98]"
                        : "text-slate-600 dark:text-slate-400 hover:text-[#0D3B66] dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 active:scale-[0.96] active:translate-y-0.5 active:bg-slate-200/90 dark:active:bg-slate-700/80 active:shadow-inner cursor-pointer"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[2.2] transition-transform duration-100 group-active:scale-95 ${
                        isActive
                          ? "text-[#F4B41A]"
                          : isPending
                          ? "text-[#0D3B66] dark:text-[#F4B41A]"
                          : ""
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D3B66] dark:text-[#F4B41A] ml-auto shrink-0" />
                    )}
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
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[44px] transition-all duration-100 active:scale-[0.96] active:translate-y-0.5 active:bg-rose-100/80 dark:active:bg-rose-900/40 active:shadow-inner cursor-pointer touch-manipulation select-none"
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
