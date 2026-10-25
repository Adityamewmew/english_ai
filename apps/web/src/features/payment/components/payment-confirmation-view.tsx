"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Upload,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankLogo } from "./bank-logo";
import {
  usePaymentOrder,
  useSimulateSandbox,
  useUploadProof,
} from "../hooks/use-payment";

interface PaymentConfirmationViewProps {
  orderId: string;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        const max = 1200;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export function PaymentConfirmationView({ orderId }: PaymentConfirmationViewProps) {
  const { data: order, isLoading, error, refetch, isRefetching } = usePaymentOrder(orderId);
  const simulateMutation = useSimulateSandbox();
  const uploadProofMutation = useUploadProof();

  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!order?.expiresAt) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const expiry = new Date(order.expiresAt).getTime();
      const diff = Math.max(0, expiry - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [order?.expiresAt]);

  const handleCopyVa = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleCopyAmount = (val: number) => {
    navigator.clipboard.writeText(val.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSimulateSuccess = async () => {
    if (simulateMutation.isPending) return;
    await simulateMutation.mutateAsync(orderId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(proofFile);
      await uploadProofMutation.mutateAsync({
        orderId,
        proofUrl: base64,
      });
      setProofSubmitted(true);
      setProofFile(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#0D3B66] animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Memuat rincian pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4 card-skeuo">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Link pembayaran ini tidak valid atau telah dihapus dari sistem.
          </p>
          <Button asChild className="btn-skeuo-navy bg-[#0D3B66] text-white">
            <Link href="/curriculum">Kembali ke Kurikulum</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "paid";
  const isWaitingApproval = order.status === "waiting_approval";
  const isExpired =
    order.status === "expired" ||
    (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && !isPaid);

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 flex flex-col items-center font-sans">
      <div className="w-full max-w-lg space-y-4">
        {/* 1. Mode Uji Coba (Sandbox) Yellow Banner */}
        {!isPaid && !isExpired && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-950">Mode Uji Coba (Sandbox)</h4>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Gunakan tombol simulasi untuk menyelesaikan pembayaran secara instan tanpa aplikasi perbankan.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateSuccess}
              disabled={simulateMutation.isPending}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-amber-700 text-xs font-bold py-1.5 px-3 rounded-xl shadow-2xs transition disabled:opacity-50"
            >
              {simulateMutation.isPending ? "Memproses..." : "Simulasikan Sukses"}
            </Button>
          </div>
        )}

        {/* 2. Main Confirmation Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-5 card-skeuo">
          {/* Header Status & Countdown */}
          {isPaid ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                Pembayaran Berhasil!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Akses ke kelas <strong>{order.className} ({order.tier.toUpperCase()})</strong> telah aktif sepenuhnya.
              </p>
              <div className="pt-2">
                <Button asChild className="btn-skeuo-navy bg-[#0D3B66] text-white">
                  <Link href="/curriculum" className="inline-flex items-center gap-2">
                    Masuk ke Kelas Sekarang <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : isExpired ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                Batas Waktu Telah Berakhir
              </h2>
              <p className="text-xs text-slate-500">
                Invoice pembayaran ini telah kedaluwarsa. Silakan lakukan pemesanan ulang dari menu kelas.
              </p>
              <Button asChild variant="outline" className="rounded-xl font-bold text-xs">
                <Link href="/curriculum">Pilih Kelas Baru</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Status Menunggu Pembayaran & Timer Countdown */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <Clock className="w-4 h-4" />
                    <span>{isWaitingApproval ? "Menunggu Verifikasi Admin" : "Menunggu Pembayaran"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Batas bayar: {formatDate(order.expiresAt)}
                  </p>
                </div>

                {/* Red Timer Badges (Jam : Menit : Detik) */}
                <div className="flex items-center gap-1 text-center">
                  <div className="flex flex-col items-center">
                    <span className="bg-rose-600 text-white font-mono font-black text-xs px-2 py-1 rounded-md min-w-[28px] shadow-2xs">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Jam</span>
                  </div>
                  <span className="font-bold text-slate-400 -mt-3.5">:</span>
                  <div className="flex flex-col items-center">
                    <span className="bg-rose-600 text-white font-mono font-black text-xs px-2 py-1 rounded-md min-w-[28px] shadow-2xs">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Menit</span>
                  </div>
                  <span className="font-bold text-slate-400 -mt-3.5">:</span>
                  <div className="flex flex-col items-center">
                    <span className="bg-rose-600 text-white font-mono font-black text-xs px-2 py-1 rounded-md min-w-[28px] shadow-2xs">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Detik</span>
                  </div>
                </div>
              </div>

              {/* Bank Channel Card with Official Bank Logo */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-14 h-10 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-1.5 shrink-0 shadow-2xs overflow-hidden">
                  <BankLogo code={order.paymentChannel} size="md" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 font-heading">
                    {order.paymentCategory === "va"
                      ? `${order.paymentChannel.replace(/_VA$/i, "")} Virtual Account`
                      : order.paymentCategory === "qris"
                      ? "QRIS (Semua Pembayaran)"
                      : order.paymentCategory === "manual_transfer"
                      ? "Transfer Bank Manual"
                      : order.paymentChannel}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {order.paymentCategory === "manual_transfer"
                      ? "Konfirmasi verifikasi oleh admin"
                      : "Verifikasi instan otomatis 24 jam"}
                  </p>
                </div>
              </div>

              {/* Nomor Virtual Account Box */}
              {order.paymentCategory === "va" && order.vaNumber && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Nomor Virtual Account
                    </span>
                    <div className="text-lg md:text-xl font-black text-slate-900 tracking-wide font-mono mt-0.5">
                      {order.vaNumber}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyVa(order.vaNumber!)}
                    className="flex items-center gap-1.5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    {copiedVa ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin No. VA</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* QRIS Display */}
              {order.paymentCategory === "qris" && order.qrImageUrl && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Scan QRIS untuk Membayar
                  </span>
                  <div className="flex justify-center">
                    <img
                      src={order.qrImageUrl}
                      alt="QRIS Code"
                      className="w-48 h-48 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI &amp; seluruh mobile banking.
                  </p>
                </div>
              )}

              {/* Manual Bank Info */}
              {order.paymentCategory === "manual_transfer" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Rekening Tujuan</span>
                      <div className="flex items-center gap-2">
                        <BankLogo
                          code={order.singapayPayload?.manual_bank?.bankName || "BCA"}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {order.singapayPayload?.manual_bank?.bankName || "Bank BCA"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Nomor Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          {order.singapayPayload?.manual_bank?.accountNumber || "8920192831"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleCopyVa(order.singapayPayload?.manual_bank?.accountNumber || "8920192831")
                          }
                          className="h-7 w-7 text-slate-600 hover:text-slate-900"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Atas Nama:</span>
                      <span className="text-xs font-bold text-slate-800">
                        {order.singapayPayload?.manual_bank?.accountName || "KHOIRUL ANWAR"}
                      </span>
                    </div>
                  </div>

                  {/* Form Upload Bukti Transfer */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <FileCheck className="w-4 h-4 text-[#0D3B66]" />
                      <span>Unggah Bukti Transfer</span>
                    </div>

                    {(order.transferProofUrl || proofPreview) && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-2">
                        <img
                          src={proofPreview || order.transferProofUrl || ""}
                          alt="Bukti Transfer"
                          className="max-h-48 w-auto rounded-lg object-contain shadow-2xs border border-slate-100"
                        />
                        {proofFile && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                          </span>
                        )}
                      </div>
                    )}

                    <form onSubmit={handleSubmitProof} className="space-y-2.5">
                      <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#0D3B66]/30 rounded-xl bg-white hover:bg-[#0D3B66]/5 transition cursor-pointer text-center group">
                        <Upload className="w-5 h-5 text-[#0D3B66] group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-[#0D3B66]">
                          {proofFile ? "Ganti Gambar Bukti" : "Pilih Foto Bukti Transfer"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Format JPG, PNG, atau WebP
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {proofFile && (
                        <Button
                          type="submit"
                          disabled={uploadProofMutation.isPending || isCompressing}
                          className="btn-skeuo-navy bg-[#0D3B66] text-white w-full h-10 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {uploadProofMutation.isPending || isCompressing
                            ? "Mengirim Bukti..."
                            : "Kirim Bukti Pembayaran"}
                        </Button>
                      )}
                    </form>

                    {(isWaitingApproval || order.transferProofUrl || proofSubmitted) && (
                      <p className="text-[11px] text-amber-800 flex items-center gap-1.5 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Bukti transfer tersimpan. Menunggu verifikasi admin untuk aktivasi kelas.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Total Nominal Transfer Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Nominal Transfer
                  </span>
                  <div className="text-lg md:text-xl font-black text-slate-900 mt-0.5 font-heading">
                    {formatRupiah(order.amount)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyAmount(order.amount)}
                  className="flex items-center gap-1.5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  {copiedAmount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Jumlah</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Accordion Panduan Pembayaran */}
              {order.guides && order.guides.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-800">Panduan Pembayaran:</h4>
                  <div className="space-y-2">
                    {order.guides.map((g, idx) => {
                      const isOpen = openAccordion === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200/80 rounded-2xl overflow-hidden transition bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-3.5 text-left bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800">{g.channel}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="p-3.5 pt-0 bg-white text-slate-600 text-[11px] leading-relaxed border-t border-slate-100">
                              <ol className="list-decimal list-inside space-y-1 mt-2">
                                {g.steps.map((st, stepIdx) => (
                                  <li key={stepIdx} className="text-slate-600">
                                    {st}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tombol Cek Status Pembayaran */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="w-full h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:bg-slate-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefetching ? "animate-spin text-[#0D3B66]" : ""}`}
                  />
                  {isRefetching ? "Memeriksa Status..." : "Cek Status Pembayaran"}
                </Button>
              </div>

              {/* Hubungi WhatsApp Bantuan */}
              {order.whatsappSupport && (
                <div className="text-center pt-1">
                  <a
                    href={`https://wa.me/${order.whatsappSupport.number}?text=${order.whatsappSupport.message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Butuh bantuan? Hubungi Admin via WhatsApp
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
