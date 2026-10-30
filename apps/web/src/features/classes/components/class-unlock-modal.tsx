"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Check,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Clock,
} from "lucide-react";
import { usePaymentMethods, useCreatePaymentOrder } from "@/features/payment";
import { Button } from "@/components/ui/button";
import type { CourseClassItem, TierPlan } from "../api/classes.api";
import { ClassPaymentSelector, type PaymentTab } from "./class-payment-selector";

interface ClassUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: CourseClassItem | null;
  userId: string;
  onSuccess?: () => void;
}

type TierKey = "basic" | "pro" | "ultra";

const DEFAULT_TIERS: Record<TierKey, TierPlan> = {
  basic: {
    price: 49000,
    originalPrice: 99000,
    dailyChatLimit: 20,
    dailyVoiceMinutes: 5,
    features: [
      "Full access to all CEFR curriculum modules",
      "20 AI Tutor Chat messages per day",
      "5 mins AI Voice Call speaking practice per day",
      "Official quizzes & graduation assessment",
      "Verified CEFR graduation certificate upon completion",
    ],
  },
  pro: {
    price: 149000,
    originalPrice: 249000,
    dailyChatLimit: 100,
    dailyVoiceMinutes: 30,
    features: [
      "Full access to all CEFR curriculum modules",
      "100 AI Tutor Chat messages per day",
      "30 mins AI Voice Call speaking practice per day",
      "In-depth grammar & pronunciation feedback",
      "Priority AI tutor response speed",
      "Official CEFR graduation certificate upon completion",
    ],
  },
  ultra: {
    price: 299000,
    originalPrice: 499000,
    dailyChatLimit: -1,
    dailyVoiceMinutes: 120,
    features: [
      "Full access to all CEFR curriculum modules",
      "Unlimited AI Tutor Chat messages",
      "120 mins AI Voice Call speaking practice per day",
      "Real-time phonetic & pronunciation analysis",
      "Instant low-latency voice responses",
      "Official CEFR graduation certificate upon completion",
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
          ((activePlan.originalPrice - activePlan.price) / activePlan.originalPrice) * 100
        )
      : null;

  const handleProceedToPayment = async () => {
    if (activePaymentTab === "whatsapp") {
      const waNumber = paymentMethods?.whatsapp?.number || "6281234567890";
      const waMsg = encodeURIComponent(
        `Hello Admin EDDY'S AI, I would like to enroll in class ${classItem.name} (${classItem.cefr}) ${selectedTier.toUpperCase()} package for ${formatRupiah(activePlan.price)}.`
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
      setErrorMsg(err?.message || "Failed to generate payment order. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-5 sm:p-7 space-y-4 my-8 max-h-[90vh] overflow-y-auto card-skeuo">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0D3B66]/10 border border-[#0D3B66]/20 text-[#0D3B66] flex items-center justify-center font-heading font-black text-base shadow-2xs">
              {classItem.cefr}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0D3B66]/10 text-[#0D3B66]">
                  {step === 1 ? "Step 1: Choose Plan" : "Step 2: Payment Method"}
                </span>
                {classItem.hasAccess && classItem.userTier && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Active: {classItem.userTier.toUpperCase()}
                  </span>
                )}
                {classItem.isExpired && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    Expired (Renewal Required)
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
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Choose Plan */}
        {step === 1 ? (
          <div className="space-y-4">
            {/* Expiration Notice if expired */}
            {classItem.isExpired && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-amber-950">1-Month Access Period Expired</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Your 30-day class package has ended. Because module completion is still pending, please renew to regain full access and continue your learning progress.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Select AI Coaching Plan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Basic Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("basic")}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex sm:flex-col justify-between items-center sm:items-start cursor-pointer ${
                    selectedTier === "basic"
                      ? "border-[#0D3B66] bg-[#0D3B66]/5 shadow-xs ring-1 ring-[#0D3B66]"
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

                {/* Pro Card (Popular) */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("pro")}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex sm:flex-col justify-between items-center sm:items-start cursor-pointer ${
                    selectedTier === "pro"
                      ? "border-[#0D3B66] bg-[#0D3B66]/5 shadow-xs ring-2 ring-[#0D3B66]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#0D3B66] text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    Popular
                  </span>
                  <div>
                    <p className="text-xs font-black text-[#0D3B66]">Pro</p>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-medium leading-tight">
                      100 chats • 30 mins
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-[#0D3B66] sm:mt-2">
                    {formatRupiah(plans.pro.price)}
                  </p>
                </button>

                {/* Ultra Card */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("ultra")}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex sm:flex-col justify-between items-center sm:items-start cursor-pointer ${
                    selectedTier === "ultra"
                      ? "border-[#F4B41A] bg-[#F4B41A]/10 shadow-xs ring-2 ring-[#F4B41A]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#0D3B66] text-[#F4B41A] text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    Best Value
                  </span>
                  <div>
                    <p className="text-xs font-black text-slate-900">Ultra</p>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-medium leading-tight">
                      Unlimited • 120 mins
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-[#0D3B66] sm:mt-2">
                    {formatRupiah(plans.ultra.price)}
                  </p>
                </button>
              </div>
            </div>

            {/* Pricing Summary Banner */}
            <div className="p-4 rounded-2xl bg-[#0D3B66]/5 border border-[#0D3B66]/15 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedTier.toUpperCase()} Plan
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
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-heading text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#0D3B66]" />
                <span>30 Days Access</span>
              </div>
            </div>

            {/* Feature Benefits List */}
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {selectedTier.toUpperCase()} Plan Includes:
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl text-xs font-bold h-11"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={isCurrentTier}
                className="flex-2 rounded-xl text-xs font-extrabold h-11 bg-[#0D3B66] hover:bg-[#082542] text-white btn-skeuo-navy"
              >
                {isCurrentTier ? (
                  <>
                    <Check className="w-4 h-4" /> Plan Already Active
                  </>
                ) : classItem.isExpired ? (
                  <>
                    Renew Access ({selectedTier.toUpperCase()}) <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Choose Payment Method <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Payment Method */
          <div className="space-y-4">
            <ClassPaymentSelector
              activeTab={activePaymentTab}
              selectedChannel={selectedChannel}
              onSelectTab={setActivePaymentTab}
              onSelectChannel={setSelectedChannel}
              paymentMethods={paymentMethods}
            />

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Total Summary & Action Buttons Step 2 */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Payment:</span>
                <span className="font-extrabold text-base text-slate-900 font-heading">
                  {formatRupiah(activePlan.price)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl text-xs font-bold h-11"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={createOrderMutation.isPending}
                  className="flex-2 rounded-xl text-xs font-extrabold h-11 bg-[#0D3B66] hover:bg-[#082542] text-white btn-skeuo-navy"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                    </>
                  ) : activePaymentTab === "whatsapp" ? (
                    <>
                      <MessageCircle className="w-4 h-4" /> Contact via WhatsApp
                    </>
                  ) : (
                    <>
                      Proceed to Payment Confirmation <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
