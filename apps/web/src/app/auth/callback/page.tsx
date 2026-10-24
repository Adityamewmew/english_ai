"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { syncGoogleSession } from "@/app/(auth)/auth.actions";
import { placementApi } from "@/features/placement/api/placement.api";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

        // Poll for session up to 5 times (in case cookie is setting)
        let session = null;
        for (let i = 0; i < 5; i++) {
          const res = await authClient.getSession();
          if (res?.data?.user) {
            session = res.data;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (!session?.user) {
          if (isMounted) {
            setError("Gagal memverifikasi sesi login Google. Silakan coba lagi.");
          }
          return;
        }

        const user = session.user as any;
        const syncResult = await syncGoogleSession({
          id: user.id,
          name: user.name || "",
          email: user.email,
          role: user.role,
          accessType: user.accessType,
          currentCefr: user.currentCefr,
        });

        if (isMounted) {
          // Jika siswa belum pernah mengikuti placement test, arahkan langsung ke /placement
          if (syncResult?.role !== "admin") {
            try {
              const latest = await placementApi.getLatestByUser(user.id);
              if (!latest) {
                router.replace("/placement");
                return;
              }
            } catch {
              router.replace("/placement");
              return;
            }
          }

          router.replace("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In Failed</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 inline-flex items-center justify-center text-white font-bold text-xl mb-1 shadow-sm">
              E
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="font-medium text-sm">Connecting Google account...</span>
            </div>
            <p className="text-xs text-slate-400">Please wait a moment while we set up your learning session.</p>
          </div>
        )}
      </div>
    </div>
  );
}
