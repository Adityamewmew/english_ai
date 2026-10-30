"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Building2,
  Sparkles,
  Star,
} from "lucide-react";
import { EDDYS_JEMBER_BRANCHES, BranchLocation } from "../data/contact-data";

export function ContactBranches() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("kalimantan");
  const selectedBranch: BranchLocation =
    EDDYS_JEMBER_BRANCHES.find((b) => b.id === selectedBranchId) ||
    EDDYS_JEMBER_BRANCHES[0];

  return (
    <section id="cabang" className="py-12 sm:py-16 px-4 sm:px-6 md:px-8 relative bg-surface/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
            Lokasi Cabang Jember
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
            Temukan Kantor Cabang Terdekat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pilih cabang di bawah untuk melihat rincian alamat, jadwal operasional, nomor telepon, dan petunjuk arah Google Maps.
          </p>
        </div>

        {/* Branch Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {EDDYS_JEMBER_BRANCHES.map((branch) => {
            const isSelected = branch.id === selectedBranch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                type="button"
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? "text-white bg-gradient-to-b from-[#184e7d] to-primary border border-primary/90 border-b-[4px] border-b-[#092138] shadow-[0_6px_14px_-2px_rgba(16,55,92,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)] translate-y-[-1px]"
                    : "text-slate-700 bg-gradient-to-b from-white to-slate-100/90 hover:to-slate-150 hover:text-primary border border-slate-200 border-b-[3px] border-b-slate-300 shadow-[0_2px_4px_rgba(0,0,0,0.03),inset_0_1px_0_#ffffff] active:translate-y-0.5 active:border-b-2"
                }`}
              >
                <Building2 className={`w-4 h-4 ${isSelected ? "text-accent stroke-[2.4]" : "text-slate-500"}`} />
                <span>{branch.shortName}</span>
                {branch.isMainOffice && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isSelected ? "bg-accent/25 text-accent border border-accent/30" : "bg-primary/10 text-primary border border-primary/15"
                    }`}
                  >
                    Pusat
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Branch Detail Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 border-b-[5px] border-b-slate-300/80 shadow-[0_16px_36px_-10px_rgba(16,55,92,0.1),inset_0_1.5px_1px_#ffffff] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Branch Details & Actions (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Branch Header */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-black text-xs uppercase tracking-wider text-secondary px-2.5 py-0.5 rounded-lg bg-secondary/10 border border-secondary/20">
                    {selectedBranch.category}
                  </span>
                  {selectedBranch.rating && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{selectedBranch.rating.toFixed(1)} di Google Maps</span>
                    </span>
                  )}
                  {selectedBranch.isMainOffice && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Kantor Utama</span>
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-primary">
                  {selectedBranch.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedBranch.tagline}
                </p>
              </div>

              {/* Address Card */}
              <div className="p-4 rounded-2xl bg-surface/90 border border-slate-200/90 shadow-[inset_0_1px_2px_rgba(16,55,92,0.03)] space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 border-b-2 border-b-slate-300 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <MapPin className="w-4 h-4 text-secondary stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary">
                      {selectedBranch.address}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedBranch.district}, {selectedBranch.city} {selectedBranch.postalCode}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 font-medium flex items-center gap-1.5">
                      <Navigation className="w-3 h-3 text-accent stroke-[2.2]" />
                      <span><strong>Patokan:</strong> {selectedBranch.landmark}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours & Contact Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-white border-b-[3px] border-b-slate-300/80 shadow-[0_4px_12px_-4px_rgba(16,55,92,0.05),inset_0_1px_0_#ffffff] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Clock className="w-3.5 h-3.5 text-accent stroke-[2.2]" />
                    <span>Jam Operasional</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    <div><strong>Senin – Jumat:</strong> {selectedBranch.operatingHours.weekdays}</div>
                    <div><strong>Sabtu:</strong> {selectedBranch.operatingHours.saturday}</div>
                    <div className="text-slate-500"><strong>Minggu:</strong> {selectedBranch.operatingHours.sunday}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/90 bg-white border-b-[3px] border-b-slate-300/80 shadow-[0_4px_12px_-4px_rgba(16,55,92,0.05),inset_0_1px_0_#ffffff] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Phone className="w-3.5 h-3.5 text-secondary stroke-[2.2]" />
                    <span>Kontak Cabang</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 font-mono">
                    <div>Hotline: <strong className="text-primary">{selectedBranch.phone}</strong></div>
                    <div>WhatsApp: <strong className="text-primary">+{selectedBranch.whatsapp}</strong></div>
                  </div>
                </div>
              </div>

              {/* Services Available at this Branch */}
              <div className="space-y-2">
                <div className="text-xs font-heading font-bold text-primary uppercase tracking-wider">
                  Layanan Tersedia di Cabang Ini:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBranch.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-xl bg-slate-50/70 border border-slate-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={selectedBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-gradient-to-b from-[#184e7d] to-primary hover:from-[#1d5c94] hover:to-[#13426e] active:translate-y-1 shadow-[0_4px_0_#092138,0_10px_20px_-4px_rgba(16,55,92,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-accent" />
                <span>Buka Petunjuk Arah Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>

              <a
                href={`https://wa.me/${selectedBranch.whatsapp}?text=Halo%20Admin%20Eddy's%20English%20Cabang%20${encodeURIComponent(
                  selectedBranch.shortName
                )},%20saya%20ingin%20konsultasi%20kelas%20dan%20jadwal.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-primary bg-gradient-to-b from-white to-slate-100 hover:to-slate-150 border border-slate-200 active:translate-y-0.5 shadow-[0_3px_0_#cbd5e1,inset_0_1px_0_#ffffff] transition-all cursor-pointer"
              >
                <span>Hubungi Cabang Ini</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Frame (5 cols) */}
          <div className="lg:col-span-5 bg-slate-100 min-h-[300px] sm:min-h-[380px] lg:min-h-full relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
            <iframe
              title={`Peta Lokasi Eddy's English ${selectedBranch.name}`}
              src={selectedBranch.embedMapsUrl}
              className="w-full h-full min-h-[320px] lg:min-h-[460px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-primary flex items-center gap-1.5 pointer-events-none">
              <MapPin className="w-3 h-3 text-secondary" />
              <span>{selectedBranch.shortName}, Jember</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

