"use client";

import React, { useRef } from "react";
import { Award, Printer, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CertificateModalData {
  certificateNumber: string;
  userName: string;
  cefrLevel: string;
  title: string;
  description: string | null;
  score: number;
  issuedAt: string | Date;
  instructorName?: string | null;
  instructorTitle?: string | null;
  backgroundUrl?: string | null;
  themeColor?: string | null;
  nameYPercent?: number | null;
  nameFontSize?: number | null;
}

interface CertificateCardProps {
  data: CertificateModalData;
  onClose?: () => void;
  isModal?: boolean;
}

export function CertificateCard({ data, onClose, isModal = true }: CertificateCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(data.issuedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const resolveBackgroundUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || "https://eddys.drimland.my.id";
    return `${adminBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  };

  const fullBackgroundUrl = resolveBackgroundUrl(data.backgroundUrl);
  const hasCustomTemplate = Boolean(fullBackgroundUrl);

  const yPos = typeof data.nameYPercent === "number" ? data.nameYPercent : 48;
  const fontSize = typeof data.nameFontSize === "number" ? data.nameFontSize : 36;

  const certificateBody = (
    <div
      ref={printRef}
      id="printable-certificate"
      className="relative w-full max-w-[850px] aspect-[1.414/1] bg-[#FCFBF7] text-[#0D3B66] p-8 sm:p-12 rounded-xl shadow-2xl border-8 border-double border-[#0D3B66]/20 overflow-hidden flex flex-col justify-between select-none"
      style={{
        backgroundImage: fullBackgroundUrl ? `url('${fullBackgroundUrl}')` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {hasCustomTemplate ? (
        /* =========================================================================
           CUSTOM UPLOADED TEMPLATE MODE:
           Keeps admin artwork clean and automatically overlays student name & credentials
           ========================================================================= */
        <>
          {/* Custom Positioned Student Name Overlay */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center pointer-events-none px-6 sm:px-12 z-20"
            style={{
              top: `${yPos}%`,
              transform: "translateY(-50%)",
            }}
          >
            <h2
              className="font-serif font-black tracking-wide text-[#0D3B66] text-center drop-shadow-xs max-w-2xl leading-none"
              style={{
                fontSize: `${fontSize}px`,
              }}
            >
              {data.userName}
            </h2>
          </div>

          {/* Credential ID & Date at bottom left */}
          <div className="absolute bottom-3 sm:bottom-6 left-5 sm:left-10 text-left text-[9px] sm:text-[11px] text-slate-700 font-mono z-20 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded shadow-xs border border-slate-200">
            <p>
              <span className="font-semibold text-slate-900">ID:</span> {data.certificateNumber}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Date:</span> {formattedDate}
            </p>
          </div>
        </>
      ) : (
        /* =========================================================================
           BUILT-IN FALLBACK TEMPLATE MODE:
           Full HTML decorative design with seal and signatory
           ========================================================================= */
        <>
          {/* Decorative Outer Border Lines */}
          <div className="absolute inset-3 border-2 border-[#D4AF37]/50 rounded-lg pointer-events-none" />
          <div className="absolute inset-4 border border-[#0D3B66]/20 rounded-md pointer-events-none" />

          {/* Subtle Background Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Award className="w-[450px] h-[450px] text-[#0D3B66]" />
          </div>

          {/* Header Section */}
          <div className="relative text-center z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#0D3B66] flex items-center justify-center text-[#F4B41A] shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-sm font-black tracking-[0.25em] text-[#0D3B66] uppercase">
                EDDY&apos;S AI ENGLISH TUTOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-[#0D3B66] uppercase">
              Certificate of Competence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 tracking-widest uppercase mt-0.5">
              International CEFR Standard Assessment
            </p>
          </div>

          {/* Main Recipient Details */}
          <div className="relative text-center z-10 my-auto py-2">
            <p className="text-xs sm:text-sm italic font-serif text-slate-600 mb-1">
              This is proudly presented to
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#0D3B66] border-b-2 border-[#D4AF37]/60 inline-block px-8 py-1 mb-3">
              {data.userName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
              {data.description ||
                `For successfully mastering all learning modules and demonstrating professional communicative proficiency in CEFR ${data.cefrLevel}.`}
            </p>

            {/* Level & Score Badge */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0D3B66] text-[#F4B41A] shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                CEFR Level {data.cefrLevel} Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mastery Score: {data.score}%
              </span>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="relative flex items-end justify-between z-10 pt-4 border-t border-slate-200">
            {/* Certificate Credential Info */}
            <div className="text-left text-[10px] sm:text-xs text-slate-500 font-mono">
              <p>
                <span className="font-semibold text-slate-700">Credential ID:</span>{" "}
                {data.certificateNumber}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Date Issued:</span>{" "}
                {formattedDate}
              </p>
            </div>

            {/* Official Gold Seal Badge */}
            <div className="hidden sm:flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#D4AF37] bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner">
                <div className="w-11 h-11 rounded-full bg-[#0D3B66] text-[#F4B41A] flex flex-col items-center justify-center text-[8px] font-black tracking-tighter">
                  <span>EDDY&apos;S</span>
                  <span className="text-[6px] tracking-normal text-amber-200">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Signatory */}
            <div className="text-right">
              <div className="inline-block border-b border-slate-400 pb-1 w-40 text-center">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#0D3B66]">
                  {data.instructorName || "Mr. Khoirul, M.Pd."}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
                {data.instructorTitle || "Head of English Academic Affairs"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (!isModal) {
    return certificateBody;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl flex flex-col items-center">
        {/* Action Controls (Hidden on Print) */}
        <div className="no-print flex items-center justify-between w-full max-w-[850px] mb-3 px-1 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F4B41A]" />
            <span className="font-bold text-sm">Sertifikat Kelulusan Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-[#F4B41A] hover:bg-[#d99f14] text-[#0D3B66] font-bold shadow-md gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* The Certificate itself */}
        {certificateBody}
      </div>

      {/* Print Specific CSS to Isolate Certificate on A4 Landscape */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate,
          #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            border: 8px double #0d3b66 !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
