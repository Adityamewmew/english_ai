"use client";

import React, { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import {
  PARTNER_LOGOS_ROW_1,
  PARTNER_LOGOS_ROW_2,
  TRUST_INDICATORS,
} from "../data/landing-data";

interface TrustCarouselSectionProps {
  onOpenModal: (title: string, bodyText: string) => void;
}

export function TrustCarouselSection({ onOpenModal }: TrustCarouselSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  const row1Logos = [...PARTNER_LOGOS_ROW_1, ...PARTNER_LOGOS_ROW_1];
  const row2Logos = [...PARTNER_LOGOS_ROW_2, ...PARTNER_LOGOS_ROW_2];

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const counterEls = sectionEl.querySelectorAll<HTMLElement>(".trust-counter-val");

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          // 1. Staggered Pill subtle entrance
          const pills = sectionEl.querySelectorAll(".stat-pill-subtle");
          if (pills.length > 0) {
            animate(Array.from(pills), {
              scale: [0.94, 1],
              opacity: [0.7, 1],
              translateY: [8, 0],
              delay: stagger(80),
              duration: 450,
              ease: "outCubic",
            });
          }

          // 2. Count-up animation for each indicator (0 -> target)
          counterEls.forEach((counterEl) => {
            const target = parseInt(counterEl.dataset.target || "0", 10);
            const suffix = counterEl.dataset.suffix || "";
            const counterObj = { val: 0 };

            counterEl.textContent = `0${suffix}`;

            animate(counterObj, {
              val: target,
              duration: 1600,
              ease: "outExpo",
              onUpdate: () => {
                counterEl.textContent = `${Math.round(counterObj.val)}${suffix}`;
              },
              onComplete: () => {
                counterEl.textContent = `${target}${suffix}`;
              },
            });
          });
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="trustSection"
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-white via-[#FAFBFD] to-[#F4F6FF]/50 py-14 sm:py-20 overflow-hidden border-b border-slate-200/50"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading Simpel di Tengah (Persis Referensi Gambar) */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="font-heading font-semibold text-primary text-xl sm:text-2xl md:text-[28px] tracking-tight leading-snug">
            Dipercaya oleh <span className="font-bold">35+ perusahaan, BUMN &amp; institusi</span> terkemuka
          </h2>

          {/* Indikator Ringkas: Siswa Aktif (100+), Alumni (800+), Teacher (10) Mapped Cleanly */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm text-primary/80">
            {TRUST_INDICATORS.map((indicator, idx) => {
              const numericTarget = parseInt(indicator.count.replace(/[^0-9]/g, ""), 10);
              const suffix = indicator.count.replace(/[0-9]/g, "");

              return (
                <span
                  key={idx}
                  className="stat-pill-subtle px-3.5 py-1.5 rounded-2xl inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <strong
                    className="trust-counter-val font-heading font-bold text-primary tabular-nums"
                    data-target={numericTarget}
                    data-suffix={suffix}
                  >
                    {indicator.count}
                  </strong>
                  <span>{indicator.label}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* 2 Baris Logo Carousel Tanpa Kotak Card di Atas Background Putih Bersih */}
        <div className="logo-marquee-mask space-y-8 sm:space-y-10 py-2">
          {/* Baris 1: Bergerak Halus ke Kiri */}
          <div className="overflow-hidden">
            <div className="animate-marquee-left gap-10 sm:gap-14 pr-10 sm:pr-14">
              {row1Logos.map((item, idx) => (
                <button
                  key={`row1-${idx}`}
                  type="button"
                  onClick={() =>
                    onOpenModal(
                      `Mitra Pelatihan: ${item.name}`,
                      `${item.unit}\nProgram: ${item.program}`
                    )
                  }
                  title={`${item.name} (${item.unit}) — ${item.program}`}
                  className="group shrink-0 flex items-center justify-center h-12 sm:h-14 px-3 sm:px-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer focus:outline-none"
                >
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    width={140}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-[155px] object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 filter group-hover:brightness-105"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Baris 2: Bergerak Halus ke Kanan */}
          <div className="overflow-hidden">
            <div className="animate-marquee-right gap-10 sm:gap-14 pr-10 sm:pr-14">
              {row2Logos.map((item, idx) => (
                <button
                  key={`row2-${idx}`}
                  type="button"
                  onClick={() =>
                    onOpenModal(
                      `Mitra Pelatihan: ${item.name}`,
                      `${item.unit}\nProgram: ${item.program}`
                    )
                  }
                  title={`${item.name} (${item.unit}) — ${item.program}`}
                  className="group shrink-0 flex items-center justify-center h-12 sm:h-14 px-3 sm:px-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer focus:outline-none"
                >
                  <img
                    src={item.imageSrc}
                    alt={item.name}
                    width={140}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-8 sm:h-10 w-auto max-w-[130px] sm:max-w-[155px] object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 filter group-hover:brightness-105"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

