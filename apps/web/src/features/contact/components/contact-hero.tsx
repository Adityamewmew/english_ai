"use client";

import React from "react";
import { MessageSquare, Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { EDDYS_QUICK_CHANNELS } from "../data/contact-data";
import { FadeIn } from "./fade-in";

export function ContactHero() {
  const getIcon = (id: string) => {
    switch (id) {
      case "whatsapp":
        return <MessageSquare className="w-5 h-5" />;
      case "phone":
        return <Phone className="w-5 h-5" />;
      case "email":
        return <Mail className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <section className="relative hero-aura pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-18 overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(16,55,92,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10 space-y-8 sm:space-y-10">
        {/* Title & Headline with Fade */}
        <FadeIn delay={0} duration={600} className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-heading font-bold uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0 animate-pulse" />
            <span>Pusat Layanan Siswa &amp; Konsultasi Resmi</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight leading-[1.18]">
            Hubungi Kami di <span className="text-secondary">Eddy&apos;s English</span>
          </h1>

          <p className="font-body text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Lembaga pendidikan bahasa Inggris resmi di Jember sejak 1980. Tim konsultan akademik kami
            siap membantu konsultasi program kursus, tes penempatan CEFR, dan pendaftaran kelas.
          </p>

          {/* Quick Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-2xs font-heading font-bold">
              <Clock className="w-3.5 h-3.5 text-accent stroke-[2.2]" />
              <span>Respon WhatsApp &lt; 15 Menit</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-2xs font-heading font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span>Terakreditasi BAN PAUD &amp; PNF</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-2xs font-heading font-bold">
              <MapPin className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
              <span>Jl. Tawang Mangu No. 190, Jember</span>
            </span>
          </div>
        </FadeIn>

        {/* 3 Quick Action Cards with Staggered Fade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EDDYS_QUICK_CHANNELS.map((channel, idx) => {
            const isPrimary = channel.isPrimary;
            return (
              <FadeIn
                key={channel.id}
                delay={120 + idx * 80}
                duration={500}
                className="h-full"
              >
                <div
                  className={`h-full relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between text-left ${
                    isPrimary
                      ? "bg-gradient-to-b from-[#184A78] via-[#10375C] to-[#0A243D] text-white border border-[#1e588f] border-b-4 border-b-[#061726] shadow-[0_16px_32px_-8px_rgba(16,55,92,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-2xl hover:-translate-y-0.5"
                      : "bg-white border border-slate-200/90 border-b-4 border-b-slate-300/80 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {isPrimary && (
                    <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-accent text-[#10375C] font-heading font-black text-[10px] tracking-wider uppercase border border-white/60 shadow-xs">
                      Respon Cepat
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isPrimary
                            ? "bg-white/10 text-accent border border-white/15 shadow-2xs"
                            : "bg-primary/8 text-primary border border-primary/10 shadow-2xs"
                        }`}
                      >
                        {getIcon(channel.id)}
                      </div>
                      <div>
                        <div
                          className={`text-[10px] font-heading font-bold uppercase tracking-wider ${
                            isPrimary ? "text-amber-300" : "text-slate-500"
                          }`}
                        >
                          {channel.label}
                        </div>
                        <div
                          className={`font-heading font-bold text-base ${
                            isPrimary ? "text-white" : "text-primary"
                          }`}
                        >
                          {channel.title}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`font-mono font-bold text-base sm:text-lg tracking-tight px-3.5 py-2 rounded-xl ${
                        isPrimary
                          ? "bg-white/10 border border-white/15 text-white"
                          : "bg-slate-50 border border-slate-200/80 text-primary"
                      }`}
                    >
                      {channel.value}
                    </div>

                    <p
                      className={`font-body text-xs leading-relaxed ${
                        isPrimary ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {channel.description}
                    </p>
                  </div>

                  <div
                    className={`pt-5 mt-4 border-t ${
                      isPrimary ? "border-white/15" : "border-slate-100"
                    }`}
                  >
                    <a
                      href={channel.actionHref}
                      target={channel.actionHref.startsWith("http") ? "_blank" : undefined}
                      rel={channel.actionHref.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={`w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                        isPrimary
                          ? "text-[#10375C] bg-gradient-to-b from-white to-slate-100 hover:to-slate-200 border border-slate-200 border-b-3 border-b-slate-400 active:translate-y-0.5 shadow-sm"
                          : "text-primary bg-slate-50 hover:bg-slate-100 border border-slate-200/90 border-b-3 border-b-slate-300 active:translate-y-0.5 shadow-2xs"
                      }`}
                    >
                      <span>{channel.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
