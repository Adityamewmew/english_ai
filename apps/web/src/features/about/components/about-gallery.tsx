"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Tag } from "lucide-react";
import { ABOUT_DOCUMENTATION_PHOTOS } from "../data/about-data";

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
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#F4F6FF]/40 via-white to-[#F4F6FF]/30 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/10">
              Dokumentasi Resmi
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight mt-2">
              Bukti Pengabdian &amp; Rekam Jejak Lapangan
            </h2>
            <p className="font-body text-sm sm:text-base text-slate-600 mt-1 max-w-xl">
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
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary hover:bg-slate-50 transition-colors cursor-pointer shadow-xs active:translate-y-0.5"
              style={{ boxShadow: "0 2px 0 #cbd5e1" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-500 px-2">
              {activeIndex + 1} / {ABOUT_DOCUMENTATION_PHOTOS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto Berikutnya"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary hover:bg-slate-50 transition-colors cursor-pointer shadow-xs active:translate-y-0.5"
              style={{ boxShadow: "0 2px 0 #cbd5e1" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Photo Display with Tactile Skeuomorphic Frame */}
        <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Main Photo Container */}
            <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-inner">
              <Image
                src={activePhoto.image}
                alt={activePhoto.title}
                fill
                priority
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block px-2.5 py-1 rounded bg-black/50 backdrop-blur-xs text-xs font-semibold tracking-wide">
                  {activePhoto.category}
                </span>
                <h3 className="font-heading font-bold text-lg sm:text-xl mt-1 text-white drop-shadow-sm">
                  {activePhoto.title}
                </h3>
              </div>
            </div>

            {/* Photo Details / Description */}
            <div className="lg:col-span-4 flex flex-col justify-between h-full p-2 sm:p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{activePhoto.category}</span>
                </div>

                <h4 className="font-heading font-extrabold text-xl text-primary leading-snug">
                  {activePhoto.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePhoto.location}</span>
                </div>

                <p className="font-body text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {activePhoto.description}
                </p>
              </div>

              {/* Thumbnails Row */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Pilih Dokumentasi:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ABOUT_DOCUMENTATION_PHOTOS.map((photo, idx) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeIndex === idx
                          ? "border-primary ring-2 ring-primary/20 scale-102"
                          : "border-slate-200 opacity-70 hover:opacity-100"
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
      </div>
    </section>
  );
}

