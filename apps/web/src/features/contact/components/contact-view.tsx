"use client";

import React from "react";
import { ContactNav } from "./contact-nav";
import { ContactHero } from "./contact-hero";
import { ContactBranches } from "./contact-branches";
import { ContactFormSection } from "./contact-form-section";
import { ContactFaq } from "./contact-faq";
import { LandingFooter } from "@/features/landing";

export function ContactView() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-accent selection:text-primary">
      {/* 1. Header Navigation */}
      <ContactNav />

      {/* 2. Main Content */}
      <main className="flex-1">
        <ContactHero />
        <ContactBranches />
        <ContactFormSection />
        <ContactFaq />
      </main>

      {/* 3. Footer */}
      <LandingFooter />
    </div>
  );
}

