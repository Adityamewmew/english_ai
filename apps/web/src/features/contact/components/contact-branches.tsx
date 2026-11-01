"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Star,
  MessageSquare,
} from "lucide-react";
import { EDDYS_JEMBER_BRANCHES } from "../data/contact-data";
import { FadeIn } from "./fade-in";

export function ContactBranches() {
  const branch = EDDYS_JEMBER_BRANCHES[0];
  const [isMapActive, setIsMapActive] = useState(false);

  return (
    <section id="lokasi" className="py-12 sm:py-16 md:py-24 px-5 sm:px-6 bg-gradient-to-b from-[#F4F6FF]/40 via-white to-[#F4F6FF]/30 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Section Heading with Fade */}
        <FadeIn delay={0} duration={600} className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
            Lokasi &amp; Kantor Resmi
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-primary tracking-tight">
            Gedung Pembelajaran Eddy&apos;s English Jember
          </h2>
          <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
            Kunjungi gedung resmi kami untuk konsultasi langsung, tes penempatan CEFR,
            atau informasi pendaftaran program kursus offline maupun interaktif AI.
          </p>
        </FadeIn>

        {/* Location Showcase Card with Fade */}
        <FadeIn delay={100} duration={600}>
          <div className="bg-white rounded-3xl border border-slate-200/90 border-b-5 border-b-slate-300/80 shadow-[0_16px_36px_-10px_rgba(16,55,92,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Details & Actions (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-8 md:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Header: Category & Rating */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-bold text-xs uppercase tracking-wider text-secondary px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20">
                      {branch.category}
                    </span>
                    {branch.rating && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg shadow-2xs">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{branch.rating.toFixed(1)} di Google Maps</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-primary">
                    {branch.name}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-slate-500">
                    {branch.tagline}
                  </p>
                </div>

                {/* Address Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-surface/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <MapPin className="w-4 h-4 text-secondary stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-xs sm:text-sm text-primary">
                        {branch.address}
                      </div>
                      <div className="font-body text-xs text-slate-500 mt-0.5">
                        {branch.district}, {branch.city} {branch.postalCode}
                      </div>
                      <div className="font-body text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-accent stroke-[2.2] shrink-0" />
                        <span><strong>Akses:</strong> {branch.landmark}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-white border-b-3 border-b-slate-300/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 font-heading font-bold text-xs text-primary">
                      <Clock className="w-3.5 h-3.5 text-accent stroke-[2.2]" />
                      <span>Jam Operasional</span>
                    </div>
                    <div className="font-body text-xs text-slate-600 space-y-0.5 pt-1">
                      <div><strong>Senin – Jumat:</strong> {branch.operatingHours.weekdays}</div>
                      <div><strong>Sabtu:</strong> {branch.operatingHours.saturday}</div>
                      <div className="text-slate-400"><strong>Minggu:</strong> {branch.operatingHours.sunday}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-white border-b-3 border-b-slate-300/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 font-heading font-bold text-xs text-primary">
                      <Phone className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
                      <span>Kontak Langsung</span>
                    </div>
                    <div className="font-body text-xs text-slate-600 space-y-1 pt-1">
                      <div>Hotline: <strong className="font-mono text-primary font-bold">{branch.phone}</strong></div>
                      <div>WhatsApp: <strong className="font-mono text-primary font-bold">+{branch.whatsapp}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Key Services */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-heading font-bold text-primary uppercase tracking-wider">
                    Layanan &amp; Fasilitas di Gedung Ini:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {branch.services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.2]" />
                        <span className="font-body">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-xl font-heading font-extrabold text-xs sm:text-sm text-white bg-gradient-to-b from-[#184A78] to-[#10375C] hover:from-[#1d5c94] hover:to-[#13426e] active:translate-y-0.5 border border-[#1e588f] border-b-3 border-b-[#061726] shadow-sm transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-accent" />
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href={`https://wa.me/${branch.whatsapp}?text=Halo%20Admin%20Eddy's%20English%20Jember,%20saya%20ingin%20konsultasi%20kelas%20dan%20rencana%20kunjungan%20ke%20gedung%20Jl.%20Tawang%20Mangu.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm text-primary bg-slate-50 hover:bg-slate-100 border border-slate-200/90 border-b-3 border-b-slate-300 active:translate-y-0.5 shadow-2xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Google Maps Interactive Frame (5 cols) with Touch Guard */}
            <div className="lg:col-span-5 bg-slate-100 min-h-[280px] sm:min-h-[360px] lg:min-h-full relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
              <iframe
                title="Peta Lokasi Eddy's English Jember"
                src={branch.embedMapsUrl}
                className={`w-full h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[480px] border-0 transition-opacity duration-300 ${
                  isMapActive ? "pointer-events-auto" : "pointer-events-none lg:pointer-events-auto"
                }`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Mobile Scroll-Trap Guard Overlay: Prevents finger scroll hijack */}
              {!isMapActive && (
                <button
                  type="button"
                  onClick={() => setIsMapActive(true)}
                  className="lg:hidden absolute inset-0 z-20 bg-primary/10 backdrop-blur-[1.5px] flex flex-col items-center justify-center gap-2 text-white p-4 cursor-pointer focus:outline-none"
                  aria-label="Aktifkan interaksi peta"
                >
                  <div className="bg-primary/95 backdrop-blur-xs text-white px-4 py-2.5 rounded-xl text-xs font-heading font-bold shadow-lg flex items-center gap-2 border border-white/20 active:scale-95 transition-transform">
                    <Navigation className="w-3.5 h-3.5 text-accent animate-pulse" />
                    <span>Ketuk untuk Menggeser Peta</span>
                  </div>
                </button>
              )}

              {/* Floating Address Pill */}
              <div className="absolute top-3 left-3 sm:top-4 sm:right-4 sm:left-auto bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px] sm:text-xs font-heading font-bold text-primary flex items-center gap-1.5 pointer-events-none z-10">
                <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">Jl. Tawang Mangu No. 190, Jember</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
