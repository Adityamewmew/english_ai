"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  Sparkles,
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Star,
  Check,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { usePaymentMethods, useCreatePaymentOrder } from "@/features/payment";
import type { CourseClassItem, TierPlan } from "../api/classes.api";

interface ClassUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: CourseClassItem | null;
  userId: string;
  onSuccess?: () => void;
}

type TierKey = "basic" | "pro" | "ultra";
type PaymentTab = "va" | "qris" | "ewallet" | "manual_transfer" | "whatsapp";

const DEFAULT_TIERS: Record<TierKey, TierPlan> = {
  basic: {
    price: 49000,
    originalPrice: 99000,
    dailyChatLimit: 20,
    dailyVoiceMinutes: 5,
    features: [
      "Full access to all CEFR level modules",
      "20 AI Mr. Khoirul chat messages per day",
      "5 minutes of AI voice call practice per day",
      "Formative quizzes & competency exams",
      "Official CEFR certificate of completion",
    ],
  },
  pro: {
    price: 149000,
    originalPrice: 249000,
    dailyChatLimit: 100,
    dailyVoiceMinutes: 30,
    features: [
      "Full access to all CEFR level modules",
      "100 AI Mr. Khoirul chat messages per day",
      "30 minutes of AI voice call practice per day",
      "In-depth grammar correction & AI feedback",
      "Formative quizzes & competency exams",
      "Official CEFR certificate of completion",
    ],
  },
  ultra: {
    price: 299000,
    originalPrice: 499000,
    dailyChatLimit: -1,
    dailyVoiceMinutes: 120,
    features: [
      "Full access to all CEFR level modules",
      "Unlimited AI Mr. Khoirul chat messages",
      "120 minutes of AI voice call practice per day",
      "Real-time phonetic & pronunciation analysis",
      "Ultra-low latency instant AI voice response",
      "Official CEFR certificate of completion",
    ],
  },
};

export function ClassUnlockModal({
  isOpen,
  onClose,
  classItem,
  userId,
}: ClassUnlockModalProps) {
  const router = useRouter();
  const createOrderMutation = useCreatePaymentOrder();
  const { data: paymentMethods } = usePaymentMethods();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTier, setSelectedTier] = useState<TierKey>("pro");
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentTab>("va");
  const [selectedChannel, setSelectedChannel] = useState<string>("BCA");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set default tier based on current user tier
  useEffect(() => {
    if (classItem?.userTier) {
      if (classItem.userTier === "basic") setSelectedTier("pro");
      else if (classItem.userTier === "pro") setSelectedTier("ultra");
      else setSelectedTier("ultra");
    } else {
      setSelectedTier("pro");
    }
    setStep(1);
    setSelectedChannel("BCA");
    setActivePaymentTab("va");
  }, [classItem, isOpen]);

  if (!isOpen || !classItem) return null;

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  const plans = {
    basic: classItem.tierPlans?.basic || DEFAULT_TIERS.basic,
    pro: classItem.tierPlans?.pro || DEFAULT_TIERS.pro,
    ultra: classItem.tierPlans?.ultra || DEFAULT_TIERS.ultra,
  };

  const activePlan = plans[selectedTier];
  const isCurrentTier = classItem.hasAccess && classItem.userTier === selectedTier;

  const discountPercent =
    activePlan.originalPrice && activePlan.originalPrice > activePlan.price
      ? Math.round(
          ((activePlan.originalPrice - activePlan.price) /
            activePlan.originalPrice) *
            100
        )
      : null;

  const handleProceedToPayment = async () => {
    if (activePaymentTab === "whatsapp") {
      const waNumber = paymentMethods?.whatsapp?.number || "6281234567890";
      const waMsg = encodeURIComponent(
        `Halo Admin EDDY'S AI, saya ingin mendaftar kelas ${classItem.name} (${classItem.cefr}) paket ${selectedTier.toUpperCase()} seharga ${formatRupiah(activePlan.price)}.`
      );
      window.open(`https://wa.me/${waNumber}?text=${waMsg}`, "_blank");
      onClose();
      return;
    }

    setErrorMsg(null);
    try {
      const result = await createOrderMutation.mutateAsync({
        userId,
        cefr: classItem.cefr,
        tier: selectedTier,
        paymentCategory: activePaymentTab,
        paymentChannel: selectedChannel,
      });

      onClose();
      router.push(result.redirectUrl);
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Gagal membuat invoice pembayaran. Silakan coba kembali."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 flex items-center justify-center font-heading font-extrabold text-base shadow-2xs">
              {classItem.cefr}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  {step === 1 ? "Langkah 1: Pilih Paket" : "Langkah 2: Metode Pembayaran"}
                </span>
                {classItem.userTier && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Aktif: {classItem.userTier.toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="font-heading text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
                {classItem.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Pilih Paket Belajar */}
        {step === 1 ? (
          <div className="space-y-4">
            {/* 3-Tier Selector Cards */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Pilih Paket AI Coaching:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Basic Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("basic")}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex sm:flex-col justify-between items-center sm:items-start cursor-pointer ${
                    selectedTier === "basic"
                      ? "border-slate-800 bg-slate-50 shadow-xs border-b-4"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <p className="text-xs font-black text-slate-900">Basic</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">
                      20 chats • 5 mins
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 sm:mt-2">
                    {formatRupiah(plans.basic.price)}
                  </p>
                </button>

                {/* Pro Card (Recommended) */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("pro")}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex sm:flex-col justify-between items-center sm:items-start cursor-pointer ${
                    selectedTier === "pro"
                      ? "border-indigo-600 bg-indigo-50/70 shadow-xs border-b-4"
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-md bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    Popular
                  </span>
                  <div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-600" />
                      <p className="text-xs font-black text-indigo-950">Pro</p>
                    </div>
                    <p className="text-[10px] text-indigo-700/80 mt-0.5 font-medium leading-tight">
                      100 chats • 30 mins
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-indigo-900 sm:mt-2">
                    {formatRupiah(plans.pro.price)}
                  </p>
                </button>

                {/* Ultra Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("ultra")}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex sm:flex-col justify-between items-center sm:items-start cursor-pointer ${
                    selectedTier === "ultra"
                      ? "border-amber-500 bg-amber-50/80 shadow-xs border-b-4"
                      : "border-slate-200 bg-white hover:border-amber-200"
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    ★ MAX
                  </span>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                      <p className="text-xs font-black text-amber-950">Ultra</p>
                    </div>
                    <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium leading-tight">
                      Unlimited • 120 mins
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-amber-900 sm:mt-2">
                    {formatRupiah(plans.ultra.price)}
                  </p>
                </button>
              </div>
            </div>

            {/* Pricing Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-[#0D3B66]/5 border border-[#0D3B66]/15 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Paket {selectedTier.toUpperCase()}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-heading text-xl font-black text-slate-900">
                    {formatRupiah(activePlan.price)}
                  </span>
                  {activePlan.originalPrice && activePlan.originalPrice > activePlan.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatRupiah(activePlan.originalPrice)}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      Hemat {discountPercent}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-emerald-700 font-heading text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Akses Selamanya
              </div>
            </div>

            {/* Feature Benefits List */}
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Fasilitas Paket {selectedTier.toUpperCase()}:
              </p>
              <div className="space-y-1">
                {activePlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Step 1 */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition text-center cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isCurrentTier}
                className="flex-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isCurrentTier ? (
                  <>
                    <Check className="w-4 h-4" /> Paket Sedang Aktif
                  </>
                ) : (
                  <>
                    Pilih Metode Pembayaran <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Metode Pembayaran - Sesuai Gambar 1 */
          <div className="space-y-4">
            {/* Header Bagian Gambar 1 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Metode Pembayaran</h4>
                <p className="text-xs text-slate-500">
                  Pilih kanal pembayaran langsung (Virtual Account, QRIS, atau E-Wallet).
                </p>
              </div>
            </div>

            {/* Badge Otomatis & Terenkripsi */}
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">🔒</span>
              <span>Pembayaran Otomatis &amp; Terenkripsi</span>
            </div>

            {/* 5 Tab Navigation: VA, QRIS, E-Wallet, TF Manual, Hubungi Admin */}
            <div className="flex p-1 rounded-2xl bg-slate-100 gap-1 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab("va");
                  setSelectedChannel("BCA");
                }}
                className={`py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activePaymentTab === "va"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Virtual Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab("qris");
                  setSelectedChannel("QRIS");
                }}
                className={`py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activePaymentTab === "qris"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                QRIS
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab("ewallet");
                  setSelectedChannel("GOPAY");
                }}
                className={`py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activePaymentTab === "ewallet"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                E-Wallet
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab("manual_transfer");
                  const firstBank = paymentMethods?.manualBanks?.[0];
                  setSelectedChannel(firstBank ? `manual_${firstBank.id}` : "manual_1");
                }}
                className={`py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activePaymentTab === "manual_transfer"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                TF Manual
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab("whatsapp");
                }}
                className={`py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activePaymentTab === "whatsapp"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Hubungi Admin
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. Virtual Account List (Sesuai Gambar 1) */}
            {activePaymentTab === "va" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Pilih bank tujuan untuk mendapatkan nomor Virtual Account otomatis:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(paymentMethods?.vaBanks || [
                    { code: "BCA", name: "BCA Virtual Account" },
                    { code: "MANDIRI", name: "Mandiri Virtual Account" },
                    { code: "BRI", name: "BRI Virtual Account" },
                    { code: "BNI", name: "BNI Virtual Account" },
                    { code: "CIMB", name: "CIMB Niaga Virtual Account" },
                    { code: "PERMATA", name: "Permata Virtual Account" },
                    { code: "BSI", name: "BSI Virtual Account" },
                  ]).map((bank) => {
                    const isSelected = selectedChannel === bank.code;
                    return (
                      <div
                        key={bank.code}
                        onClick={() => setSelectedChannel(bank.code)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 font-extrabold text-[11px] text-blue-900">
                            {bank.code}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{bank.name}</h5>
                            <p className="text-[11px] text-slate-500">Verifikasi instan otomatis 24 jam</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. QRIS (Sesuai Gambar 1) */}
            {activePaymentTab === "qris" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Pembayaran cepat menggunakan scan barcode QRIS standar Bank Indonesia:
                </p>
                <div
                  onClick={() => setSelectedChannel("QRIS")}
                  className="flex items-center justify-between p-4 rounded-2xl border border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 font-black text-rose-700 text-xs">
                      QRIS
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">QRIS (Semua Pembayaran)</h5>
                      <p className="text-[11px] text-slate-500">
                        Scan dengan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.
                      </p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. E-Wallet */}
            {activePaymentTab === "ewallet" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Pilih dompet digital yang Anda gunakan:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: "GOPAY", name: "GoPay" },
                    { code: "OVO", name: "OVO" },
                    { code: "DANA", name: "DANA" },
                    { code: "SHOPEEPAY", name: "ShopeePay" },
                  ].map((wallet) => {
                    const isSelected = selectedChannel === wallet.code;
                    return (
                      <div
                        key={wallet.code}
                        onClick={() => setSelectedChannel(wallet.code)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900">{wallet.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Transfer Manual (Bank yang diinput manual oleh Admin) */}
            {activePaymentTab === "manual_transfer" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Transfer ke rekening resmi kami, lalu unggah bukti transfer untuk di-ACC admin:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {paymentMethods?.manualBanks && paymentMethods.manualBanks.length > 0 ? (
                    paymentMethods.manualBanks.map((bank) => {
                      const channelKey = `manual_${bank.id}`;
                      const isSelected = selectedChannel === channelKey;
                      return (
                        <div
                          key={bank.id}
                          onClick={() => setSelectedChannel(channelKey)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-extrabold text-[11px] text-blue-900">
                              {bank.bankName}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">
                                {bank.bankName} - {bank.accountNumber}
                              </h5>
                              <p className="text-[11px] text-slate-500">a.n. {bank.accountName}</p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-slate-500 border rounded-xl bg-slate-50">
                      Rekening bank manual BCA (8920192831 a.n. KHOIRUL ANWAR)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Hubungi Admin (WhatsApp) */}
            {activePaymentTab === "whatsapp" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Bantuan Pembayaran via WhatsApp</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Tim admin kami siap membantu Anda melakukan pembayaran, aktivasi kelas khusus, atau transfer antar-bank dengan mudah.
                </p>
                <div className="text-xs text-emerald-900 font-medium">
                  Admin CS: <strong>{paymentMethods?.whatsapp?.name || "Admin Support EDDY'S AI"}</strong>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Total Rincian & Action Buttons Step 2 */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Tagihan:</span>
                <span className="font-extrabold text-base text-slate-900">
                  {formatRupiah(activePlan.price)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={createOrderMutation.isPending}
                  className="flex-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Membuat Pesanan...
                    </>
                  ) : activePaymentTab === "whatsapp" ? (
                    <>
                      <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
                    </>
                  ) : (
                    <>Lanjut ke Konfirmasi Pembayaran &rarr;</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
