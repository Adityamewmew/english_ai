"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { CONTACT_FAQS } from "../data/contact-data";
import { FadeIn } from "./fade-in";

export function ContactFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 px-5 sm:px-6 bg-gradient-to-b from-[#F4F6FF]/50 to-white border-t border-slate-200/80">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header with Fade */}
        <FadeIn delay={0} duration={600} className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
            <HelpCircle className="w-3.5 h-3.5 text-secondary" />
            <span>Tanya Jawab Layanan &amp; Kunjungan</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
            Pertanyaan Seputar Layanan &amp; Pendaftaran
          </h2>
          <p className="font-body text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Informasi praktis seputar kunjungan ke gedung Eddy&apos;s English, tes diagnostik, dan program bimbingan.
          </p>
        </FadeIn>

        {/* FAQ Accordion Items */}
        <div className="space-y-3.5">
          {CONTACT_FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <FadeIn key={idx} delay={80 + idx * 60} duration={500}>
                <div className="rounded-2xl border border-slate-200/90 border-b-3 border-b-slate-300/80 bg-white shadow-2xs overflow-hidden transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full min-h-[48px] p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-heading font-bold text-xs sm:text-sm md:text-base text-primary hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 font-body text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
