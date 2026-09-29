import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LevelHeader, ModuleCard } from "@/components/modules";
import { ArrowLeft, BookOpen, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ModulesRoadmapPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const API_URL = process.env.API_URL || "http://localhost:3001";
  let levels: any[] = [];

  try {
    const res = await fetch(`${API_URL}/api/curriculum/levels?userId=${session.userId}`, {
      cache: "no-store",
    }).then((r) => r.json());

    if (res.success && Array.isArray(res.data)) {
      levels = res.data;
    }
  } catch (error) {
    console.error("Gagal mengambil data modul kurikulum:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                E
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-base">
                EDDY&apos;S <span className="text-blue-600">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/call">
              <Button variant="outline" size="sm" className="text-xs">
                <PhoneCall className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Call Speaking
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Roadmap Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {levels.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">
              Kurikulum Sedang Disiapkan
            </h3>
            <p className="text-xs text-slate-500">
              Silakan periksa kembali beberapa saat lagi atau hubungi administrator.
            </p>
          </div>
        ) : (
          levels.map((lvl) => (
            <section key={lvl.id} className="space-y-6">
              <LevelHeader
                levelTitle={lvl.title}
                cefr={lvl.cefr}
                description={lvl.description}
                completedCount={lvl.completedModules}
                totalCount={lvl.totalModules}
                progressPercent={lvl.progressPercent}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lvl.modules.map((m: any) => (
                  <Link
                    key={m.id}
                    href={m.status === "locked" ? "#" : `/modules/${m.id}`}
                    className={m.status === "locked" ? "pointer-events-none" : "block"}
                  >
                    <ModuleCard
                      module={{
                        id: m.id,
                        title: m.title,
                        cefr: m.cefr,
                        group: m.group,
                        objective: m.objective,
                        complexity: m.complexity,
                        estimatedMinutes: m.estimatedMinutes,
                        isExam: m.isExam,
                        passingScore: m.passingScore,
                        status: m.status,
                        score: m.score,
                        orderIndex: m.orderIndex,
                      }}
                      onSelect={() => {}}
                    />
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
