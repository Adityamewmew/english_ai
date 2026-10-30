"use client";

import React, { useState, useEffect, useRef } from "react";
import { createTimeline, animate, stagger } from "animejs";
import { HeroNavbar } from "./hero-navbar";
import { HeroStage } from "./hero-stage";
import { HeroStatsBar } from "./hero-stats-bar";
import { TrustCarouselSection } from "./trust-carousel-section";
import { FeatureSection } from "./feature-section";
import { HowItWorksSection } from "./how-it-works-section";
import { PricingSection } from "./pricing-section";
import { FAQSection } from "./faq-section";
import { LandingFooter } from "./landing-footer";
import { PreviewModal } from "./preview-modal";
import {
  DATA_MAP_HIGHLIGHTS,
  TUTOR_PROMPTS,
} from "../data/landing-data";

export function HeroSection() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [promptIndex, setPromptIndex] = useState<number>(0);
  const [isFlatMode, setIsFlatMode] = useState<boolean>(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    bodyText: string;
  }>({
    isOpen: false,
    title: "",
    bodyText: "",
  });

  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heroEl = heroSectionRef.current;
    if (!heroEl) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const waveEl = heroEl.querySelector(".hero-wave-anim");
    const headlineEl = heroEl.querySelector(".hero-headline-anim");
    const ctaEl = heroEl.querySelector(".hero-cta-anim");
    const stageEl = heroEl.querySelector(".hero-stage-anim");
    const statItems = heroEl.querySelectorAll(".hero-stat-anim-item");
    const phoneFloatEl = heroEl.querySelector(".hero-phone-float-wrapper");

    // 1. Entrance Choreography Timeline
    const tl = createTimeline({
      autoplay: true,
      defaults: {
        ease: "outCubic",
      },
    });

    if (waveEl) {
      tl.add(waveEl, {
        opacity: [0, 0.45],
        duration: 850,
        ease: "outQuad",
      }, 0);
    }

    if (headlineEl) {
      tl.add(headlineEl, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 550,
        ease: "outCubic",
      }, 60);
    }

    if (ctaEl) {
      tl.add(ctaEl, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 500,
        ease: "outCubic",
      }, "-=350");
    }

    if (stageEl) {
      tl.add(stageEl, {
        opacity: [0, 1],
        translateY: [32, 0],
        scale: [0.96, 1],
        duration: 700,
        ease: "outCubic",
      }, "-=350");
    }

    if (statItems.length > 0) {
      tl.add(Array.from(statItems), {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(75),
        duration: 450,
        ease: "outCubic",
      }, "-=400");
    }

    // 2. Ambient Floating on Smartphone AI Mockup (Continuous loop)
    let floatAnim: ReturnType<typeof animate> | null = null;
    if (phoneFloatEl) {
      floatAnim = animate(phoneFloatEl, {
        translateY: [-5, 5],
        duration: 3600,
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });
    }

    return () => {
      tl.revert();
      floatAnim?.revert();
    };
  }, []);

  const highlightData =
    DATA_MAP_HIGHLIGHTS[activeSection] || DATA_MAP_HIGHLIGHTS.dashboard;

  const handleTriggerVoiceDemo = () => {
    setPromptIndex((prev) => (prev + 1) % TUTOR_PROMPTS.length);
    const phoneEl = document.getElementById("phoneMockup");
    if (phoneEl) {
      phoneEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleSwitchHighlight = (section: string) => {
    setActiveSection(section);
    if (section === "voice") {
      handleTriggerVoiceDemo();
    }
  };

  const handleOpenModal = (title: string, bodyText: string) => {
    setModalState({
      isOpen: true,
      title,
      bodyText,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div id="beranda" className="min-h-screen flex flex-col bg-white selection:bg-accent selection:text-primary">
      {/* ================= NAVBAR ================= */}
      <HeroNavbar
        onSwitchHighlight={handleSwitchHighlight}
        onOpenModal={handleOpenModal}
        isFlatMode={isFlatMode}
        onToggleViewMode={() => setIsFlatMode(!isFlatMode)}
      />

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1">
        {/* ================= SECTION 1: HERO SECTION ================= */}
        <section
          ref={heroSectionRef}
          className="relative hero-aura pt-20 sm:pt-24 pb-14 sm:pb-16 md:pt-28 md:pb-16 overflow-hidden"
        >
          {/* Decorative Topographic Wave SVG Background */}
          <svg
            className="hero-wave-anim wave-lines absolute inset-x-0 top-32 w-full h-[520px] pointer-events-none opacity-45"
            viewBox="0 0 1440 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-100 280 C 220 120, 480 420, 820 220 C 1100 60, 1320 310, 1540 190"
              stroke="#10375C"
              strokeOpacity="0.12"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-100 330 C 260 170, 520 460, 860 260 C 1140 100, 1340 350, 1540 240"
              stroke="#10375C"
              strokeOpacity="0.05"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-100 380 C 300 220, 560 490, 900 300 C 1180 140, 1360 390, 1540 290"
              stroke="#10375C"
              strokeOpacity="0.08"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Hero Stage (Headline + 3D Dashboard + Smartphone) */}
          <HeroStage
            highlightData={highlightData}
            onSwitchHighlight={handleSwitchHighlight}
            currentPrompt={TUTOR_PROMPTS[promptIndex]}
            onTriggerVoiceDemo={handleTriggerVoiceDemo}
            isFlatMode={isFlatMode}
          />

          {/* Bottom Stats Bar Hero */}
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 relative z-10">
            <HeroStatsBar />
          </div>
        </section>

        {/* ================= SECTION 2: TRUST INDICATOR & LOGO CAROUSEL ================= */}
        <TrustCarouselSection onOpenModal={handleOpenModal} />

        {/* ================= SECTION 3: KEUNGGULAN PLATFORM (CHAOS & CLARITY BENTO) ================= */}
        <FeatureSection />

        {/* ================= SECTION 4: ALUR PEMBELAJARAN (HOW IT WORKS STEPPER) ================= */}
        <HowItWorksSection />

        {/* ================= SECTION 5: PAKET HARGA & BUNDLING (NEURAXIS STYLE) ================= */}
        <PricingSection />

        {/* ================= SECTION 6: TANYA JAWAB (FAQ INTERAKTIF) ================= */}
        <FAQSection />
      </main>

      {/* ================= FOOTER RESMI YAYASAN & CAMBRIDGE ================= */}
      <LandingFooter />

      {/* ================= MODAL INTERAKTIF ================= */}
      <PreviewModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        bodyText={modalState.bodyText}
        onClose={handleCloseModal}
      />
    </div>
  );
}
