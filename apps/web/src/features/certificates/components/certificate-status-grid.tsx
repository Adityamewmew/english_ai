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

interface CertificateStatusGridProps {
  userId: string;
  userName: string;
  currentCefr: string; // e.g. "A1.1", "A1", "A2.1"
}

export function CertificateStatusGrid({
  userId,
  userName,
  currentCefr,
}: CertificateStatusGridProps) {
  // Extract CEFR category (e.g. "A1.1" -> "A1")
  const studentCategory = currentCefr ? currentCefr.slice(0, 2).toUpperCase() : "A1";

  const { data: statusList, isLoading, error } = useCertificateStatus(userId, studentCategory);

  const levelStatus = statusList?.[0] || null;
  const isUnlocked = levelStatus?.status === "unlocked" || levelStatus?.status === "claimed";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D3B66] mb-3" />
        <p className="text-sm font-medium">Memeriksa status sertifikat kelulusan CEFR {studentCategory} Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
        <p>Gagal memuat status sertifikat: {String(error)}</p>
      </div>
    );
  }

  // 1. UNLOCKED STATE: Student completed all modules!
  if (isUnlocked && levelStatus) {
    const certData = {
      certificateNumber: levelStatus.certificate?.certificateNumber || `EDDY-${studentCategory}-CERT`,
      userName: userName || "Student",
      cefrLevel: studentCategory,
      title: levelStatus.title,
      description: levelStatus.description,
      score: levelStatus.averageScore || 85,
      issuedAt: levelStatus.certificate?.issuedAt || new Date(),
      instructorName: levelStatus.instructorName,
      instructorTitle: levelStatus.instructorTitle,
      backgroundUrl: levelStatus.backgroundUrl,
      themeColor: levelStatus.themeColor,
    };

    return (
      <div className="space-y-6">
        {/* Congratulatory Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0D3B66] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-[#0D3B66]">
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
                Selamat! Anda Telah Menyelesaikan Level {studentCategory}
              </h1>
              <p className="text-xs text-slate-200 mt-0.5">
                Sertifikat resmi kompetensi bahasa Inggris Anda telah diterbitkan dan siap diunduh atau dicetak.
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="w-full sm:w-auto bg-[#F4B41A] hover:bg-[#d99f14] text-[#0D3B66] font-bold text-xs gap-2 shrink-0 shadow-md"
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
      {/* Header Info */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0D3B66]/10 text-[#0D3B66] flex items-center justify-center font-bold text-sm">
            {studentCategory}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sertifikat Kelulusan Level {studentCategory}
            </h1>
            <p className="text-xs text-slate-500">
              Standar Kompetensi Bahasa Inggris CEFR (Common European Framework of Reference)
            </p>
          </div>
        </div>
      </div>

      {/* Locked Empty State Card */}
      <Card className="p-8 sm:p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-1">
          Sertifikat Belum Tersedia
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          Sertifikat kelulusan resmi CEFR {studentCategory} akan otomatis terbit dan tampil di halaman ini setelah Anda menuntaskan seluruh modul pembelajaran pada kategori ini.
        </p>

        {/* Progress Strip */}
        <div className="w-full max-w-md p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6 text-left">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#0D3B66]" />
              Progres Modul Level {studentCategory}
            </span>
            <span className="font-bold text-[#0D3B66]">
              {levelStatus?.completedModules ?? 0} / {levelStatus?.totalModules ?? 0} Modul Selesai
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0D3B66] transition-all duration-500"
              style={{ width: `${levelStatus?.progressPercent ?? 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Selesaikan {(levelStatus?.totalModules ?? 0) - (levelStatus?.completedModules ?? 0)} modul lagi untuk membuka sertifikat Anda.
          </p>
        </div>

        <Button
          asChild
          className="bg-[#0D3B66] hover:bg-[#082542] text-white font-medium text-xs px-6 py-2.5 shadow-sm"
        >
          <Link href="/modules">
            Lanjutkan Belajar Modul
          </Link>
        </Button>
      </Card>
    </div>
  );
}
