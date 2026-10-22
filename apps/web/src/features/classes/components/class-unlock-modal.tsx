"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Sparkles,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { usePurchaseClass } from "../hooks/use-classes";
import type { CourseClassItem } from "../api/classes.api";

interface ClassUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: CourseClassItem | null;
  userId: string;
  onSuccess?: () => void;
}

export function ClassUnlockModal({
  isOpen,
  onClose,
  classItem,
  userId,
  onSuccess,
}: ClassUnlockModalProps) {
  const purchaseMutation = usePurchaseClass();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !classItem) return null;

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  const features =
    classItem.features && Array.isArray(classItem.features)
      ? classItem.features
      : [
          `Akses penuh seluruh modul level ${classItem.cefr}`,
          "Latihan speaking & percakapan AI interaktif",
          "Kuis formatif & ujian kompetensi level",
          `Sertifikat kelulusan resmi CEFR ${classItem.cefr}`,
        ];

  const handleConfirmPurchase = async () => {
    setErrorMsg(null);
    try {
      await purchaseMutation.mutateAsync({
        userId,
        cefr: classItem.cefr,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Gagal membuka akses kelas. Pastikan prasyarat terpenuhi atau hubungi admin."
      );
    }
  };

  const discountPercent =
    classItem.originalPrice && classItem.originalPrice > classItem.price
      ? Math.round(
          ((classItem.originalPrice - classItem.price) /
            classItem.originalPrice) *
            100
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 border-b-6 border-b-slate-300 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 flex items-center justify-center font-heading font-extrabold text-lg shadow-xs">
              {classItem.cefr}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  Paket Kelas CEFR
                </span>
                {discountPercent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                    Hemat {discountPercent}%
                  </span>
                )}
              </div>
              <h3 className="font-heading text-lg font-extrabold text-slate-900 mt-0.5 leading-snug">
                {classItem.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Biaya Investasi Belajar</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading text-2xl font-black text-slate-900">
                {formatRupiah(classItem.price)}
              </span>
              {classItem.originalPrice && classItem.originalPrice > classItem.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatRupiah(classItem.originalPrice)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-emerald-700 font-heading text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Akses Permanen
          </div>
        </div>

        {/* Description & Feature Benefits */}
        <div className="space-y-3">
          {classItem.description && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {classItem.description}
            </p>
          )}

          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Fasilitas & Manfaat Kelas:
            </p>
            <div className="space-y-1.5">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Requirement warning if student is not eligible */}
        {!classItem.isEligible && classItem.prerequisiteCefr && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Prasyarat belum terpenuhi: Kamu perlu lulus dan menerima sertifikat level{" "}
              <strong>{classItem.prerequisiteCefr}</strong> sebelum dapat membuka kelas ini.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 border-b-3 border-b-slate-400 text-slate-700 text-xs font-bold hover:bg-slate-50 active:border-b active:translate-y-0.5 transition-all text-center"
          >
            Nanti Saja
          </button>
          <button
            type="button"
            onClick={handleConfirmPurchase}
            disabled={purchaseMutation.isPending || (!classItem.isEligible && !!classItem.requiresCertificate)}
            className="flex-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-b-indigo-800 active:border-b active:translate-y-0.5 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuka Akses...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Buka Akses Kelas Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
