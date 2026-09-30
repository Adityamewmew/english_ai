import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { doLogout } from "@/app/(auth)/auth.actions";
import { Button } from "@/components/ui/button";
import { PhoneCall, LogOut, Award, ArrowRight } from "lucide-react";
import {
  DashboardHeroResume,
  DashboardLevelRoadmap,
  DashboardWeakWordsWidget,
} from "@/components/dashboard";

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
  let nextModule: { id: string; title: string; orderIndex: number; cefr: string } | null = null;

  levels.forEach((lvl) => {
    totalCompletedModules += lvl.completedModules || 0;
    totalModules += lvl.totalModules || 0;

    // Cari modul berikutnya yang terbuka dan belum selesai
    if (!nextModule && lvl.isUnlocked && Array.isArray(lvl.modules)) {
      const candidate = lvl.modules.find(
        (m: any) => m.status === "unlocked" || m.status === "in_progress"
      );
      if (candidate) {
        nextModule = {
          id: candidate.id,
          title: candidate.title,
          orderIndex: candidate.orderIndex,
          cefr: candidate.cefr || lvl.cefr,
        };
      }
    }
  });

  // Jika semua modul berstatus locked kecuali modul pertama
  if (!nextModule && levels.length > 0 && levels[0].modules?.length > 0) {
    const first = levels[0].modules[0];
    nextModule = {
      id: first.id,
      title: first.title,
      orderIndex: first.orderIndex,
      cefr: first.cefr || levels[0].cefr,
    };
  }

  const difficultWords: string[] = userProfile?.memory?.weaknesses || [];
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
        {/* Section 1: Hero Passport & Smart Resume Card */}
        <DashboardHeroResume
          studentName={studentName}
          studentEmail={session.email}
          currentCefr={currentCefr}
          placementScore={latestTest?.scorePercent}
          nextModule={nextModule}
          totalCompletedModules={totalCompletedModules}
          totalModules={totalModules}
        />

        {/* Section 2: 3-Level Progress Roadmap */}
        {levels.length > 0 && (
          <DashboardLevelRoadmap
            levels={levels.map((lvl) => ({
              id: lvl.id,
              cefr: lvl.cefr,
              title: lvl.title,
              description: lvl.description,
              totalModules: lvl.totalModules,
              completedModules: lvl.completedModules,
              progressPercent: lvl.progressPercent,
              isUnlocked: Boolean(lvl.isUnlocked),
              lockReason: lvl.lockReason,
            }))}
          />
        )}

        {/* Section 3: AI Memory Difficult Words Widget */}
        <DashboardWeakWordsWidget words={difficultWords} />

        {/* Section 4: Secondary Quick Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                Voice AI Call
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Praktik Percakapan Bebas
              </h3>
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

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                Adaptive Assessment
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Uji Level CEFR Terkini
              </h3>
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
