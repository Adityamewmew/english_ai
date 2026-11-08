"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { processGoogleCallbackAction } from "@/app/(auth)/auth.actions";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
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

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleSync() {
      try {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const urlError = params.get("error");
          if (urlError) {
            if (isMounted) {
              setError(
                urlError === "account_not_linked"
                  ? "Akun Google belum tertaut dengan email yang ada."
                  : `Gagal autentikasi Google: ${urlError}`
              );
            }
            return;
          }
        }

        // Get session quickly (single check + quick fallback)
        let session = null;
        try {
          const res = await authClient.getSession();
          if (res?.data?.user) {
            session = res.data;
          }
        } catch {
          // ignore
        }

        if (!session?.user) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const retryRes = await authClient.getSession().catch(() => null);
          if (retryRes?.data?.user) {
            session = retryRes.data;
          }
        }

        if (!session?.user) {
          if (isMounted) {
            setError("Gagal memverifikasi sesi login Google. Silakan coba lagi.");
          }
          return;
        }

        const user = session.user as any;
        const result = await processGoogleCallbackAction({
          id: user.id,
          name: user.name || "",
          email: user.email,
          role: user.role,
          accessType: user.accessType,
          currentCefr: user.currentCefr,
        });

        if (isMounted) {
          router.replace(result.targetPath || "/dashboard");
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Terjadi kesalahan saat memproses login Google.");
        }
      }
    }

    handleSync();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden select-none">
      {/* Ambient Brand Accents */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#0D3B66]/10 dark:bg-[#0D3B66]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#F4B41A]/10 dark:bg-[#F4B41A]/20 blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 relative z-10 text-center animate-fadeIn">
        {error ? (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Gagal Masuk Akun
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {error}
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full py-3 px-4 rounded-xl bg-[#0D3B66] hover:bg-[#092b4b] text-white font-bold text-xs sm:text-sm items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] shadow-xs mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        ) : (
          <div className="py-2">
            <div className="inline-block mb-3.5">
              <Image
                src="/images/logo.png"
                alt="EDDY'S AI Logo"
                width={48}
                height={48}
                className="rounded-2xl shadow-xs mx-auto"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-3 shadow-2xs">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Autentikasi Google</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Menghubungkan Akun...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-[280px] mx-auto">
              Mohon tunggu sebentar, kami sedang menyiapkan sesi belajar Anda.
            </p>

            <div className="mt-6 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D3B66] dark:text-[#F4B41A]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
