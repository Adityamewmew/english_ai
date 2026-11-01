"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // Show after scrolling past hero (~380px) and hide when near bottom/footer
      const isPastHero = scrollY > 380;
      const isNearFooter = windowHeight + scrollY >= docHeight - 340;

      setIsVisible(isPastHero && !isNearFooter);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!isVisible}
      className={`md:hidden fixed bottom-3 inset-x-3 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 border-b-3 border-b-slate-300/80 shadow-[0_12px_32px_-4px_rgba(16,55,92,0.18)] rounded-2xl p-2.5 px-3 flex items-center justify-between gap-3">
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1 text-xs font-heading font-extrabold text-primary truncate">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" />
            <span>Mulai Bicara Aktif</span>
          </div>
          <p className="text-[10.5px] font-body text-slate-500 truncate">
            Tes level CEFR gratis &amp; coba AI
          </p>
        </div>

        <Link
          href="/placement"
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl font-heading font-extrabold text-xs text-white bg-gradient-to-b from-[#184A78] to-[#10375C] active:translate-y-0.5 border border-[#1e588f] border-b-2 border-b-[#061726] shadow-sm cursor-pointer whitespace-nowrap"
        >
          <span>Tes Level Gratis</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent" />
        </Link>
      </div>
    </div>
  );
}

