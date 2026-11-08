"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { doRegister } from "@/app/(auth)/auth.actions";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await doRegister(formData);

    if (res && !res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const callbackURL = `${window.location.origin}/auth/callback`;
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
      if (res?.error) {
        setError(res.error.message || "Gagal mendaftar menggunakan Google.");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal menghubungi layanan Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden select-none">
      {/* Ambient Brand Accents */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#0D3B66]/10 dark:bg-[#0D3B66]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#F4B41A]/10 dark:bg-[#F4B41A]/20 blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="w-full max-w-[420px] mb-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition group py-1.5 px-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-900/60"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative z-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3.5">
            <Image
              src="/images/logo.png"
              alt="EDDY'S AI Logo"
              width={48}
              height={48}
              className="rounded-2xl shadow-xs mx-auto"
              priority
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Mulai perjalanan fasih berbicara bahasa Inggris bersama AI Tutor
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Google Social Button */}
        <button
          type="button"
          disabled={loading || googleLoading}
          onClick={handleGoogleSignUp}
          className="w-full h-12 flex items-center justify-center gap-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0D3B66] dark:text-[#F4B41A]" />
              <span>Menghubungkan Google...</span>
            </span>
          ) : (
            <>
              <GoogleIcon />
              <span>Daftar dengan Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">
              atau dengan email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="nameInput"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="nameInput"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Contoh: Alex Pratama"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] transition shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="emailInput"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="emailInput"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] transition shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="passwordInput"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="passwordInput"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Minimal 6 karakter"
                className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] transition shadow-2xs font-medium"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer min-w-[40px] justify-end"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-12 mt-2 bg-[#0D3B66] hover:bg-[#082b4b] text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Mendaftarkan Akun...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>Daftar & Mulai Belajar</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="text-[#0D3B66] dark:text-[#F4B41A] font-bold hover:underline underline-offset-2 ml-0.5"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
