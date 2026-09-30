import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  LevelHeader,
  ModuleCard,
  LevelCompletionCard,
  LevelLockedCard,
  LevelTabSelector,
} from "@/components/modules";
import { ArrowLeft, BookOpen, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ModulesRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { level: requestedLevel } = await searchParams;
  const isAdmin = session.role === "admin" || session.accessType === 1;
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

  const level1 = levels.find((l) => l.id === "A1.1");
  const level2 = levels.find((l) => l.id === "A1.2");
  const level3 = levels.find((l) => l.id === "A1.3");

  const isLevel1Completed =
    Boolean(
      level1 &&
        level1.totalModules > 0 &&
        level1.completedModules === level1.totalModules
    ) ||
    Boolean(level2?.isUnlocked) ||
    isAdmin;

  const isLevel2Completed =
    Boolean(
      level2 &&
        level2.totalModules > 0 &&
        level2.completedModules === level2.totalModules
    ) ||
    Boolean(level3?.isUnlocked) ||
    isAdmin;

  // Tentukan level mana yang aktif ditampilkan
  let activeLevelId = "A1.1";
  if (requestedLevel) {
    const target = levels.find((l) => l.id === requestedLevel);
    if (target) {
      activeLevelId = target.id;
    }
  } else if (isLevel2Completed && level3?.isUnlocked && !isAdmin) {
    activeLevelId = "A1.3";
  } else if (isLevel1Completed && level2?.isUnlocked && !isAdmin) {
    activeLevelId = "A1.2";
  }

  const activeLevel = levels.find((l) => l.id === activeLevelId) || level1;
  const isCurrentLevelUnlocked = isAdmin || Boolean(activeLevel?.isUnlocked);

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
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
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
          <div className="space-y-8">
            {/* Level Tab Switcher */}
            {levels.length > 1 && (
              <LevelTabSelector
                levels={levels.map((lvl) => ({
                  id: lvl.id,
                  cefr: lvl.cefr,
                  title: lvl.title,
                  isUnlocked: isAdmin ? true : Boolean(lvl.isUnlocked),
                  progressPercent: lvl.progressPercent,
                  completedModules: lvl.completedModules,
                  totalModules: lvl.totalModules,
                }))}
                activeLevelId={activeLevelId}
              />
            )}

            {/* Active Level Content */}
            {activeLevel && (
              <section key={activeLevel.id} className="space-y-6">
                <LevelHeader
                  levelTitle={activeLevel.title}
                  cefr={activeLevel.cefr}
                  description={activeLevel.description}
                  completedCount={activeLevel.completedModules}
                  totalCount={activeLevel.totalModules}
                  progressPercent={activeLevel.progressPercent}
                  isUnlocked={isCurrentLevelUnlocked}
                  lockReason={isAdmin ? null : activeLevel.lockReason}
                />

                {!isCurrentLevelUnlocked ? (
                  /* Jika Level Terkunci */
                  <div className="space-y-6">
                    <LevelLockedCard
                      levelTitle={activeLevel.title}
                      cefr={activeLevel.cefr}
                      description={activeLevel.description}
                      lockReason={activeLevel.lockReason}
                    />

                    <div className="pt-4 flex items-center justify-between">
                      <Link
                        href={`/modules?level=${level1?.id || "A1.1"}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                      >
                        <ArrowLeft className="w-4 h-4 text-blue-600" />
                        <span>Kembali ke Level 1</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Jika Level Terbuka */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeLevel.modules.map((m: any) => {
                        const isLocked = !isAdmin && m.status === "locked";
                        return (
                          <Link
                            key={m.id}
                            href={isLocked ? "#" : `/modules/${m.id}`}
                            className={isLocked ? "pointer-events-none" : "block"}
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
                                status: isAdmin && m.status === "locked" ? "unlocked" : m.status,
                                score: m.score,
                                orderIndex: m.orderIndex,
                              }}
                            />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Milestone Level 1 -> Level 2 */}
                    {activeLevel.id === "A1.1" && level2 && isLevel1Completed && (
                      <LevelCompletionCard
                        completedLevelTitle={level1.title}
                        nextLevelTitle={level2.title}
                        nextLevelId={level2.id}
                        firstNextModuleId="A1-M14"
                        description="Fondasi dasar komunikasi telah kamu kuasai. Buka dan lanjutkan pembelajaran ke Level 2 untuk mempelajari bentuk lampau, penunjuk arah, dan percakapan kontekstual lanjutan."
                        nextLevelButtonText="Buka Level 2"
                        firstModuleButtonText="Mulai Modul 14"
                      />
                    )}

                    {/* Milestone Level 2 -> Level 3 */}
                    {activeLevel.id === "A1.2" && level3 && isLevel2Completed && (
                      <LevelCompletionCard
                        completedLevelTitle={level2.title}
                        nextLevelTitle={level3.title}
                        nextLevelId={level3.id}
                        firstNextModuleId="A1-M27"
                        description="Komunikasi dasar dan ekspresi lampau telah kamu kuasai dengan baik! Buka Level 3 untuk memperluas kosakata kerja, sosial, dan kelancaran percakapan sehari-hari."
                        nextLevelButtonText="Buka Level 3"
                        firstModuleButtonText="Mulai Modul 27"
                      />
                    )}

                    {/* Bottom Navigation Per Level Tab */}
                    {activeLevel.id === "A1.2" && level1 && (
                      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <Link
                          href={`/modules?level=${level1.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4 text-blue-600" />
                          <span>Kembali ke Tab Level 1</span>
                        </Link>

                        {isLevel2Completed && level3 && (
                          <Link
                            href={`/modules?level=${level3.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-sm"
                          >
                            <span>Lanjut ke Tab Level 3</span>
                          </Link>
                        )}
                      </div>
                    )}

                    {activeLevel.id === "A1.3" && level2 && (
                      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <Link
                          href={`/modules?level=${level2.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4 text-blue-600" />
                          <span>Kembali ke Tab Level 2</span>
                        </Link>

                        <Link
                          href="/call"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Praktik Bicara Bebas AI</span>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
