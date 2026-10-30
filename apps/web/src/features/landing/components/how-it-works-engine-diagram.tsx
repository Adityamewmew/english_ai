"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Award,
  Headphones,
  CheckCircle2,
  Briefcase,
  Mic,
  ShieldCheck,
} from "lucide-react";
import {
  ENGINE_INPUT_NODES,
  ENGINE_OUTPUT_ROWS,
  EngineInputNode,
} from "../data/how-it-works-data";

interface WireConfig {
  id: string;
  path: string;
  strokeColor: string;
  strokeOpacity: number;
  strokeDash?: string;
  pulseColor: string;
  pulseDur: string;
  pulseDelay: string;
  startDot: { x: number; y: number };
  endDot: { x: number; y: number };
}

export function HowItWorksEngineDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftNodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [mounted, setMounted] = useState(false);
  const [incomingWires, setIncomingWires] = useState<WireConfig[]>([]);
  const [outgoingWires, setOutgoingWires] = useState<WireConfig[]>([]);

  const getNodeIcon = (iconName: EngineInputNode["iconName"]) => {
    switch (iconName) {
      case "book":
        return BookOpen;
      case "award":
        return Award;
      case "headphones":
        return Headphones;
      case "check":
        return CheckCircle2;
      case "briefcase":
        return Briefcase;
      case "mic":
        return Mic;
    }
  };

  const updateWireCoordinates = useCallback(() => {
    if (!containerRef.current || !hubRef.current || !cardRef.current) return;

    const cRect = containerRef.current.getBoundingClientRect();
    const hRect = hubRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();

    if (cRect.width === 0 || hRect.width === 0 || cardRect.width === 0) return;

    // Hub center coordinates relative to container
    const hubRadius = hRect.width / 2;
    const hubCenterX = hRect.left + hubRadius - cRect.left;
    const hubCenterY = hRect.top + hRect.height / 2 - cRect.top;

    // ================= 1. INCOMING WIRES: Left Nodes -> Central Hub =================
    const inConfigs: WireConfig[] = [];
    const inDurations = ["2.4s", "2.1s", "1.9s", "2.0s", "2.3s", "2.5s"];
    const inDelays = ["0s", "0.4s", "0.8s", "0.3s", "0.7s", "1.1s"];
    const inColors = ["#10375C", "#EB8317", "#F3C623", "#10375C", "#EB8317", "#10375C"];

    ENGINE_INPUT_NODES.forEach((node, i) => {
      const el = leftNodeRefs.current[i];
      if (!el) return;
      const nRect = el.getBoundingClientRect();

      // Start: Right edge of the node card
      const x1 = nRect.right - cRect.left;
      const y1 = nRect.top + nRect.height / 2 - cRect.top;

      // End: Exact left perimeter contact on the central hub circle
      // Spread angle across -36deg to +36deg along the left rim
      const angle = ((i - 2.5) / 2.5) * (Math.PI / 4.8);
      const x2 = hubCenterX - hubRadius * Math.cos(angle);
      const y2 = hubCenterY + hubRadius * Math.sin(angle);

      // Smooth horizontal-leaving S-curve
      const dx = x2 - x1;
      const cp1x = x1 + dx * 0.45;
      const cp1y = y1;
      const cp2x = x2 - dx * 0.35;
      const cp2y = y2;

      const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

      inConfigs.push({
        id: `wire-in-${node.id}`,
        path,
        strokeColor: inColors[i % inColors.length],
        strokeOpacity: i % 2 === 0 ? 0.3 : 0.22,
        strokeDash: i === 0 || i === 5 ? "3 3" : undefined,
        pulseColor: i % 2 === 1 ? "#EB8317" : i === 2 ? "#F3C623" : "#10375C",
        pulseDur: inDurations[i % inDurations.length],
        pulseDelay: inDelays[i % inDelays.length],
        startDot: { x: x1, y: y1 },
        endDot: { x: x2, y: y2 },
      });
    });

    // ================= 2. OUTGOING WIRES: Central Hub -> Right Card Rows =================
    const outConfigs: WireConfig[] = [];
    const outDurations = ["2.1s", "1.8s", "2.0s", "2.3s", "2.2s"];
    const outDelays = ["0.2s", "0.6s", "0.1s", "0.8s", "0.4s"];
    // Colors matching row tags: Topik (Blue), Pelafalan (Emerald), Koreksi (Amber), Level (Purple), Lanjutan (Rose)
    const outColors = ["#3B82F6", "#10B981", "#EB8317", "#8B5CF6", "#F43F5E"];

    ENGINE_OUTPUT_ROWS.forEach((row, j) => {
      const el = rightRowRefs.current[j];
      if (!el) return;
      const rRect = el.getBoundingClientRect();

      // Start: Exact right perimeter contact on the central hub circle
      // Spread angle across -32deg to +32deg along the right rim
      const angle = ((j - 2) / 2) * (Math.PI / 5.2);
      const x1 = hubCenterX + hubRadius * Math.cos(angle);
      const y1 = hubCenterY + hubRadius * Math.sin(angle);

      // End: Left border of the card at the vertical center of the row
      const x2 = cardRect.left - cRect.left;
      const y2 = rRect.top + rRect.height / 2 - cRect.top;

      // Smooth horizontal-entering S-curve
      const dx = x2 - x1;
      const cp1x = x1 + dx * 0.35;
      const cp1y = y1;
      const cp2x = x2 - dx * 0.45;
      const cp2y = y2;

      const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;

      outConfigs.push({
        id: `wire-out-${row.tag}`,
        path,
        strokeColor: outColors[j % outColors.length],
        strokeOpacity: j === 1 || j === 2 ? 0.45 : 0.35,
        strokeDash: j === 0 || j === 4 ? "3 3" : undefined,
        pulseColor: outColors[j % outColors.length],
        pulseDur: outDurations[j % outDurations.length],
        pulseDelay: outDelays[j % outDelays.length],
        startDot: { x: x1, y: y1 },
        endDot: { x: x2, y: y2 },
      });
    });

    setIncomingWires(inConfigs);
    setOutgoingWires(outConfigs);
  }, []);

  useEffect(() => {
    setMounted(true);
    updateWireCoordinates();

    const rafId = requestAnimationFrame(updateWireCoordinates);
    const timeoutId = setTimeout(updateWireCoordinates, 120);

    const handleResize = () => updateWireCoordinates();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      updateWireCoordinates();
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (hubRef.current) resizeObserver.observe(hubRef.current);
    if (cardRef.current) resizeObserver.observe(cardRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [updateWireCoordinates]);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/90 relative z-10 overflow-hidden"
      style={{
        boxShadow:
          "0 20px 50px -10px rgba(16, 55, 92, 0.16), 0 6px 16px rgba(16, 55, 92, 0.06), inset 0 2px 2px #ffffff",
      }}
    >
      {/* ================= DYNAMIC SVG CONNECTOR CABLES WITH ENERGY TRANSMISSION ================= */}
      <svg
        className={`hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="engineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Incoming Wires (Left Nodes -> Hub) */}
        {incomingWires.map((wire) => (
          <g key={wire.id}>
            {/* Base Cable */}
            <path
              d={wire.path}
              stroke={wire.strokeColor}
              strokeOpacity={wire.strokeOpacity}
              strokeWidth="1.5"
              strokeDasharray={wire.strokeDash}
            />

            {/* Terminal Connection Dots */}
            <circle cx={wire.startDot.x} cy={wire.startDot.y} r="2.5" fill={wire.strokeColor} opacity="0.6" />
            <circle cx={wire.endDot.x} cy={wire.endDot.y} r="2.5" fill={wire.strokeColor} opacity="0.8" />

            {/* Transmitting Energy Pulse */}
            <circle r="3.5" fill={wire.pulseColor} filter="url(#engineGlow)">
              <animateMotion
                key={wire.path}
                path={wire.path}
                dur={wire.pulseDur}
                repeatCount="indefinite"
                begin={wire.pulseDelay}
              />
            </circle>
          </g>
        ))}

        {/* 2. Outgoing Wires (Hub -> Right Card Rows) */}
        {outgoingWires.map((wire) => (
          <g key={wire.id}>
            {/* Base Cable */}
            <path
              d={wire.path}
              stroke={wire.strokeColor}
              strokeOpacity={wire.strokeOpacity}
              strokeWidth="1.5"
              strokeDasharray={wire.strokeDash}
            />

            {/* Terminal Connection Dots */}
            <circle cx={wire.startDot.x} cy={wire.startDot.y} r="2.5" fill={wire.strokeColor} opacity="0.8" />
            <circle cx={wire.endDot.x} cy={wire.endDot.y} r="3" fill={wire.strokeColor} opacity="0.9" />

            {/* Transmitting Energy Pulse Heading Outward to Card Rows */}
            <circle r="3.5" fill={wire.pulseColor} filter="url(#engineGlow)">
              <animateMotion
                key={wire.path}
                path={wire.path}
                dur={wire.pulseDur}
                repeatCount="indefinite"
                begin={wire.pulseDelay}
              />
            </circle>
          </g>
        ))}
      </svg>

      {/* ================= DIAGRAM WORKSPACE (LEFT NODES - CENTER HUB - RIGHT CARD) ================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0 relative">
        {/* ================= LEFT COLUMN: 6 INPUT NODES ================= */}
        <div className="w-full lg:w-[200px] xl:w-[215px] shrink-0 space-y-2.5 z-20">
          {ENGINE_INPUT_NODES.map((node, i) => {
            const Icon = getNodeIcon(node.iconName);
            return (
              <div
                key={node.id}
                ref={(el) => {
                  leftNodeRefs.current[i] = el;
                }}
                className="p-2.5 rounded-xl bg-surface border border-slate-200/90 shadow-2xs flex items-center gap-2.5 hover:bg-white hover:shadow-xs transition-all cursor-default"
                style={{ boxShadow: "0 2px 0 #e2e8f0" }}
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                  <Icon className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    {node.category}
                  </div>
                  <div className="text-xs font-heading font-bold text-primary truncate mt-0.5">
                    {node.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flexible Cable Corridor (Left Wires Span Across This) */}
        <div className="hidden lg:block flex-1 min-w-[60px] max-w-[130px]" />

        {/* ================= CENTER: TUTOR MR. KHOIRUL AI HUB ================= */}
        <div
          ref={hubRef}
          className="z-20 my-4 lg:my-0 shrink-0 flex flex-col items-center justify-center px-2"
        >
          <div className="relative">
            {/* Concentric Active Glow Rings */}
            <div className="absolute -inset-3 rounded-full border-2 border-secondary/40 animate-ping opacity-40 pointer-events-none" />
            <div className="absolute -inset-1.5 rounded-full bg-secondary/25 animate-pulse blur-xs pointer-events-none" />

            {/* Tactile Central Hub Sphere with Mr. Khoirul Avatar */}
            <div
              className="w-20 h-20 rounded-full bg-white border-4 border-white overflow-hidden relative shadow-lg z-20 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
              style={{
                boxShadow:
                  "0 12px 28px rgba(16, 55, 92, 0.25), 0 0 0 4px #F4B41A",
              }}
            >
              <Image
                src="/illustrations/tutor/khoirul-waving.webp"
                alt="Mr. Khoirul AI"
                width={72}
                height={72}
                className="object-contain translate-y-1"
              />
            </div>
          </div>

          <div className="text-[11px] font-heading font-bold text-primary tracking-wide mt-2.5 whitespace-nowrap flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mr. Khoirul AI</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Tutor Pribadi 24/7</span>
        </div>

        {/* Flexible Cable Corridor (Right Wires Span Across This) */}
        <div className="hidden lg:block flex-1 min-w-[60px] max-w-[130px]" />

        {/* ================= RIGHT: STRUCTURED OUTPUT CARD ================= */}
        <div
          ref={cardRef}
          className="w-full lg:flex-1 lg:max-w-[530px] xl:max-w-[560px] shrink-0 z-20"
        >
          <div
            className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white"
            style={{
              boxShadow:
                "0 8px 24px rgba(16, 55, 92, 0.08), 0 2px 0 #e2e8f0, inset 0 1px 0 #ffffff",
            }}
          >
            {/* Top Bar of the Output Card */}
            <div className="px-5 py-3.5 bg-surface border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary text-accent flex items-center justify-center text-xs font-heading font-black shrink-0">
                  E
                </div>
                <div>
                  <div className="font-heading font-bold text-xs sm:text-sm text-primary">
                    Laporan Hasil Sesi 15 Menit
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ringkasan evaluasi langsung setelah Anda berbicara
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Latihan Selesai</span>
              </div>
            </div>

            {/* Structured Rows Table */}
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {ENGINE_OUTPUT_ROWS.map((row, j) => (
                <div
                  key={row.tag}
                  ref={(el) => {
                    rightRowRefs.current[j] = el;
                  }}
                  className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors relative"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-heading font-bold uppercase tracking-wider shrink-0 ${row.tagColor}`}
                    >
                      {row.tag}
                    </span>
                    <span className="font-body text-slate-800 font-medium leading-relaxed">
                      {row.content}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 self-end sm:self-auto shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                    {row.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Card Summary */}
            <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Standar Cambridge CEFR Resmi</span>
              </div>
              <span className="font-medium text-slate-500">Tersimpan di profil belajar Anda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
