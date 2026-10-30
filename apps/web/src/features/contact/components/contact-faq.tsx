"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { CONTACT_FAQS } from "../data/contact-data";

export function ContactFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 bg-surface/40 border-t border-slate-200/60">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
            <HelpCircle className="w-3.5 h-3.5 text-secondary" />
            <span>Tanya Jawab Lokasi &amp; Pendaftaran</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-primary tracking-tight">
            Pertanyaan Seputar Layanan &amp; Kunjungan Kantor
          </h2>
        </div>

        <div className="space-y-3">
          {CONTACT_FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 border-b-[3px] border-b-slate-300/80 bg-white shadow-[0_3px_8px_-2px_rgba(16,55,92,0.04),inset_0_1px_0_#ffffff] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-heading font-bold text-xs sm:text-sm text-primary hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

