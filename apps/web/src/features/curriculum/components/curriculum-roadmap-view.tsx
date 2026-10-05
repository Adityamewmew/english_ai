import React from "react";
import Link from "next/link";
import {
  LevelHeader,
  ModuleCard,
  LevelCompletionCard,
  LevelLockedCard,
  LevelTabSelector,
} from "@/components/modules";
import { ArrowLeft, ArrowRight, BookOpen, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { curriculumApi } from "../api/curriculum.api";
import type { SessionUser } from "@/lib/session";

export interface CurriculumRoadmapViewProps {
  session: SessionUser;
  requestedLevel?: string;
}

export async function CurriculumRoadmapView({
  session,
  requestedLevel,
}: CurriculumRoadmapViewProps) {
  const isAdmin = session.role === "admin" || session.accessType === 1;
  let levels: any[] = [];

  try {
    const data = await curriculumApi.getLevels({ userId: session.userId });
    if (Array.isArray(data)) {
      levels = data;
    }
  } catch (error) {
    console.error("Gagal mengambil data modul kurikulum via API:", error);
  }

  // Tentukan level mana yang aktif ditampilkan
  let activeLevelId = levels[0]?.id || "A1.1";
  if (requestedLevel) {
    const target = levels.find(
      (l) =>
        l.id.toLowerCase() === requestedLevel.toLowerCase() ||
        l.cefr.toLowerCase() === requestedLevel.toLowerCase()
    );
    if (target) {
      activeLevelId = target.id;
    }
  } else {
    const inProgressLvl = levels.find(
      (l) => l.isUnlocked && l.completedModules < l.totalModules
    );
    if (inProgressLvl) {
      activeLevelId = inProgressLvl.id;
    } else if (levels.length > 0) {
      activeLevelId = levels[0].id;
    }
  }

  const activeLevel = levels.find((l) => l.id === activeLevelId) || levels[0];
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
                      <Button asChild variant="outline" size="sm" className="rounded-xl gap-2 shadow-sm">
                        <Link href={`/modules?level=${levels[0]?.id || "A1"}`}>
                          <ArrowLeft className="w-4 h-4 text-blue-600" />
                          <span>Kembali ke Level A1</span>
                        </Link>
                      </Button>
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

                    {/* Milestone Transition to Next Level */}
                    {(() => {
                      const curIdx = levels.findIndex((l) => l.id === activeLevel.id);
                      const nextLvl = curIdx >= 0 && curIdx < levels.length - 1 ? levels[curIdx + 1] : null;
                      const isCompleted = activeLevel.totalModules > 0 && activeLevel.completedModules === activeLevel.totalModules;
                      if (!nextLvl || !isCompleted) return null;

                      return (
                        <LevelCompletionCard
                          completedLevelTitle={activeLevel.title}
                          nextLevelTitle={nextLvl.title}
                          nextLevelId={nextLvl.id}
                          firstNextModuleId={nextLvl.modules?.[0]?.id || `${nextLvl.id}-M01`}
                          description={`Selamat! Seluruh materi di ${activeLevel.title} telah kamu selesaikan. Buka dan lanjutkan pembelajaran ke ${nextLvl.title} untuk meningkatkan kemampuan bahasa Inggrismu.`}
                          nextLevelButtonText={`Buka Level ${nextLvl.cefr}`}
                          firstModuleButtonText={`Mulai Modul 1`}
                        />
                      );
                    })()}

                    {/* Bottom Navigation Per Level Tab */}
                    {(() => {
                      const curIdx = levels.findIndex((l) => l.id === activeLevel.id);
                      const prevLvl = curIdx > 0 ? levels[curIdx - 1] : null;
                      const nextLvl = curIdx >= 0 && curIdx < levels.length - 1 ? levels[curIdx + 1] : null;

                      return (
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          {prevLvl ? (
                            <Button asChild variant="outline" size="sm" className="rounded-xl gap-2 shadow-sm">
                              <Link href={`/modules?level=${prevLvl.id}`}>
                                <ArrowLeft className="w-4 h-4 text-blue-600" />
                                <span>Kembali ke {prevLvl.title.split(" - ")[0]}</span>
                              </Link>
                            </Button>
                          ) : (
                            <div />
                          )}

                          {nextLvl && nextLvl.isUnlocked ? (
                            <Button asChild variant="default" size="sm" className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                              <Link href={`/modules?level=${nextLvl.id}`}>
                                <span>Lanjut ke {nextLvl.title.split(" - ")[0]}</span>
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          ) : (
                            <Button asChild variant="secondary" size="sm" className="rounded-xl gap-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400">
                              <Link href="/call">
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>Praktik Bicara Bebas AI</span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      );
                    })()}
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
