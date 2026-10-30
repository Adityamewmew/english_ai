"use client";

import React from "react";
import { MessageSquare, Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { EDDYS_QUICK_CHANNELS } from "../data/contact-data";

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
    <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 relative overflow-hidden bg-gradient-to-b from-surface/80 via-white to-white">
      {/* Decorative Aura */}
      <div className="absolute top-0 inset-x-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(16,55,92,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8 sm:space-y-10">
        {/* Title & Headline */}
        <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-heading font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span>Pusat Informasi &amp; Pendaftaran Jember</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-4xl md:text-[42px] tracking-tight leading-tight text-primary">
            Hubungi Kami di <span className="text-secondary">Eddy&apos;s English</span>
          </h1>

          <p className="font-body text-slate-600 text-sm sm:text-base leading-relaxed">
            Pusat bimbingan bahasa Inggris resmi di Jember sejak 1980. Hubungi customer service kami atau kunjungi 2 lokasi resmi kami di Jl. Kalimantan No. 77 dan Jl. Tidar untuk konsultasi kelas, tes CEFR, dan program korporat.
          </p>

          {/* Quick Badges */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-accent stroke-[2.2]" />
              <span className="font-medium">Respon WA &lt; 15 Menit</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span className="font-medium">Terakreditasi BAN PAUD &amp; PNF</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
              <span className="font-medium">2 Lokasi Resmi di Jember</span>
            </span>
          </div>
        </div>

        {/* 3 Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {EDDYS_QUICK_CHANNELS.map((channel) => {
            const isPrimary = channel.isPrimary;
            return (
              <div
                key={channel.id}
                className={`relative rounded-2xl p-5 sm:p-6 transition-all flex flex-col justify-between text-left ${
                  isPrimary
                    ? "bg-gradient-to-b from-white via-white to-[#F4F6FF]/70 border-2 border-[#F4B41A] border-b-[5px] border-b-[#C29200] shadow-[0_12px_28px_-6px_rgba(244,180,26,0.25),inset_0_1.5px_1px_#ffffff] hover:-translate-y-0.5"
                    : "bg-gradient-to-b from-white to-slate-50/60 border border-slate-200 border-b-[4px] border-b-slate-300/90 shadow-[0_8px_20px_-6px_rgba(16,55,92,0.06),inset_0_1.5px_1px_#ffffff] hover:-translate-y-0.5"
                }`}
              >
                {isPrimary && (
                  <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#F4B41A] to-[#EB8317] text-slate-950 font-heading font-black text-[10px] tracking-wider uppercase border border-white/60 shadow-[0_2px_4px_rgba(194,146,0,0.4)]">
                    Paling Cepat
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isPrimary
                          ? "bg-gradient-to-b from-primary to-[#092238] text-accent border border-white/20 shadow-[0_3px_0_#051320,inset_0_1px_1px_rgba(255,255,255,0.35)]"
                          : "bg-gradient-to-b from-white to-slate-100 text-primary border border-slate-200 shadow-[0_2.5px_0_#cbd5e1,inset_0_1px_0_#ffffff]"
                      }`}
                    >
                      {getIcon(channel.id)}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {channel.label}
                      </div>
                      <div className="font-heading font-extrabold text-sm sm:text-base text-primary">
                        {channel.title}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-base sm:text-lg text-primary tracking-tight px-3 py-1.5 rounded-xl bg-surface/80 border border-slate-200/60 shadow-[inset_0_1px_2px_rgba(16,55,92,0.04)]">
                    {channel.value}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {channel.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  <a
                    href={channel.actionHref}
                    target={channel.actionHref.startsWith("http") ? "_blank" : undefined}
                    rel={channel.actionHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      isPrimary
                        ? "text-white bg-gradient-to-b from-[#184e7d] to-primary hover:from-[#1d5c94] hover:to-[#13426e] active:translate-y-1 shadow-[0_4px_0_#092138,0_10px_20px_-4px_rgba(16,55,92,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                        : "text-primary bg-gradient-to-b from-white to-slate-100 hover:from-white hover:to-slate-150 border border-slate-200 active:translate-y-0.5 shadow-[0_3px_0_#cbd5e1,inset_0_1px_0_#ffffff]"
                    }`}
                  >
                    <span>{channel.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

