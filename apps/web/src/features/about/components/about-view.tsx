"use client";

import React from "react";
import { AboutNav } from "./about-nav";
import { AboutHero } from "./about-hero";
import { AboutStory } from "./about-story";
import { AboutGallery } from "./about-gallery";
import { AboutLeadership } from "./about-leadership";
import { AboutVisionMission } from "./about-vision-mission";
import { AboutCta } from "./about-cta";
import { LandingFooter } from "@/features/landing";

export function AboutView() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-accent selection:text-primary">
      {/* 1. Fixed Header Navigation matching Landing Page */}
      <AboutNav />

      {/* 2. Main Narrative Content with Soft Premier-to-White Gradients */}
      <main className="flex-1">
        <AboutHero />
        <AboutStory />
        <AboutGallery />
        <AboutLeadership />
        <AboutVisionMission />
        <AboutCta />
      </main>

      {/* 3. Footer matching Landing Page */}
      <LandingFooter />
    </div>
  );
}

