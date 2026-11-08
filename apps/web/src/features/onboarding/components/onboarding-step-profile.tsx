"use client";

import React from "react";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Sparkles,
  Award,
  MessageCircle,
  Globe,
  Clock,
  User,
  Check,
} from "lucide-react";

export interface OnboardingProfileData {
  preferredName: string;
  profession: string;
  learningGoal: string;
  dailyCommitment: number;
}

interface OnboardingStepProfileProps {
  data: OnboardingProfileData;
  onChange: (patch: Partial<OnboardingProfileData>) => void;
}

const PROFESSIONS = [
  {
    id: "Pelajar",
    label: "Pelajar",
    desc: "SD, SMP, atau SMA / SMK",
    icon: GraduationCap,
  },
  {
    id: "Mahasiswa",
    label: "Mahasiswa",
    desc: "Diploma, Sarjana (S1), atau Pascasarjana",
    icon: BookOpen,
  },
  {
    id: "Profesional",
    label: "Profesional",
    desc: "Karyawan, Freelancer, atau Pebisnis",
    icon: Briefcase,
  },
  {
    id: "Umum",
    label: "Umum",
    desc: "Belajar mandiri untuk pengembangan diri",
    icon: Sparkles,
  },
];

const LEARNING_GOALS = [
  {
    id: "Karir & Pekerjaan",
    label: "Karir & Pekerjaan",
    desc: "Interview kerja, presentasi, dan komunikasi profesional",
    icon: Briefcase,
  },
  {
    id: "Studi & Beasiswa",
    label: "Studi & Beasiswa",
    desc: "Persiapan kuliah luar negeri, TOEFL, IELTS, atau riset",
    icon: Award,
  },
  {
    id: "Percakapan Sehari-hari",
    label: "Percakapan Sehari-hari",
    desc: "Bicara percaya diri, traveling, dan komunikasi aktif",
    icon: MessageCircle,
  },
  {
    id: "Hobi & Hiburan",
    label: "Hobi & Hiburan",
    desc: "Nonton film, gaming, dan membaca literatur tanpa subtitel",
    icon: Globe,
  },
];

const COMMITMENTS = [
  {
    minutes: 15,
    title: "15 Menit / Hari",
    desc: "Santai dan fleksibel di sela kesibukan harian",
    badge: "Fleksibel",
  },
  {
    minutes: 30,
    title: "30 Menit / Hari",
    desc: "Porsi ideal untuk perkembangan bahasa yang konsisten",
    badge: "Rekomendasi",
  },
  {
    minutes: 45,
    title: "45 Menit / Hari",
    desc: "Intensif untuk akselerasi kemampuan dalam waktu singkat",
    badge: "Akselerasi",
  },
  {
    minutes: 60,
    title: "60 Menit / Hari",
    desc: "Fokus mendalam untuk hasil penguasaan bahasa maksimal",
    badge: "Maksimal",
  },
];

export function OnboardingStepProfile({ data, onChange }: OnboardingStepProfileProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Kenalkan Diri & Target Belajar Anda
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Mr. Khoirul akan mempersonalisasi gaya percakapan dan rekomendasi materi berdasarkan profil ini.
        </p>
      </div>

      {/* 1. Preferred Name */}
      <div className="space-y-2.5">
        <label
          htmlFor="preferredNameInput"
          className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
        >
          Nama Panggilan Akrab <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            id="preferredNameInput"
            type="text"
            value={data.preferredName}
            onChange={(e) => onChange({ preferredName: e.target.value })}
            placeholder="Contoh: Budi, Sarah, Alex..."
            maxLength={30}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] transition shadow-2xs font-medium"
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Nama ini akan digunakan oleh Mr. Khoirul saat menyapa Anda di setiap sesi.
        </p>
      </div>

      {/* 2. Profession / Status */}
      <div className="space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          Status / Aktivitas Utama Saat Ini <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROFESSIONS.map((prof) => {
            const Icon = prof.icon;
            const isSelected = data.profession === prof.id;
            return (
              <button
                type="button"
                key={prof.id}
                onClick={() => onChange({ profession: prof.id })}
                className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl text-left border transition-all cursor-pointer min-h-[56px] ${
                  isSelected
                    ? "border-[#0D3B66] bg-[#0D3B66]/5 dark:border-[#F4B41A] dark:bg-[#F4B41A]/10 ring-2 ring-[#0D3B66]/20 dark:ring-[#F4B41A]/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#0D3B66] text-white dark:bg-[#F4B41A] dark:text-slate-950 font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {prof.label}
                    </h4>
                    {isSelected && <Check className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A] shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {prof.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Learning Goal */}
      <div className="space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          Tujuan Utama Belajar Bahasa Inggris <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEARNING_GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = data.learningGoal === goal.id;
            return (
              <button
                type="button"
                key={goal.id}
                onClick={() => onChange({ learningGoal: goal.id })}
                className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl text-left border transition-all cursor-pointer min-h-[56px] ${
                  isSelected
                    ? "border-[#0D3B66] bg-[#0D3B66]/5 dark:border-[#F4B41A] dark:bg-[#F4B41A]/10 ring-2 ring-[#0D3B66]/20 dark:ring-[#F4B41A]/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#0D3B66] text-white dark:bg-[#F4B41A] dark:text-slate-950 font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {goal.label}
                    </h4>
                    {isSelected && <Check className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A] shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {goal.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Daily Commitment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Komitmen Waktu Belajar Harian <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Dapat diubah kapan saja
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMMITMENTS.map((c) => {
            const isSelected = data.dailyCommitment === c.minutes;
            return (
              <button
                type="button"
                key={c.minutes}
                onClick={() => onChange({ dailyCommitment: c.minutes })}
                className={`flex items-start justify-between p-3.5 sm:p-4 rounded-xl text-left border transition-all cursor-pointer min-h-[56px] ${
                  isSelected
                    ? "border-[#0D3B66] bg-[#0D3B66]/5 dark:border-[#F4B41A] dark:bg-[#F4B41A]/10 ring-2 ring-[#0D3B66]/20 dark:ring-[#F4B41A]/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {c.title}
                    </span>
                    {c.badge === "Rekomendasi" && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-[#F4B41A]/20 text-[#B45309] dark:text-[#F4B41A]">
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {c.desc}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#0D3B66] dark:bg-[#F4B41A] text-white dark:text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

