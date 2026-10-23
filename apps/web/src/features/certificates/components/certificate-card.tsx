"use client";

import React, { useRef } from "react";
import { Award, Printer, X, ShieldCheck, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CertificateModalData {
  certificateNumber: string;
  userName: string;
  cefrLevel: string;
  title: string;
  description: string | null;
  score: number;
  scoresBreakdown?: {
    structureAndVocabulary?: number;
    readingComprehension?: number;
    listeningComprehension?: number;
    dictation?: number;
    conversation?: number;
    composition?: number;
    averageScore?: number;
    qualification?: string;
  } | null;
  issuedAt: string | Date;
  instructorName?: string | null;
  instructorTitle?: string | null;
  signatureUrl?: string | null;
  backgroundUrl?: string | null;
  themeColor?: string | null;
  orientation?: string | null;
  placeOfEntry?: string | null;
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

  const formattedDate = new Date(data.issuedAt).toLocaleDateString("en-GB", {
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
  const signatureUrl = resolveBackgroundUrl(data.signatureUrl);
  const isPortrait = (data.orientation || "portrait").toLowerCase() === "portrait";

  const tierMap: Record<string, string> = {
    A1: "Elementary",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Intermediate",
    C1: "Advanced",
    C2: "Advanced",
  };
  const tierName = tierMap[data.cefrLevel?.toUpperCase()] || "Advanced";

  const defaultScores = {
    structureAndVocabulary: data.score > 88 ? data.score - 1 : data.score + 1,
    readingComprehension: data.score,
    listeningComprehension: data.score + 1,
    dictation: data.score >= 88 ? data.score + 2 : data.score - 1,
    conversation: data.score >= 85 ? data.score + 1 : data.score,
    composition: data.score - 1,
    qualification: data.score >= 89 ? "EXCELLENT" : data.score >= 76 ? "GOOD" : "FAIR",
  };
  const scores = data.scoresBreakdown || defaultScores;

  const certificateBody = (
    <div
      ref={printRef}
      id="printable-certificate"
      className={`relative w-full ${
        isPortrait ? "max-w-[620px] aspect-[1/1.414]" : "max-w-[850px] aspect-[1.414/1]"
      } bg-[#FCFBF7] text-[#0D3B66] rounded-xl shadow-2xl border-4 sm:border-8 border-double border-[#0D3B66]/25 overflow-hidden flex flex-col justify-between select-none print:shadow-none print:border-none`}
      style={{
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Background graphic if uploaded by admin */}
      {fullBackgroundUrl && (
        <img
          src={fullBackgroundUrl}
          alt="Certificate Template"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 opacity-20"
        />
      )}

      {/* Decorative Gold Top Accent Bar */}
      <div className="absolute top-0 left-0 w-24 sm:w-32 h-2.5 sm:h-3.5 bg-gradient-to-r from-[#F4B41A] to-[#D4AF37] z-10" />

      {isPortrait ? (
        /* =========================================================================
           PORTRAIT OFFICIAL EDDY'S LOCAL EXAMINATION CERTIFICATE
           ========================================================================= */
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6 text-center leading-normal">
          {/* 1. Header: BAN Accreditation & Eddy's Logo */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3 pt-2">
            <div className="text-left flex items-start gap-2">
              <div className="w-8 h-8 rounded-full border border-sky-600/40 bg-sky-50 flex items-center justify-center font-bold text-sky-800 text-[10px] shrink-0">
                BAN
              </div>
              <div className="text-[7.5px] sm:text-[9px] text-slate-600 font-sans leading-tight">
                <p className="font-semibold text-slate-800">Terakreditasi BAN PAUD dan PNF/AKR/2019</p>
                <p>NPSN : K5655732</p>
                <p>Nomor Ijin : 421.8/12.KP/PAUD/35.09.325/2024</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-6 h-6 rounded bg-[#0D3B66] text-[#F4B41A] flex items-center justify-center font-black text-[10px]">
                  E
                </div>
                <span className="font-serif font-black tracking-wider text-sm sm:text-base text-[#0D3B66]">
                  EDDY&apos;S
                </span>
              </div>
              <p className="text-[7.5px] sm:text-[9px] text-rose-600 font-bold uppercase tracking-wider">
                Great Communicators
              </p>
              <p className="text-[7px] text-slate-400 font-mono">SINCE 1990</p>
            </div>
          </div>

          {/* 2. Title Section */}
          <div className="space-y-1 my-auto pt-1">
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-[#0D3B66] uppercase">
              TO WHOM IT MAY CONCERN
            </h1>
            <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#D4AF37] uppercase">
              EDDY&apos;S LOCAL EXAMINATION IN ENGLISH
            </p>
          </div>

          {/* 3. Candidate & Level Statement */}
          <div className="space-y-1 max-w-md mx-auto my-auto px-2">
            <p className="text-[11px] sm:text-xs text-slate-600 font-serif">
              This is to certify the candidate named above
            </p>
            <h2 className="text-lg sm:text-2xl font-serif font-black text-[#0D3B66] tracking-wide py-0.5 border-b border-[#D4AF37]/50 inline-block px-4">
              {data.userName}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-700 font-serif pt-1">
              examined for the <strong className="font-extrabold text-[#0D3B66]">{tierName}</strong> level in English ({data.cefrLevel}) and qualified for the award of:
            </p>
          </div>

          {/* 4. Six Score Subject Breakdown */}
          <div className="my-auto py-1">
            <div className="max-w-[280px] sm:max-w-[320px] mx-auto text-left font-mono font-bold text-[10px] sm:text-xs space-y-1 text-slate-800 bg-white/70 backdrop-blur-2xs p-2.5 sm:p-3 rounded-lg border border-slate-200/90 shadow-2xs">
              <div className="flex justify-between">
                <span>STRUCTURE &amp; VOCABULARY</span>
                <span>: {scores.structureAndVocabulary ?? 85}</span>
              </div>
              <div className="flex justify-between">
                <span>READING COMPREHENSION</span>
                <span>: {scores.readingComprehension ?? 86}</span>
              </div>
              <div className="flex justify-between">
                <span>LISTENING COMPREHENSION</span>
                <span>: {scores.listeningComprehension ?? 87}</span>
              </div>
              <div className="flex justify-between">
                <span>DICTATION</span>
                <span>: {scores.dictation ?? 91}</span>
              </div>
              <div className="flex justify-between">
                <span>CONVERSATION</span>
                <span>: {scores.conversation ?? 90}</span>
              </div>
              <div className="flex justify-between">
                <span>COMPOSITION</span>
                <span>: {scores.composition ?? 86}</span>
              </div>
            </div>
          </div>

          {/* 5. Pass Standard Scale Box */}
          <div className="my-auto">
            <div className="inline-block border border-slate-700/60 rounded-2xl px-4 py-1.5 bg-[#FCFBF7] text-slate-800 shadow-2xs">
              <p className="font-bold text-[8.5px] sm:text-[9.5px] tracking-wider uppercase border-b border-slate-300 pb-0.5">
                THE PASS STANDART IS INDICATED THUS
              </p>
              <div className="font-mono text-[8px] sm:text-[9px] text-slate-700 space-y-0.5 pt-0.5">
                <p>89–100 = EXCELLENT</p>
                <p>76–88 = GOOD</p>
                <p>60–75 = FAIR</p>
              </div>
              {scores.qualification && (
                <div className="mt-1 pt-1 border-t border-slate-200">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    STATUS: {scores.qualification}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 6. Footer Information & Endorsements */}
          <div className="pt-2 border-t border-slate-200/90 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-left text-[8px] sm:text-[9.5px] font-sans">
              <div>
                <p className="font-bold text-slate-900">Date of Examination</p>
                <p className="text-slate-600 font-mono text-[8px] sm:text-[9px] mt-0.5">{formattedDate}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">Place of Entry</p>
                <p className="text-slate-600 text-[7.5px] sm:text-[8.5px] mt-0.5 leading-tight">
                  {data.placeOfEntry || "PBN Kelapa Gading, D.18 Jember East Java"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">Reference No.</p>
                <p className="text-slate-900 font-mono font-bold text-[8px] sm:text-[9px] mt-0.5">
                  {data.certificateNumber}
                </p>
              </div>
            </div>

            {/* Director Signatory & Official Stamp */}
            <div className="flex flex-col items-center justify-center pt-1">
              <p className="text-[9px] font-bold text-slate-800">Director of Studies</p>
              <div className="relative my-1 w-32 h-9 flex items-center justify-center">
                {signatureUrl ? (
                  <img src={signatureUrl} alt="Signature" className="h-full object-contain" />
                ) : (
                  <div className="w-24 border-b border-slate-400 mt-4" />
                )}
              </div>
              <p className="font-serif font-black text-xs sm:text-sm text-[#0D3B66]">
                {data.instructorName || "KHOIRUL ANWAR, M.Pd"}
              </p>
            </div>
          </div>

          {/* 7. Bottom Institutional Bar */}
          <div className="bg-[#0D3B66] text-white -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 px-3 py-1.5 flex flex-wrap items-center justify-between text-[7px] sm:text-[8px] tracking-wide">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Eddy&apos;s English Jember</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <Phone className="w-2.5 h-2.5 text-[#F4B41A]" />
              <span>+62 813-3671-2345</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-[#F4B41A]" />
              <span>Perum Puri Bunga Nirwana D18 Kelapa Gading</span>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           LANDSCAPE FALLBACK TEMPLATE MODE
           ========================================================================= */
        <div className="relative z-10 flex flex-col justify-between h-full p-8 sm:p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-6 h-6 text-[#F4B41A]" />
            <span className="text-xs font-black tracking-[0.25em] text-[#0D3B66] uppercase">
              EDDY&apos;S GREAT COMMUNICATORS · CEFR {data.cefrLevel}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-[#0D3B66] uppercase">
            Certificate of Competence
          </h1>
          <div className="my-auto py-2">
            <p className="text-xs italic font-serif text-slate-600 mb-1">This is proudly presented to</p>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#0D3B66] border-b-2 border-[#D4AF37]/60 inline-block px-8 py-1 mb-2">
              {data.userName}
            </h2>
            <p className="text-xs text-slate-700 max-w-xl mx-auto">
              {data.description || `For successfully demonstrating proficiency in CEFR ${data.cefrLevel}.`}
            </p>
          </div>
          <div className="flex items-end justify-between pt-4 border-t border-slate-200 text-xs">
            <div className="text-left font-mono text-[10px]">
              <p>ID: {data.certificateNumber}</p>
              <p>Date: {formattedDate}</p>
            </div>
            <div className="text-right">
              <p className="font-serif font-bold text-xs text-[#0D3B66]">
                {data.instructorName || "KHOIRUL ANWAR, M.Pd"}
              </p>
              <p className="text-[10px] text-slate-500">
                {data.instructorTitle || "Director of Studies"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isModal) {
    return certificateBody;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl flex flex-col items-center my-auto">
        <div className="no-print flex items-center justify-between w-full mb-3 px-1 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F4B41A]" />
            <span className="font-bold text-sm">Sertifikat Resmi Eddy&apos;s English</span>
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

        {certificateBody}
      </div>

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
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: ${isPortrait ? "A4 portrait" : "A4 landscape"};
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
