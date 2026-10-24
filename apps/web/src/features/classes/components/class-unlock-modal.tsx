"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { usePurchaseClass } from "../hooks/use-classes";
import type { CourseClassItem, TierPlan } from "../api/classes.api";

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
  onSuccess,
}: ClassUnlockModalProps) {
  const purchaseMutation = usePurchaseClass();
  const [selectedTier, setSelectedTier] = useState<TierKey>("pro");
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
  }, [classItem]);

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

  const handleConfirmPurchase = async () => {
    setErrorMsg(null);
    try {
      await purchaseMutation.mutateAsync({
        userId,
        cefr: classItem.cefr,
        tier: selectedTier,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Failed to activate class access. Please verify prerequisites or contact administration."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 border-b-6 border-b-slate-300 shadow-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 flex items-center justify-center font-heading font-extrabold text-lg shadow-xs">
              {classItem.cefr}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  CEFR Class Package
                </span>
                {classItem.userTier && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Active: {classItem.userTier.toUpperCase()}
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* 3-Tier Selector Cards */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Choose AI Coaching Plan:
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
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0D3B66]/5 border border-[#0D3B66]/15 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">
                Enrollment for {selectedTier.toUpperCase()} Plan
              </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading text-xl sm:text-2xl font-black text-slate-900">
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-emerald-700 font-heading text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Lifetime Access
          </div>
        </div>

        {/* Feature Benefits List */}
        <div className="space-y-2 pt-0.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Included Benefits for {selectedTier.toUpperCase()}:
          </p>
          <div className="space-y-1.5">
            {activePlan.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Requirement warning if student is not eligible */}
        {!classItem.isEligible && classItem.prerequisiteCefr && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Prerequisite required: You need to pass and earn the certificate for CEFR level{" "}
              <strong>{classItem.prerequisiteCefr}</strong> before unlocking this class.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 border-b-3 border-b-slate-400 text-slate-700 text-xs font-bold hover:bg-slate-50 active:border-b active:translate-y-0.5 transition-all text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPurchase}
            disabled={
              purchaseMutation.isPending ||
              isCurrentTier ||
              (!classItem.isEligible && !!classItem.requiresCertificate)
            }
            className={`flex-2 py-3 px-4 rounded-xl text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              isCurrentTier
                ? "bg-slate-400 border-b-4 border-b-slate-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 border-b-4 border-b-indigo-800 active:border-b active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Activating Access...
              </>
            ) : isCurrentTier ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Current Active Plan
              </>
            ) : classItem.hasAccess ? (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade to {selectedTier.toUpperCase()}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Unlock {selectedTier.toUpperCase()} Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

