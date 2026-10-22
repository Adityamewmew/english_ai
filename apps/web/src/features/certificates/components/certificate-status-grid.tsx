"use client";

import React, { useState } from "react";
import {
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCertificateStatus, useClaimCertificate } from "../hooks/use-certificates";
import { useSession } from "@/features/auth";
import { CertificateCard, CertificateModalData } from "./certificate-card";

export function CertificateStatusGrid() {
  const { data: sessionUser } = useSession();
  const studentUserId = sessionUser?.userId;
  const { data: statusList, isLoading, error } = useCertificateStatus(studentUserId);
  const claimMutation = useClaimCertificate();

  const [activeCertificate, setActiveCertificate] = useState<CertificateModalData | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleClaim = async (cefr: string) => {
    setClaimError(null);
    try {
      const res = await claimMutation.mutateAsync({
        cefr,
        userId: studentUserId,
      });

      if (res?.certificate) {
        setActiveCertificate({
          certificateNumber: res.certificate.certificateNumber,
          userName: sessionUser?.name || "Student",
          cefrLevel: cefr,
          title: res.template?.title || `Certificate of CEFR ${cefr} Proficiency`,
          description: res.template?.description || null,
          score: res.certificate.score,
          issuedAt: res.certificate.issuedAt,
          instructorName: res.template?.instructorName,
          instructorTitle: res.template?.instructorTitle,
          backgroundUrl: res.template?.backgroundUrl,
          themeColor: res.template?.themeColor,
        });
      }
    } catch (err: any) {
      setClaimError(err?.message || "Gagal mengklaim sertifikat. Silakan coba lagi.");
    }
  };

  const handleViewCertificate = (item: any) => {
    setActiveCertificate({
      certificateNumber: item.certificate?.certificateNumber || "EDDY-CERT",
      userName: sessionUser?.name || "Student",
      cefrLevel: item.cefr,
      title: item.title,
      description: item.description,
      score: item.averageScore || 85,
      issuedAt: item.certificate?.issuedAt || new Date(),
      instructorName: item.instructorName,
      instructorTitle: item.instructorTitle,
      backgroundUrl: item.backgroundUrl,
      themeColor: item.themeColor,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D3B66] mb-3" />
        <p className="text-sm font-medium">Memuat status sertifikat level CEFR Anda...</p>
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D3B66] via-[#1B4965] to-[#2E5B88] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F4B41A] text-xs font-bold mb-3 border border-white/10">
            <Award className="w-4 h-4" />
            STANDAR CEFR RESMI
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sertifikat Kelulusan Level Bahasa Inggris
          </h1>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed">
            Selesaikan seluruh modul kurikulum pada suatu level CEFR (misal A1: Level 1, 2, dan 3)
            untuk mengklaim sertifikat kompetensi resmi berstandar internasional.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Claim Error Alert */}
      {claimError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{claimError}</span>
          <Button variant="ghost" size="sm" onClick={() => setClaimError(null)}>
            Tutup
          </Button>
        </div>
      )}

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statusList?.map((item) => {
          const isClaimed = item.status === "claimed";
          const isEligible = item.status === "eligible";
          const isLocked = item.status === "locked";

          return (
            <Card
              key={item.cefr}
              className={`relative overflow-hidden transition-all duration-300 flex flex-col justify-between border-2 ${
                isClaimed
                  ? "border-emerald-500/50 bg-gradient-to-b from-emerald-50/40 to-white shadow-md shadow-emerald-500/5"
                  : isEligible
                  ? "border-[#F4B41A] bg-gradient-to-b from-amber-50/50 to-white shadow-lg shadow-amber-500/10 ring-2 ring-[#F4B41A]/30"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="p-5">
                {/* Top Badge & Level Indicator */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-[#0D3B66] text-[#F4B41A] font-black flex items-center justify-center text-sm shadow-sm">
                      {item.cefr}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {item.title}
                      </h3>
                      <span className="text-xs text-slate-500">Standar CEFR</span>
                    </div>
                  </div>

                  {isClaimed && (
                    <Badge variant="success" className="gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      Telah Terbit
                    </Badge>
                  )}
                  {isEligible && (
                    <Badge className="bg-[#F4B41A] text-[#0D3B66] font-bold gap-1 animate-pulse shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Siap Diklaim
                    </Badge>
                  )}
                  {isLocked && (
                    <Badge variant="secondary" className="gap-1 text-slate-500">
                      <Lock className="w-3 h-3" />
                      Belum Selesai
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {item.description ||
                    `Kuasai seluruh modul pembelajaran pada tingkatan ${item.cefr} untuk mendapatkan sertifikat resmi.`}
                </p>

                {/* Progress Bar & Module Count */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Modul Selesai
                    </span>
                    <span className="font-semibold text-slate-700">
                      {item.completedModules} / {item.totalModules}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isClaimed
                          ? "bg-emerald-500"
                          : isEligible
                          ? "bg-[#F4B41A]"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-50/60 border-t border-slate-100 mt-2">
                {isClaimed && (
                  <Button
                    onClick={() => handleViewCertificate(item)}
                    className="w-full bg-[#0D3B66] hover:bg-[#082542] text-white font-medium text-xs gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#F4B41A]" />
                    Lihat & Unduh Sertifikat
                  </Button>
                )}

                {isEligible && (
                  <Button
                    onClick={() => handleClaim(item.cefr)}
                    disabled={claimMutation.isPending}
                    className="w-full bg-[#F4B41A] hover:bg-[#d99f14] text-[#0D3B66] font-bold text-xs gap-1.5 shadow-md"
                  >
                    {claimMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Klaim Sertifikat Anda
                  </Button>
                )}

                {isLocked && (
                  <div className="text-center text-[11px] text-slate-500 font-medium py-1">
                    Selesaikan {item.totalModules - item.completedModules} modul lagi untuk membuka
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Certificate Modal */}
      {activeCertificate && (
        <CertificateCard
          data={activeCertificate}
          onClose={() => setActiveCertificate(null)}
          isModal={true}
        />
      )}
    </div>
  );
}
