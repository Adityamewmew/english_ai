"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Tag } from "lucide-react";
import { ABOUT_DOCUMENTATION_PHOTOS } from "../data/about-data";
import { FadeIn } from "./fade-in";

export function AboutGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activePhoto = ABOUT_DOCUMENTATION_PHOTOS[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? ABOUT_DOCUMENTATION_PHOTOS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === ABOUT_DOCUMENTATION_PHOTOS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-[#F4F6FF]/40 via-white to-[#F4F6FF]/30 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        {/* Section Header with Fade */}
        <FadeIn delay={0} duration={600}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-heading font-bold uppercase tracking-wider border border-primary/10">
                Dokumentasi Resmi
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mt-2">
                Bukti Pengabdian &amp; Rekam Jejak Lapangan
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                Dokumentasi nyata kegiatan pelatihan instansi, kemitraan guru MGMP,
                konferensi internasional, hingga kelas komunitas pelajar.
              </p>
            </div>

            {/* Carousel Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Foto Sebelumnya"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 border-b-3 border-b-slate-300/80 flex items-center justify-center text-primary hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:translate-y-0.5"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-heading font-bold text-slate-500 px-2 min-w-[54px] text-center">
                {activeIndex + 1} / {ABOUT_DOCUMENTATION_PHOTOS.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Foto Berikutnya"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 border-b-3 border-b-slate-300/80 flex items-center justify-center text-primary hover:bg-slate-50 transition-all cursor-pointer shadow-2xs active:translate-y-0.5"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Featured Photo Display with Clean Frame & Fade */}
        <FadeIn delay={120} duration={600}>
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 border-b-4 border-b-slate-300/80 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Main Photo Container */}
              <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-inner group">
                <Image
                  key={activePhoto.id}
                  src={activePhoto.image}
                  alt={activePhoto.title}
                  fill
                  priority
                  className="object-cover transition-all duration-500 ease-out group-hover:scale-102"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <div className="hidden sm:block absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-xs text-[11px] font-heading font-bold uppercase tracking-wider text-amber-300 border border-white/10">
                    {activePhoto.category}
                  </span>
                  <h3 className="font-heading font-bold text-lg sm:text-xl mt-1.5 text-white drop-shadow-sm">
                    {activePhoto.title}
                  </h3>
                </div>
              </div>

              {/* Photo Details / Description */}
              <div className="lg:col-span-4 flex flex-col justify-between h-full p-2 sm:p-3 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold text-primary">
                    <Tag className="w-3.5 h-3.5 text-secondary" />
                    <span>{activePhoto.category}</span>
                  </div>

                  <h4 className="font-heading font-extrabold text-lg sm:text-xl text-primary leading-snug">
                    {activePhoto.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activePhoto.location}</span>
                  </div>

                  <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed pt-2.5 border-t border-slate-100">
                    {activePhoto.description}
                  </p>
                </div>

                {/* Thumbnails Row */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-xs font-heading font-bold text-slate-700 mb-2.5">
                    Pilih Dokumentasi:
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                    {ABOUT_DOCUMENTATION_PHOTOS.map((photo, idx) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`Lihat foto ${photo.title}`}
                        className={`relative aspect-square min-h-[44px] min-w-[44px] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          activeIndex === idx
                            ? "border-primary ring-2 ring-primary/25 scale-104 shadow-sm"
                            : "border-slate-200 opacity-60 hover:opacity-100 hover:scale-102"
                        }`}
                      >
                        <Image
                          src={photo.image}
                          alt={photo.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
