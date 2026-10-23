"use client";

import React, { useRef, useState } from "react";
import { Award, Printer, X, Download, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CertificateModalData {
  certificateNumber: string;
  userName: string;
  cefrLevel: string;
  title?: string;
  description?: string | null;
  score: number;
  structureScore?: number | null;
  readingScore?: number | null;
  listeningScore?: number | null;
  dictationScore?: number | null;
  conversationScore?: number | null;
  compositionScore?: number | null;
  grade?: string | null;
  issuedAt: string | Date;
  examDate?: string | Date;
  placeOfEntry?: string;
  directorName?: string;
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

function getFormalLevelTitle(cefr: string): string {
  const norm = (cefr || "A1").toUpperCase().slice(0, 2);
  switch (norm) {
    case "A1":
      return "Breakthrough";
    case "A2":
      return "Elementary";
    case "B1":
      return "Intermediate";
    case "B2":
      return "Upper-Intermediate";
    case "C1":
      return "Advanced";
    case "C2":
      return "Proficient Mastery";
    default:
      return "Competency";
  }
}

export function CertificateCard({ data, onClose, isModal = true }: CertificateCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const examDate = new Date(data.examDate || data.issuedAt);
  const formattedDate = examDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const levelTitle = getFormalLevelTitle(data.cefrLevel);
  const avgScore = data.score || 85;

  const structureScore = data.structureScore ?? avgScore;
  const readingScore = data.readingScore ?? avgScore;
  const listeningScore = data.listeningScore ?? avgScore;
  const dictationScore = data.dictationScore ?? avgScore;
  const conversationScore = data.conversationScore ?? avgScore;
  const compositionScore = data.compositionScore ?? avgScore;

  const grade =
    data.grade ||
    (avgScore >= 89 ? "EXCELLENT" : avgScore >= 76 ? "GOOD" : "FAIR");

  const placeOfEntry = data.placeOfEntry || "PBN Kelapa Gading, D.18\nJember East Java";
  const directorName = data.directorName || "KHOIRUL ANWAR, M.Pd";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadPng = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const node = printRef.current;
      const svgXml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${node.offsetWidth}" height="${node.offsetHeight}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${node.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;
      const svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = node.offsetWidth * 2;
        canvas.height = node.offsetHeight * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.download = `Certificate-${data.cefrLevel}-${data.certificateNumber}.png`;
          a.href = pngUrl;
          a.click();
        }
        URL.revokeObjectURL(blobURL);
        setDownloading(false);
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobURL);
        handlePrint();
        setDownloading(false);
      };
      img.src = blobURL;
    } catch {
      handlePrint();
      setDownloading(false);
    }
  };

  const certificateBody = (
    <div
      ref={printRef}
      id="printable-certificate"
      className="relative w-full max-w-[620px] aspect-[1/1.414] bg-[#FCFBF7] text-[#0A2540] rounded-lg shadow-2xl border border-slate-300 overflow-hidden flex flex-col justify-between select-none"
      style={{
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Top Left Yellow Geometric Accent */}
      <div className="absolute top-0 left-0 w-36 h-3.5 bg-[#F5A623] z-10" />

      {/* Main Certificate Content Area */}
      <div className="relative flex-1 flex flex-col px-7 sm:px-10 pt-6 pb-2 z-10">
        {/* Header: Logos & Accreditation */}
        <div className="flex items-start justify-end gap-3 pt-1">
          {/* BAN-PAUD PNF Accreditation Mark */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1">
              <div className="w-9 h-9 rounded-full border border-slate-400/60 p-0.5 flex items-center justify-center bg-white shadow-2xs">
                <div className="relative w-full h-full rounded-full border border-slate-300 flex items-center justify-center">
                  <span className="text-[10px] font-black text-amber-500 font-sans tracking-tight">BAN</span>
                </div>
              </div>
            </div>
            <div className="text-[6.5px] leading-[1.2] text-slate-500 font-sans mt-0.5 max-w-[155px]">
              <p className="font-semibold text-slate-700">Terakreditasi BAN PAUD dan PNF Nomor:</p>
              <p>148/BAN PAUD dan PNF/AKR/2019</p>
              <p>NPSN : K5659751</p>
              <p>Nomor Ijin : 503/A.1/1.KP-P/411/35.09.325/2024</p>
            </div>
          </div>

          {/* EDDY'S Great Communicators Official Logo */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#0D3B66] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              🌐
            </div>
            <div className="leading-none text-left">
              <span className="block text-sm sm:text-base font-black tracking-tight text-[#0D3B66]">
                EDDY&apos;S
              </span>
              <span className="block text-[7.5px] font-bold text-red-600 tracking-wider">
                Great Communicators
              </span>
              <span className="block text-[6px] text-slate-400 font-mono tracking-widest uppercase">
                SINCE 1988
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Title & Headings */}
        <div className="text-center mt-5 mb-3 space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#0A2540] uppercase font-sans">
            TO WHOM IT MAY CONCERN
          </h1>
          <h2 className="text-sm sm:text-base font-bold tracking-widest text-[#F5A623] uppercase font-sans">
            EDDY&apos;S LOCAL EXAMINATION IN ENGLISH
          </h2>
        </div>

        {/* Candidate Award Statement */}
        <div className="text-center space-y-1 my-2">
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans">
            This is to certify the candidate named above
            <br />
            examined for the <strong className="font-bold text-slate-900">{levelTitle}</strong> level in English
            <br />
            and qualified for the award of:
          </p>

          <div className="pt-1.5 pb-2">
            <h3 className="text-lg sm:text-2xl font-serif font-black tracking-wide text-[#0D3B66] underline decoration-[#F5A623] decoration-2 underline-offset-4 uppercase">
              {data.userName}
            </h3>
          </div>
        </div>

        {/* 6 Skills Grades Breakdown Table */}
        <div className="flex justify-center my-1">
          <div className="w-full max-w-[340px] text-[11px] sm:text-xs font-mono font-bold text-slate-800 space-y-1 bg-white/70 p-3 rounded-lg border border-slate-200/80 shadow-2xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-0.5">
              <span className="tracking-wide">STRUCTURE &amp; VOCABULARY</span>
              <span className="text-slate-900">: {structureScore}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-0.5">
              <span className="tracking-wide">READING COMPREHENSION</span>
              <span className="text-slate-900">: {readingScore}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-0.5">
              <span className="tracking-wide">LISTENING COMPREHENSION</span>
              <span className="text-slate-900">: {listeningScore}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-0.5">
              <span className="tracking-wide">DICTATION</span>
              <span className="text-slate-900">: {dictationScore}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-0.5">
              <span className="tracking-wide">CONVERSATION</span>
              <span className="text-slate-900">: {conversationScore}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="tracking-wide">COMPOSITION</span>
              <span className="text-slate-900">: {compositionScore}</span>
            </div>
          </div>
        </div>

        {/* Pass Standard Criteria Box */}
        <div className="flex justify-center my-2">
          <div className="px-5 py-1.5 rounded-full border border-slate-800/80 text-center bg-white/90 shadow-2xs">
            <p className="text-[7.5px] font-bold tracking-widest text-slate-800 uppercase">
              THE PASS STANDART IS INDICATED THUS
            </p>
            <p className="text-[8.5px] font-mono font-semibold text-slate-700 tracking-wider">
              89–100 = EXCELLENT &nbsp;|&nbsp; 76–88 = GOOD &nbsp;|&nbsp; 60–75 = FAIR
            </p>
            <div className="mt-0.5">
              <span className="inline-block px-2 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                AWARD: {grade} ({avgScore}%)
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Metadata (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 text-center text-[8.5px] sm:text-[9.5px] text-slate-700 font-sans mt-3 pt-2 border-t border-slate-200">
          <div>
            <span className="font-bold block text-slate-900">Date of Examination</span>
            <span className="text-slate-600 font-medium block mt-0.5">{formattedDate}</span>
          </div>
          <div>
            <span className="font-bold block text-slate-900">Place of Entry</span>
            <span className="text-slate-600 block whitespace-pre-line leading-tight mt-0.5">{placeOfEntry}</span>
          </div>
          <div>
            <span className="font-bold block text-slate-900">Reference No.</span>
            <span className="font-mono font-bold text-slate-900 block mt-0.5">{data.certificateNumber}</span>
          </div>
        </div>

        {/* Director of Studies Signature & Stamp */}
        <div className="flex flex-col items-center justify-center text-center mt-3 mb-1">
          <span className="text-[9.5px] font-bold text-slate-800 block">Director of Studies</span>
          
          <div className="relative w-40 h-14 flex items-center justify-center my-0.5">
            {/* Stamp Simulation */}
            <div className="absolute w-14 h-14 rounded-full border-2 border-indigo-700/60 text-indigo-700/80 flex flex-col items-center justify-center -rotate-12 pointer-events-none select-none text-[6px] font-black leading-none uppercase">
              <span>EDDY&apos;S</span>
              <span className="text-[5px] text-indigo-600">OFFICIAL</span>
              <span>SEAL</span>
            </div>

            {/* Signature Stroke SVG */}
            <svg
              className="relative w-32 h-10 text-indigo-950 z-10"
              viewBox="0 0 160 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15,35 C30,10 40,45 55,20 C70,45 80,15 95,30 C110,15 125,35 145,25" />
              <path d="M25,28 Q75,48 135,32" strokeWidth="1.5" />
            </svg>
          </div>

          <span className="font-serif font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
            {directorName}
          </span>
        </div>
      </div>

      {/* Official Bottom Deep Navy Strip */}
      <div className="w-full bg-[#0D3B66] text-white py-1.5 px-4 sm:px-6 flex items-center justify-between text-[8px] sm:text-[9px] font-sans font-medium tracking-tight z-10">
        <div className="flex items-center gap-1">
          <span>📷 🎵 🌐</span>
          <span>Eddy&apos;s English Jember</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📞</span>
          <span>+62 813-3671-2345</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span>Perum Puri Bunga Nirwana D18 Kelapa Gading</span>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return certificateBody;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col items-center">
        {/* Action Controls (Hidden on Print) */}
        <div className="no-print flex items-center justify-between w-full max-w-[620px] mb-2 px-1 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
            <span className="font-bold text-xs sm:text-sm tracking-wide">Sertifikat Kelulusan Resmi EDDY&apos;S</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-[#F5A623] hover:bg-[#d99f14] text-[#0A2540] font-bold text-xs shadow-md gap-1.5 h-8 px-3"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </Button>
            <Button
              onClick={handleDownloadPng}
              disabled={downloading}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-xs h-8 px-3 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Menyimpan..." : "PNG"}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* The Certificate itself */}
        {certificateBody}
      </div>

      {/* Print Specific CSS to Isolate Certificate on A4 Portrait */}
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
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
