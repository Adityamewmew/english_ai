"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { createTimeline, stagger } from "animejs";
import { authClient } from "@/lib/auth-client";
import { useClasses } from "@/features/classes";
import { PRICING_TIERS } from "../data/pricing-data";

export function PricingSection() {
  const { data: session } = authClient.useSession();
  const { data: classesData } = useClasses();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          const cards = Array.from(
            containerEl.querySelectorAll<HTMLElement>(".pricing-tier-card")
          );
          const popularBadge = containerEl.querySelector(".popular-badge");
          const features = containerEl.querySelectorAll(".pricing-feature-item");

          const tl = createTimeline({
            autoplay: true,
            defaults: { ease: "outCubic" },
            onComplete: () => {
              // Reset transform inline style so CSS hover transitions operate cleanly
              cards.forEach((card) => {
                card.style.transform = "";
              });
            },
          });

          // 1. Staggered Card Lift Entrance
          cards.forEach((card, i) => {
            const isPop = card.classList.contains("pricing-card-popular");
            const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
            const targetY = isPop && isDesktop ? -8 : 0;

            tl.add(
              card,
              {
                opacity: [0, 1],
                translateY: [36, targetY],
                scale: [0.95, 1],
                duration: isPop ? 650 : 520,
                ease: isPop ? "outBack(1.2)" : "outCubic",
              },
              i * 120
            );
          });

          // 2. Tactile Pop on "REKOMENDASI" badge
          if (popularBadge) {
            tl.add(
              popularBadge,
              {
                opacity: [0, 1],
                scale: [0.65, 1],
                duration: 450,
                ease: "outBack(1.4)",
              },
              260
            );
          }

          // 3. Staggered Feature Checklist Cascade
          if (features.length > 0) {
            tl.add(
              Array.from(features),
              {
                opacity: [0, 1],
                translateX: [-6, 0],
                delay: stagger(25),
                duration: 320,
                ease: "outCubic",
              },
              320
            );
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(containerEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  const a1Class = classesData?.find((c) => c.cefr === "A1");

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section ref={containerRef} id="biaya" className="py-14 md:py-20 relative overflow-hidden scroll-mt-24 bg-gradient-to-b from-white via-[#F4F6FF]/40 to-white border-t border-slate-200/50">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-heading font-bold text-primary text-2xl sm:text-3xl tracking-tight">
              Pilihan Paket Belajar
            </h2>
            <p className="font-body text-slate-500 text-xs sm:text-sm mt-1">
              Akses materi berjenjang, latihan percakapan, dan koreksi tutor AI 24/7.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Bundling Hemat hingga 47%</span>
          </div>
        </div>

        {/* 3 Skeuomorphic Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const isPopular = tier.isPopular;
            const dbPlan = a1Class?.tierPlans?.[tier.id];
            const rawName = dbPlan?.name || tier.name;
            const name = rawName.replace(/\s*\([Aa]1\)/gi, "").replace(/\s*A1\b/gi, "").trim();
            const price = dbPlan?.price || tier.price;
            const originalPrice = dbPlan?.originalPrice || tier.originalPrice;
            const rawFeatures = dbPlan?.features && dbPlan.features.length > 0 ? dbPlan.features : tier.features;
            const features = rawFeatures.map((f) =>
              f.replace(/\s*(CEFR\s*)?A1\b/gi, "").trim()
            );

            return (
              <div
                key={tier.id}
                className={`pricing-tier-card ${
                  isPopular ? "pricing-card-popular" : ""
                } rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? "border border-[#184A78] border-b-6 border-b-[#061726] md:-translate-y-2 z-10 hover:md:-translate-y-3.5 hover:shadow-2xl"
                    : "border border-slate-200 border-b-4 border-b-slate-300 bg-white hover:-translate-y-1.5 hover:shadow-md"
                }`}
                style={
                  isPopular
                    ? {
                        background:
                          "linear-gradient(180deg, #184A78 0%, #10375C 45%, #0A243D 100%)",
                        boxShadow:
                          "0 24px 48px -12px rgba(16, 55, 92, 0.45), 0 8px 18px rgba(16, 55, 92, 0.2), inset 0 1.5px 1px rgba(255, 255, 255, 0.35)",
                      }
                    : {
                        boxShadow: "0 4px 12px rgba(16, 55, 92, 0.04), inset 0 1px 0 #FFFFFF",
                      }
                }
              >
                <div>
                  {/* Card Header */}
                  <div
                    className={`flex items-center justify-between gap-2 pb-2.5 border-b min-h-[36px] ${
                      isPopular ? "border-white/15" : "border-slate-100"
                    }`}
                  >
                    <span
                      className={`font-heading font-extrabold text-sm tracking-tight ${
                        isPopular ? "text-white drop-shadow-xs" : "text-primary"
                      }`}
                    >
                      {name}
                    </span>
                    {tier.badge && (
                      <span
                        className={`popular-badge text-[10px] font-heading font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                          isPopular
                            ? "bg-amber-300 text-[#10375C] shadow-xs border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-3.5 flex items-baseline gap-2">
                    <span
                      className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${
                        isPopular ? "text-white drop-shadow-xs" : "text-primary"
                      }`}
                    >
                      {formatRupiah(price)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isPopular ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      /bulan
                    </span>
                    {originalPrice && (
                      <span
                        className={`text-xs line-through ${
                          isPopular ? "text-blue-200/80 font-medium" : "text-slate-400"
                        }`}
                      >
                        {formatRupiah(originalPrice)}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                        isPopular
                          ? "text-white bg-white/15 border-white/25 backdrop-blur-xs"
                          : "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                      }`}
                    >
                      -{tier.savingsPercentage || 47}%
                    </span>
                  </div>

                  <p
                    className={`font-body text-xs mt-2 leading-relaxed min-h-[34px] ${
                      isPopular ? "text-blue-100 font-medium" : "text-slate-600"
                    }`}
                  >
                    {tier.description}
                  </p>

                  {/* Tactile Skeuomorphic Action Button */}
                  <div className="mt-4">
                    <Link
                      href={
                        session?.user
                          ? `/modules?tier=${tier.id}`
                          : `/register?tier=${tier.id}`
                      }
                      className={`w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-heading font-extrabold text-xs sm:text-[13px] transition-all active:translate-y-0.5 cursor-pointer ${
                        isPopular
                          ? "hover:bg-slate-100"
                          : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 border-b-3 border-b-slate-400 active:border-b-1 shadow-2xs"
                      }`}
                      style={
                        isPopular
                          ? {
                              background: "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)",
                              borderBottom: "3px solid #CBD5E1",
                              boxShadow:
                                "0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 #FFFFFF",
                              color: "#10375C",
                            }
                          : undefined
                      }
                    >
                      {tier.ctaText}
                    </Link>
                  </div>

                  {/* Features List */}
                  <div
                    className={`mt-5 pt-4 border-t space-y-2.5 ${
                      isPopular ? "border-white/15" : "border-slate-100"
                    }`}
                  >
                    {features.map((feature) => (
                      <div
                        key={feature}
                        className={`pricing-feature-item flex items-start gap-2.5 text-xs ${
                          isPopular ? "text-white/95" : "text-slate-700"
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 stroke-[2.5] ${
                            isPopular ? "text-amber-300" : "text-primary"
                          }`}
                        />
                        <span className="font-body font-medium leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Billing Trust Bar */}
        <div className="mt-8 pt-5 border-t border-slate-200/70 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium text-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Langganan fleksibel, bisa batal kapan saja
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Akses instan seluruh modul & AI tutor 24/7
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Garansi 7 hari uang kembali tanpa syarat
          </span>
        </div>
      </div>
    </section>
  );
}
