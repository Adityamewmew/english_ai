"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  MessageSquare,
  PhoneCall,
  Award,
  Lock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePlacementAdvancementGate } from "@/features/placement/hooks/use-placement-advancement-gate";

interface StudentMobileBottomNavProps {
  userId?: string;
  currentCefr?: string;
}

export function StudentMobileBottomNav({ userId, currentCefr }: StudentMobileBottomNavProps = {}) {
  const pathname = usePathname();
  const { data: sessionData } = authClient.useSession();
  const activeUserId = userId || sessionData?.user?.id;
  const activeCefr = currentCefr || (sessionData?.user as any)?.currentCefr || "A1";
  const { isLocked: isPlacementLocked } = usePlacementAdvancementGate(activeUserId, activeCefr);

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, label: "Home" },
    { href: "/modules", icon: BookOpen, label: "Modules" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/call", icon: PhoneCall, label: "Call" },
    { href: "/placement", icon: Award, label: "CEFR Test" },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-3px_12px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1"
    >
      <div className="grid grid-cols-5 items-center justify-around px-2 max-w-md mx-auto h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1 rounded-xl transition-all duration-100 ease-out select-none active:scale-[0.88] active:translate-y-0.5 ${
                isActive
                  ? "text-[#0D3B66]"
                  : "text-slate-500 hover:text-slate-700 active:text-[#0D3B66]"
              }`}
            >
              {/* Skeuomorphic Icon Pill */}
              <div
                className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-[#0D3B66] text-[#F4B41A] shadow-[0_2px_4px_rgba(13,59,102,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border-b-2 border-[#082542]"
                    : "bg-transparent text-slate-500"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                  {item.href === "/placement" && isPlacementLocked && (
                    <span className="absolute -top-1.5 -right-2.5 w-3 h-3 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Lock className="w-2 h-2" />
                    </span>
                  )}
                </div>
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-medium leading-none truncate max-w-[56px] ${
                  isActive ? "font-bold text-[#0D3B66]" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
