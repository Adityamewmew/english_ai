import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { doLogout } from "@/app/(auth)/auth.actions";
import { Button } from "@/components/ui/button";
import { PhoneCall, LogOut, Award, ArrowRight, BookOpen } from "lucide-react";
import { DashboardHeroResume } from "@/components/dashboard";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const API_URL = process.env.API_URL || "http://localhost:3001";
  const userId = session.userId;

  let levels: any[] = [];
  let userProfile: any = null;
  let latestTest: any = null;

  try {
    const [levelsRes, userRes, testRes] = await Promise.all([
      fetch(`${API_URL}/api/curriculum/levels?userId=${userId}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${API_URL}/api/user/${userId}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${API_URL}/api/placement/latest/${userId}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null),
    ]);

    if (levelsRes?.success && Array.isArray(levelsRes.data)) {
      levels = levelsRes.data;
    }
    if (userRes?.success && userRes.data) {
      userProfile = userRes.data;
    }
    if (testRes?.success && testRes.data) {
      latestTest = testRes.data;
    }
  } catch (e) {
    console.error("Dashboard fetch data error:", e);
  }

  // Hitung agregasi progress kurikulum
  let totalCompletedModules = 0;
  let totalModules = 0;

  levels.forEach((lvl) => {
    totalCompletedModules += lvl.completedModules || 0;
    totalModules += lvl.totalModules || 0;
  });

  const studentName = userProfile?.name || session.name;
  const currentCefr = userProfile?.currentCefr || session.currentCefr;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              E
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">
              EDDY&apos;S <span className="text-blue-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/call">
              <Button variant="secondary" size="sm">
                <PhoneCall className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Call Speaking
              </Button>
            </Link>

            <form action={doLogout}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Passport Banner */}
        <DashboardHeroResume
          studentName={studentName}
          studentEmail={session.email}
          currentCefr={currentCefr}
          placementScore={latestTest?.scorePercent}
          totalCompletedModules={totalCompletedModules}
          totalModules={totalModules}
        />

        {/* 3 Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Modul Pembelajaran */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-5 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/40">
                  Kurikulum Terstruktur
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  Modul Pembelajaran
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pelajari materi kurikulum bertahap mulai dari tata bahasa dasar, kosa kata tematik, hingga latihan speaking interaktif.
              </p>
            </div>
            <Link href="/modules">
              <Button variant="primary" className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white">
                <span>Buka Modul</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Card 2: Praktik Percakapan Bebas */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-5 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  Voice AI Call
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  Praktik Percakapan Bebas
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Telepon Mr. Khoirul kapan saja untuk melatih kelancaran speaking, refleks spontan, dan diskusi materi sehari-hari.
              </p>
            </div>
            <Link href="/call">
              <Button variant="secondary" className="w-full justify-between">
                <span>Mulai Call Mr. Khoirul</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Card 3: Uji Level CEFR */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-5 hover:border-amber-400 dark:hover:border-amber-600 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                  Adaptive Assessment
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  Uji Level CEFR Terkini
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ikuti Tes Penempatan adaptif secara berkala untuk mengukur kenaikan level kompetensi bahasa Inggrismu.
              </p>
            </div>
            <Link href="/placement">
              <Button variant="outline" className="w-full justify-between">
                <span>Tes Penempatan Ulang</span>
                <Award className="w-4 h-4 ml-1 text-amber-500" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
