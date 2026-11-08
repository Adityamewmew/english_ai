"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LogOut,
  UserCheck,
  Headphones,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { doLogout } from "@/app/(auth)/auth.actions";
import { useUpdateProfile, useUserProfile } from "@/features/users/hooks/use-user";
import { useSkipBeginner } from "@/features/placement/hooks/use-placement";
import { OnboardingStepProfile, OnboardingProfileData } from "./onboarding-step-profile";
import { OnboardingStepDevice } from "./onboarding-step-device";
import { OnboardingStepBriefing } from "./onboarding-step-briefing";

interface OnboardingWizardViewProps {
  session: {
    userId: string;
    name: string;
    email: string;
    role: string;
    currentCefr: string;
  };
}

export function OnboardingWizardView({ session }: OnboardingWizardViewProps) {
  const router = useRouter();
  const { data: userProfile } = useUserProfile(session.userId);
  const updateProfileMutation = useUpdateProfile(session.userId);
  const skipBeginnerMutation = useSkipBeginner();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  // Step 1 Profile Data
  const [profileData, setProfileData] = useState<OnboardingProfileData>({
    preferredName:
      userProfile?.memory?.preferredName ||
      session.name?.split(" ")[0] ||
      "",
    profession: userProfile?.memory?.profession || "Profesional",
    learningGoal: userProfile?.memory?.learningGoal || "Karir & Pekerjaan",
    dailyCommitment: userProfile?.memory?.dailyCommitment || 30,
  });

  // Step 2 Device State
  const [speakerChecked, setSpeakerChecked] = useState(false);
  const [micChecked, setMicChecked] = useState(false);

  const handleProfileChange = (patch: Partial<OnboardingProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...patch }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!profileData.preferredName.trim() || profileData.preferredName.trim().length < 2) {
        setErrorMsg("Mohon masukkan nama panggilan akrab Anda (minimal 2 karakter).");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep === 2) setCurrentStep(1);
    if (currentStep === 3) setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveProfileData = async () => {
    const facts = [
      `Status: ${profileData.profession}`,
      `Tujuan Belajar: ${profileData.learningGoal}`,
      `Komitmen Waktu: ${profileData.dailyCommitment} menit/hari`,
    ];
    const interests = [profileData.learningGoal];

    await updateProfileMutation.mutateAsync({
      memory: {
        preferredName: profileData.preferredName.trim(),
        profession: profileData.profession,
        learningGoal: profileData.learningGoal,
        dailyCommitment: profileData.dailyCommitment,
        onboardingCompleted: true,
        facts,
        interests,
      },
    });
  };

  const handleStartPlacement = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await saveProfileData();
      router.push("/placement");
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Gagal menyimpan preferensi orientasi. Silakan coba lagi.");
    }
  };

  const handleSkipBeginner = async () => {
    setErrorMsg(null);
    setIsSkipping(true);
    try {
      await saveProfileData();
      await skipBeginnerMutation.mutateAsync();
      router.push("/dashboard");
    } catch (err: any) {
      setIsSkipping(false);
      setErrorMsg(err?.message || "Gagal mengatur modul dasar pemula. Silakan coba lagi.");
    }
  };

  const stepIndicators = [
    { num: 1, label: "Profil & Target", icon: UserCheck },
    { num: 2, label: "Kesiapan Alat", icon: Headphones },
    { num: 3, label: "Placement Test", icon: FileCheck2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="EDDY'S AI Logo"
              width={34}
              height={34}
              className="rounded-lg shadow-2xs"
            />
            <div>
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                EDDY&apos;S AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-[#F4B41A]/20 dark:text-[#F4B41A]">
                Orientasi Siswa
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => doLogout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Wizard Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative mb-2">
            {/* Background line connecting steps */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0" />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-[#0D3B66] dark:bg-[#F4B41A] transition-all duration-300 z-0"
              style={{
                width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
              }}
            />

            {stepIndicators.map((step) => {
              const Icon = step.icon;
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      isPast
                        ? "bg-[#0D3B66] dark:bg-[#F4B41A] text-white dark:text-slate-950 shadow-xs"
                        : isCurrent
                        ? "bg-[#0D3B66] dark:bg-[#F4B41A] text-white dark:text-slate-950 ring-4 ring-[#0D3B66]/20 dark:ring-[#F4B41A]/30 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 hidden sm:block ${
                      isCurrent
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center sm:hidden mt-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Langkah {currentStep} dari 3: {stepIndicators[currentStep - 1]?.label}
            </span>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p className="font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Wizard Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xs">
          {currentStep === 1 && (
            <OnboardingStepProfile
              data={profileData}
              onChange={handleProfileChange}
            />
          )}

          {currentStep === 2 && (
            <OnboardingStepDevice
              speakerChecked={speakerChecked}
              micChecked={micChecked}
              onSpeakerCheckedChange={setSpeakerChecked}
              onMicCheckedChange={setMicChecked}
            />
          )}

          {currentStep === 3 && (
            <OnboardingStepBriefing
              onStartPlacement={handleStartPlacement}
              onSkipBeginner={handleSkipBeginner}
              isSubmitting={isSubmitting}
              isSkipping={isSkipping}
            />
          )}

          {/* Step 1 & 2 Footer Buttons */}
          {currentStep < 3 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer transition min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-[#0D3B66] hover:bg-[#092b4b] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition shadow-xs min-h-[44px]"
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 text-center border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        EDDY&apos;S English AI &copy; {new Date().getFullYear()} · CEFR Adaptive Learning System
      </footer>
    </div>
  );
}

