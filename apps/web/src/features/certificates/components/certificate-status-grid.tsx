"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Lock,
  CheckCircle2,
  BookOpen,
  Loader2,
  AlertCircle,
  Printer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCertificateStatus } from "../hooks/use-certificates";
import { CertificateCard } from "./certificate-card";
import { printCertificate } from "../utils/print-certificate";

interface CertificateStatusGridProps {
  userId: string;
  userName: string;
  currentCefr: string; // e.g. "A1.1", "A1", "A2.1"
  isAdmin?: boolean;
}

const CEFR_CATEGORIES = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function CertificateStatusGrid({
  userId,
  userName,
  currentCefr,
  isAdmin = false,
}: CertificateStatusGridProps) {
  // Extract CEFR category (e.g. "A1.1" -> "A1")
  const defaultCategory = currentCefr ? currentCefr.slice(0, 2).toUpperCase() : "A1";
  const [selectedCategory, setSelectedCategory] = useState<string>(() => defaultCategory);

  const { data: statusList, isLoading, error } = useCertificateStatus(userId, selectedCategory);

  const levelStatus = statusList?.[0] || null;
  const isUnlocked =
    (isAdmin && levelStatus?.status !== "no_template") ||
    levelStatus?.status === "unlocked" ||
    levelStatus?.status === "claimed";

  const renderCategoryTabs = () => (
    <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs mb-6">
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto">
        {CEFR_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#0D3B66] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            CEFR {cat}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-300/60 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Akses Admin: Full Unlock Tanpa Syarat Modul</span>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {renderCategoryTabs()}
        <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D3B66] mb-3" />
          <p className="text-sm font-medium">Memeriksa status sertifikat kelulusan CEFR {selectedCategory} Anda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {renderCategoryTabs()}
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>Gagal memuat status sertifikat: {String(error)}</p>
        </div>
      </div>
    );
  }

  // 1. UNLOCKED STATE: Student completed all modules OR user is admin!
  if (isUnlocked && levelStatus) {
    const certData = {
      certificateNumber: levelStatus.certificate?.certificateNumber || `EDDY-${selectedCategory}-CERT`,
      userName: userName || "Mr. Khoirul",
      cefrLevel: selectedCategory,
      title: levelStatus.title,
      description: levelStatus.description,
      score: levelStatus.averageScore || 85,
      scoresBreakdown: (levelStatus.certificate as any)?.scoresBreakdown || {
        structureAndVocabulary: 90,
        readingComprehension: 92,
        listeningComprehension: 94,
        dictation: 90,
        conversation: 95,
        composition: 90,
        averageScore: levelStatus.averageScore || 92,
        qualification: "EXCELLENT",
      },
      issuedAt: levelStatus.certificate?.issuedAt || new Date(),
      instructorName: levelStatus.instructorName,
      instructorTitle: levelStatus.instructorTitle,
      signatureUrl: levelStatus.signatureUrl,
      backgroundUrl: levelStatus.backgroundUrl,
      themeColor: levelStatus.themeColor,
      orientation: (levelStatus as any).orientation || "portrait",
      placeOfEntry: (levelStatus as any).placeOfEntry,
      nameXPercent: (levelStatus as any).nameXPercent,
      nameYPercent: levelStatus.nameYPercent,
      nameFontSize: levelStatus.nameFontSize,
      scoresXPercent: (levelStatus as any).scoresXPercent,
      scoresYPercent: (levelStatus as any).scoresYPercent,
      scoresFontSize: (levelStatus as any).scoresFontSize,
      dateXPercent: (levelStatus as any).dateXPercent,
      dateYPercent: (levelStatus as any).dateYPercent,
      dateFontSize: (levelStatus as any).dateFontSize,
      placeXPercent: (levelStatus as any).placeXPercent,
      placeYPercent: (levelStatus as any).placeYPercent,
      placeFontSize: (levelStatus as any).placeFontSize,
      refNoXPercent: (levelStatus as any).refNoXPercent,
      refNoYPercent: (levelStatus as any).refNoYPercent,
      refNoFontSize: (levelStatus as any).refNoFontSize,
    };

    return (
      <div className="space-y-6">
        {renderCategoryTabs()}

        {/* Congratulatory Banner */}
        <div className="no-print p-5 sm:p-6 rounded-2xl bg-[#0D3B66] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-[#0D3B66]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4B41A] text-[#0D3B66] flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest text-[#F4B41A] uppercase">
                  SERTIFIKAT RESMI TERBIT
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                  LULUS
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Selamat! Anda Telah Menyelesaikan Level {selectedCategory}
              </h1>
              <p className="text-xs text-slate-200 mt-0.5">
                Sertifikat resmi kompetensi bahasa Inggris Anda telah diterbitkan dan siap diunduh atau dicetak.
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              const isSquare = ((levelStatus as any)?.orientation || "").toLowerCase() === "square";
              const isPortrait = !isSquare && ((levelStatus as any)?.orientation || "portrait").toLowerCase() !== "landscape";
              printCertificate(isSquare, isPortrait);
            }}
            className="w-full sm:w-auto bg-[#F4B41A] hover:bg-[#d99f14] text-[#0D3B66] font-bold text-xs gap-2 shrink-0 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </Button>
        </div>

        {/* The Certificate Itself - Displayed Directly on the Page */}
        <div className="flex justify-center py-2">
          <CertificateCard data={certData} isModal={false} />
        </div>
      </div>
    );
  }

  // 2. LOCKED STATE: Student has NOT completed all modules yet
  return (
    <div className="space-y-6">
      {renderCategoryTabs()}

      {/* Header Info */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-sky-500/15 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
            {selectedCategory}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sertifikat Kelulusan Level {selectedCategory}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standar Kompetensi Bahasa Inggris CEFR (Common European Framework of Reference)
            </p>
          </div>
        </div>
      </div>

      {/* Locked Empty State Card */}
      <Card className="p-8 sm:p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          {levelStatus?.status === "no_template" ? "Template Sertifikat Belum Dibuat" : "Sertifikat Belum Tersedia"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          {levelStatus?.status === "no_template"
            ? `Admin belum membuat template sertifikat resmi untuk CEFR ${selectedCategory}. Buat template di menu Admin Portal > Sertifikat.`
            : `Sertifikat kelulusan resmi CEFR ${selectedCategory} akan otomatis terbit dan tampil di halaman ini setelah Anda menuntaskan seluruh modul pembelajaran pada kategori ini.`}
        </p>

        {/* Progress Strip */}
        <div className="w-full max-w-md p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-6 text-left">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#0D3B66] dark:text-sky-400" />
              Progres Modul Level {selectedCategory}
            </span>
            <span className="font-bold text-[#0D3B66] dark:text-sky-400">
              {levelStatus?.completedModules ?? 0} / {levelStatus?.totalModules ?? 0} Modul Selesai
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0D3B66] dark:bg-sky-500 transition-all duration-500"
              style={{ width: `${levelStatus?.progressPercent ?? 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Selesaikan {(levelStatus?.totalModules ?? 0) - (levelStatus?.completedModules ?? 0)} modul lagi untuk membuka sertifikat Anda.
          </p>
        </div>

        <Button
          asChild
          className="bg-[#0D3B66] hover:bg-[#082542] text-white font-medium text-xs px-6 py-2.5 shadow-xs cursor-pointer"
        >
          <Link href="/modules">
            Lanjutkan Belajar Modul
          </Link>
        </Button>
      </Card>
    </div>
  );
}
