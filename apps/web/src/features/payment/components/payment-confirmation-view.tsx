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
  Zap,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Upload,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  usePaymentOrder,
  useSimulateSandbox,
  useUploadProof,
} from "../hooks/use-payment";

interface PaymentConfirmationViewProps {
  orderId: string;
}

export function PaymentConfirmationView({ orderId }: PaymentConfirmationViewProps) {
  const { data: order, isLoading, error, refetch, isRefetching } = usePaymentOrder(orderId);
  const simulateMutation = useSimulateSandbox();
  const uploadProofMutation = useUploadProof();

  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [proofInput, setProofInput] = useState("");
  const [proofSubmitted, setProofSubmitted] = useState(false);

  // Countdown timer state
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

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofInput.trim()) return;
    await uploadProofMutation.mutateAsync({
      orderId,
      proofUrl: proofInput.trim(),
    });
    setProofSubmitted(true);
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
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Memuat rincian pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Link pembayaran ini tidak valid atau telah dihapus dari sistem.
          </p>
          <Link
            href="/dashboard"
            className="inline-block py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "paid";
  const isWaitingApproval = order.status === "waiting_approval";
  const isExpired = order.status === "expired" || (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && !isPaid);

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-4">
        {/* 1. Mode Uji Coba (Sandbox) Yellow Banner - Sesuai Gambar 2 */}
        {!isPaid && !isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-950">Mode Uji Coba (Sandbox)</h4>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Gunakan tombol simulasi untuk menyelesaikan pembayaran secara instan tanpa aplikasi perbankan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSimulateSuccess}
              disabled={simulateMutation.isPending}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {simulateMutation.isPending ? "Memproses..." : "Simulasikan Sukses"}
            </button>
          </div>
        )}

        {/* 2. Main Confirmation Card - Sesuai Gambar 2 */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Header Status & Countdown */}
          {isPaid ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Pembayaran Berhasil!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Akses ke kelas <strong>{order.className} ({order.tier.toUpperCase()})</strong> telah aktif sepenuhnya.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Masuk ke Kelas Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : isExpired ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800">Batas Waktu Telah Berakhir</h2>
              <p className="text-xs text-slate-500">
                Invoice pembayaran ini telah kedaluwarsa. Silakan lakukan pemesanan ulang dari menu kelas.
              </p>
              <Link
                href="/dashboard"
                className="inline-block py-2.5 px-6 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
              >
                Pilih Kelas Baru
              </Link>
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
                    <span className="bg-rose-600 text-white font-extrabold text-xs px-2 py-1 rounded-md min-w-[28px]">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Jam</span>
                  </div>
                  <span className="font-bold text-slate-400 -mt-3.5">:</span>
                  <div className="flex flex-col items-center">
                    <span className="bg-rose-600 text-white font-extrabold text-xs px-2 py-1 rounded-md min-w-[28px]">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Menit</span>
                  </div>
                  <span className="font-bold text-slate-400 -mt-3.5">:</span>
                  <div className="flex flex-col items-center">
                    <span className="bg-rose-600 text-white font-extrabold text-xs px-2 py-1 rounded-md min-w-[28px]">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Detik</span>
                  </div>
                </div>
              </div>

              {/* Bank Channel Card */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center px-1 shrink-0 overflow-hidden">
                  <span className="font-black text-xs text-indigo-900 tracking-wider">
                    {order.paymentChannel.replace(/_VA$/i, "")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">
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

              {/* Nomor Virtual Account / QRIS / Rekening Bank Box */}
              {order.paymentCategory === "va" && order.vaNumber && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Nomor Virtual Account
                    </span>
                    <div className="text-lg md:text-xl font-extrabold text-slate-900 tracking-wide font-mono mt-0.5">
                      {order.vaNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyVa(order.vaNumber!)}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
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
                  </button>
                </div>
              )}

              {/* QRIS Display */}
              {order.paymentCategory === "qris" && order.qrImageUrl && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Scan QRIS untuk Membayar
                  </span>
                  <div className="flex justify-center">
                    <img
                      src={order.qrImageUrl}
                      alt="QRIS Code"
                      className="w-48 h-48 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI & seluruh mobile banking.
                  </p>
                </div>
              )}

              {/* Manual Bank Info */}
              {order.paymentCategory === "manual_transfer" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Rekening Tujuan</span>
                      <span className="text-xs font-bold text-indigo-600">
                        {order.singapayPayload?.manual_bank?.bankName || "Bank BCA"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Nomor Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          {order.singapayPayload?.manual_bank?.accountNumber || "8920192831"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyVa(order.singapayPayload?.manual_bank?.accountNumber || "8920192831")
                          }
                          className="p-1 rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
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
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                      <FileCheck className="w-4 h-4 text-indigo-600" />
                      <span>Unggah Bukti Transfer</span>
                    </div>
                    <form onSubmit={handleSubmitProof} className="space-y-2.5">
                      <input
                        type="text"
                        value={proofInput}
                        onChange={(e) => setProofInput(e.target.value)}
                        placeholder="Tempel URL bukti transfer (link gambar/drive/cloud)"
                        className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-indigo-600"
                        required
                      />
                      <button
                        type="submit"
                        disabled={uploadProofMutation.isPending || !proofInput.trim()}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadProofMutation.isPending ? "Mengirim Bukti..." : "Kirim Bukti Pembayaran"}
                      </button>
                    </form>
                    {isWaitingApproval && (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Bukti transfer telah tersimpan. Menunggu verifikasi admin.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Total Nominal Transfer Box - Sesuai Gambar 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Nominal Transfer
                  </span>
                  <div className="text-lg md:text-xl font-extrabold text-slate-900 mt-0.5">
                    {formatRupiah(order.amount)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAmount(order.amount)}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
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
                </button>
              </div>

              {/* Accordion Panduan Pembayaran - Sesuai Gambar 2 */}
              {order.guides && order.guides.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-slate-700">Panduan Pembayaran:</h4>
                  <div className="space-y-2">
                    {order.guides.map((g, idx) => {
                      const isOpen = openAccordion === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-2xl overflow-hidden transition"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-3.5 text-left bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-700">{g.channel}</span>
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

              {/* Tombol Cek Status Pembayaran - Sesuai Gambar 2 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-indigo-600" : ""}`} />
                  {isRefetching ? "Memeriksa Status..." : "Cek Status Pembayaran"}
                </button>
              </div>

              {/* Hubungi WhatsApp Bantuan */}
              {order.whatsappSupport && (
                <div className="text-center pt-2">
                  <a
                    href={`https://wa.me/${order.whatsappSupport.number}?text=${order.whatsappSupport.message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
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
