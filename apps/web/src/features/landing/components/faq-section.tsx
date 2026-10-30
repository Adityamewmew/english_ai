"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "../data/faq-data";

export function FAQSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="faq" className="py-14 md:py-20 px-6 md:px-10 lg:px-12 relative bg-gradient-to-b from-white via-[#F4F6FF]/40 to-surface border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Compact Horizontal Header (Saves vertical space) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 mb-6 border-b border-slate-200/70">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10 mb-1">
              Tanya Jawab
            </span>
            <h2 className="font-heading font-semibold text-primary text-xl sm:text-2xl md:text-[28px] tracking-tight leading-snug">
              Pertanyaan <span className="font-bold">yang sering diajukan</span>
            </h2>
          </div>
          <p className="font-body text-xs text-slate-500 sm:pb-0.5">
            Jawaban ringkas seputar kurikulum, akses, dan sertifikasi.
          </p>
        </div>

        {/* Ultra-Compact 2x2 Grid (50% shorter vertical height) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {FAQ_ITEMS.map((item) => {
            const isOpen = !!openIds[item.id];

            return (
              <div
                key={item.id}
                className={`rounded-xl transition-all duration-150 overflow-hidden ${
                  isOpen
                    ? "border-2 border-primary/30 bg-gradient-to-b from-white to-[#f7f9ff]"
                    : "border border-slate-200/90 bg-white hover:border-slate-300"
                }`}
                style={
                  isOpen
                    ? {
                        boxShadow:
                          "0 4px 14px -2px rgba(16, 55, 92, 0.08), 0 1px 0 #cbd5e1, inset 0 1px 0 #ffffff",
                      }
                    : {
                        boxShadow: "0 1px 2px rgba(16, 55, 92, 0.04), 0 1px 0 #e2e8f0",
                      }
                }
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-3.5 px-4 text-left flex items-center justify-between gap-3 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-xs sm:text-sm text-primary leading-snug">
                    {item.question}
                  </span>

                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? "bg-primary border-primary text-white rotate-180"
                        : "bg-surface border-slate-200 text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3.5 pt-0">
                    <p className="pt-2 border-t border-slate-100 font-body text-xs text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
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
