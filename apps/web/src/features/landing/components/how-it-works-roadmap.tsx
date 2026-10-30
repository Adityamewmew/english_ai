"use client";

import React, { useState, useEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";
import {
  Compass,
  Headphones,
  Mic,
  Briefcase,
  CheckCircle2,
  Award,
} from "lucide-react";

interface MilestoneStation {
  id: string;
  stepNumber: string;
  title: string;
  category: string;
  description: string;
  roadX: number;
  roadY: number;
  pinX: number;
  pinY: number;
  placement: "top" | "bottom";
  icon: React.ComponentType<{ className?: string }>;
}

const MILESTONE_STATIONS: MilestoneStation[] = [
  {
    id: "01",
    stepNumber: "01",
    title: "Cek Kemampuan Awal",
    category: "Langkah 1",
    description: "Ketahui level bahasa Inggrismu dalam 10 menit tanpa rasa cemas.",
    roadX: 100,
    roadY: 432,
    pinX: 100,
    pinY: 130,
    placement: "top",
    icon: Compass,
  },
  {
    id: "02",
    stepNumber: "02",
    title: "Bongkar Rasa Takut",
    category: "Mulai Percaya Diri",
    description: "Latih respon bicara spontan tanpa harus menerjemahkan di kepala.",
    roadX: 270,
    roadY: 463,
    pinX: 270,
    pinY: 260,
    placement: "top",
    icon: Headphones,
  },
  {
    id: "03",
    stepNumber: "03",
    title: "Ngobrol 15 Menit Sehari",
    category: "Latihan Rutin",
    description: "Ngobrol santai dua arah via simulasi telepon bareng Mr. Khoirul AI.",
    roadX: 380,
    roadY: 469,
    pinX: 380,
    pinY: 508,
    placement: "bottom",
    icon: Mic,
  },
  {
    id: "04",
    stepNumber: "04",
    title: "Koreksi Ramah & Alami",
    category: "Bimbingan Langsung",
    description: "Dapat masukan pelafalan dan tata bahasa yang tepat saat bicara.",
    roadX: 560,
    roadY: 180,
    pinX: 560,
    pinY: 80,
    placement: "top",
    icon: CheckCircle2,
  },
  {
    id: "05",
    stepNumber: "05",
    title: "Praktek Situasi Kerja",
    category: "Persiapan Karir",
    description: "Latihan interview kerja, meeting kantor, dan presentasi bisnis.",
    roadX: 810,
    roadY: 310,
    pinX: 810,
    pinY: 495,
    placement: "bottom",
    icon: Briefcase,
  },
  {
    id: "06",
    stepNumber: "06",
    title: "Fasih & Dapat Sertifikat",
    category: "Bukti Kelulusan",
    description: "Siap bicara lancar kapan saja dan terima sertifikat kelulusan resmi.",
    roadX: 930,
    roadY: 280,
    pinX: 930,
    pinY: 80,
    placement: "top",
    icon: Award,
  },
];

export function HowItWorksRoadmap() {
  const [activeStation, setActiveStation] = useState<string>("03");
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  // Engineered Highway S-Curve with dedicated whitespace corridors
  const roadPath =
    "M -30,420 C 120,420 220,470 360,470 C 470,470 540,400 540,310 C 540,210 480,215 560,180 C 640,145 700,260 810,310 C 900,350 960,240 1020,180 C 1080,140 1130,140 1230,140";

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          const clipRect = containerEl.querySelector(".road-clip-rect");
          const poles = containerEl.querySelectorAll(".roadmap-pole-item");
          const pins = containerEl.querySelectorAll(".roadmap-station-item");

          const tl = createTimeline({
            autoplay: true,
            defaults: { ease: "outCubic" },
          });

          // 1. Unroll Highway Road Path from Left to Right (Path-Draw via SVG clip)
          if (clipRect) {
            tl.add(clipRect, {
              width: [0, 1320],
              duration: 1250,
              ease: "outQuart",
            }, 0);
          }

          // 2. Staggered Poles Contact & Line Drop
          if (poles.length > 0) {
            tl.add(Array.from(poles), {
              opacity: [0, 1],
              scale: [0.75, 1],
              delay: stagger(135),
              duration: 400,
              ease: "outCubic",
            }, 180);
          }

          // 3. Staggered Pin Drop with Tactile Bounce (Pos 01 -> Pos 06)
          if (pins.length > 0) {
            tl.add(Array.from(pins), {
              opacity: [0, 1],
              scale: [0.5, 1],
              delay: stagger(135),
              duration: 550,
              ease: "outBack(1.25)",
            }, 220);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(containerEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative">
      <style jsx>{`
        @keyframes roadMarquee {
          from {
            stroke-dashoffset: 26;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-road-marquee {
          animation: roadMarquee 1.1s linear infinite;
        }
      `}</style>

      {/* ================= MOBILE VERTICAL TIMELINE (< md) ================= */}
      <div className="md:hidden space-y-3 pt-2">
        {MILESTONE_STATIONS.map((station, index) => {
          const Icon = station.icon;
          const isActive = activeStation === station.id;
          const isLast = index === MILESTONE_STATIONS.length - 1;

          return (
            <div
              key={`mobile-${station.id}`}
              onClick={() => setActiveStation(station.id)}
              className="relative flex items-start gap-3.5 cursor-pointer group"
            >
              {/* Connector line between steps */}
              {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-[-14px] w-0.5 bg-[#F4B41A]/40 z-0" />
              )}

              {/* Pin Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-900 border-2 border-white shadow-sm shrink-0 z-10 transition-colors ${
                  isActive ? "bg-[#F4B41A]" : "bg-[#F4B41A] group-hover:bg-[#f5be38]"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-950 stroke-[2.2]" />
              </div>

              {/* Card Content */}
              <div
                className={`flex-1 p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? "border-[#F4B41A] shadow-sm bg-white"
                    : "border-slate-200/80 bg-white/90 shadow-2xs group-hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-heading font-black text-xs text-primary">
                    {station.stepNumber}. {station.title}
                  </span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                    {station.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {station.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP HIGHWAY CANVAS (>= md) ================= */}
      <div className="hidden md:block w-full overflow-visible pb-10">
        <div className="w-full max-w-[1200px] aspect-[1200/650] relative select-none mx-auto">
          {/* ================= SVG HIGHWAY CANVAS ================= */}
          <svg
            className="w-full h-full absolute inset-0 overflow-visible pointer-events-none"
            viewBox="0 0 1200 650"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Soft Gradient Mask for Highway Left/Right Fade */}
              <linearGradient id="roadFadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="6%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="90%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              <mask id="roadSoftMask">
                <rect x="0" y="0" width="1200" height="650" fill="url(#roadFadeGradient)" />
              </mask>

              {/* Cruising Beam Glow */}
              <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Highway Unroll ClipPath for Path-Draw Entrance Animation */}
              <clipPath id="roadUnrollClip">
                <rect className="road-clip-rect" x="-40" y="0" width="1320" height="650" />
              </clipPath>
            </defs>

            {/* Clean Highway Road Body (Tanpa Glow / Pinggiran Tebal) */}
            <g mask="url(#roadSoftMask)" clipPath="url(#roadUnrollClip)">
              {/* 1. Subtle Road Bottom Shadow (Sama lebar 48px, hanya di bawah) */}
              <path
                d={roadPath}
                stroke="#0f172a"
                strokeWidth="48"
                strokeLinecap="round"
                strokeOpacity="0.08"
                transform="translate(0, 6)"
              />

              {/* 2. Main Asphalt Road Body */}
              <path
                d={roadPath}
                stroke="#1E293B"
                strokeWidth="48"
                strokeLinecap="round"
              />

              {/* 3. Animated Center Dashed Line (Live Moving Highway Marquee) */}
              <path
                d={roadPath}
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeDasharray="14 12"
                strokeOpacity="0.9"
                strokeLinecap="round"
                className="animate-road-marquee"
              />

              {/* 4. Cruising Golden Energy Beam (Moving Learner Particle) */}
              <circle r="5" fill="#F4B41A" filter="url(#particleGlow)">
                <animateMotion
                  path={roadPath}
                  dur="7.5s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
              <circle r="2.5" fill="#FFFFFF">
                <animateMotion
                  path={roadPath}
                  dur="7.5s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
            </g>

            {/* 7. Milestone Vertical Poles & Road Contact Dots */}
            {MILESTONE_STATIONS.map((station) => (
              <g key={`pole-${station.id}`} className="roadmap-pole-item">
                {/* Yellow Vertical Connector Pole */}
                <line
                  x1={station.roadX}
                  y1={station.roadY}
                  x2={station.pinX}
                  y2={station.pinY}
                  stroke="#F4B41A"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Road Junction Contact Dot */}
                <circle
                  cx={station.roadX}
                  cy={station.roadY}
                  r="6.5"
                  fill="#F4B41A"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              </g>
            ))}
          </svg>

          {/* ================= HTML PINS & HORIZONTAL LABEL CARDS ================= */}
          <div className="absolute inset-0 pointer-events-auto">
            {MILESTONE_STATIONS.map((station) => {
              const Icon = station.icon;
              const isActive = activeStation === station.id;

              // Convert SVG coords (viewBox: 1200 x 650) to CSS percentage coordinates
              const leftPercent = (station.pinX / 1200) * 100;
              const topPercent = (station.pinY / 650) * 100;

              return (
                <div
                  key={station.id}
                  style={{
                    position: "absolute",
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    marginLeft: "-22px",
                    marginTop: "-22px",
                  }}
                  className="z-20 pointer-events-auto"
                >
                  <div
                    onClick={() => setActiveStation(station.id)}
                    className="roadmap-station-item cursor-pointer group origin-[22px_22px]"
                  >
                    {/* Horizontal Unit: Pin on the Left, Card to the Right */}
                    <div
                      className={`flex items-center gap-2.5 transition-transform duration-200 ${
                        isActive ? "scale-105" : "hover:scale-102"
                      }`}
                    >
                      {/* The Yellow Milestone Pin */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-slate-900 border-[3px] border-white shadow-md transition-colors ${
                            isActive
                              ? "bg-[#F4B41A]"
                              : "bg-[#F4B41A] group-hover:bg-[#f5be38]"
                          }`}
                          style={{
                            boxShadow:
                              "0 6px 16px rgba(244, 180, 26, 0.4), inset 0 1px 1px #ffffff",
                          }}
                        >
                          <Icon className="w-5 h-5 text-slate-950 stroke-[2.2]" />
                        </div>
                      </div>

                      {/* Milestone Information Card (Side-by-Side with Zero Road Overlap) */}
                      <div
                        className={`w-48 sm:w-52 p-2 sm:p-2.5 rounded-xl border transition-all text-left ${
                          isActive
                            ? "border-[#F4B41A] shadow-md"
                            : "border-slate-200/90 shadow-2xs group-hover:border-slate-300 group-hover:shadow-xs"
                        }`}
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%)",
                          boxShadow: isActive
                            ? "0 10px 24px -6px rgba(16, 55, 92, 0.12), 0 2px 0 #F4B41A"
                            : "0 6px 14px -4px rgba(16, 55, 92, 0.06)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-heading font-black text-xs text-primary truncate">
                            {station.stepNumber}. {station.title}
                          </span>
                        </div>

                        <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 mb-0.5">
                          {station.category}
                        </span>

                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                          {station.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
