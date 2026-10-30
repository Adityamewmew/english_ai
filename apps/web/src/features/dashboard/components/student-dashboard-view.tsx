"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StudentShell } from "./student-shell";
import { StudentHeroBanner } from "./student-hero-banner";
import { StudentProgressCards } from "./student-progress-cards";
import { StudentRecentActivitySection } from "./student-recent-activity";
import { StudentCalendarStrip } from "./student-calendar-strip";
import { StudentLevelMasteryCard } from "./student-level-mastery";
import { StudentDashboardMobile } from "./student-dashboard-mobile";
import { useCurriculumLevels } from "@/features/curriculum/hooks/use-curriculum";
import { useUserProfile } from "@/features/users/hooks/use-user";
import { useLatestPlacement } from "@/features/placement/hooks/use-placement";
import { useVoiceSessions } from "@/features/voice/hooks/use-voice";
import { chatApi } from "@/features/chat/api/chat.api";
import { useQuery } from "@tanstack/react-query";

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  currentCefr: string;
}

interface StudentDashboardViewProps {
  session: SessionUser;
}

export function StudentDashboardView({ session }: StudentDashboardViewProps) {
  const { data: levelsData } = useCurriculumLevels(session.userId);
  const { data: userProfile } = useUserProfile(session.userId);
  const router = useRouter();
  const { data: latestTest, isLoading: isPlacementLoading } = useLatestPlacement(session.userId);

  useEffect(() => {
    // Siswa baru yang belum menyelesaikan placement test wajib diarahkan ke /placement
    if (!isPlacementLoading && latestTest === null && session.role !== "admin") {
      router.replace("/placement");
    }
  }, [latestTest, isPlacementLoading, session.role, router]);
  const { data: voiceSessionsData } = useVoiceSessions(session.userId);

  const { data: chatSessionsData } = useQuery({
    queryKey: ["chat", "sessions", session.userId],
    queryFn: () => chatApi.listSessions(session.userId),
    enabled: !!session.userId,
  });

  const levels: any[] = Array.isArray(levelsData) ? levelsData : [];
  let totalCompletedModules = 0;
  let totalModules = 0;
  const allModules: any[] = [];
  const completedModules: any[] = [];

  levels.forEach((lvl: any) => {
    if (Array.isArray(lvl.modules)) {
      totalModules += lvl.modules.length;
      lvl.modules.forEach((m: any) => {
        allModules.push(m);
        if (m.status === "completed") {
          totalCompletedModules++;
          completedModules.push(m);
        }
      });
    }
  });

  const studentName = userProfile?.name || session.name || "Student";
  const currentCefr = userProfile?.currentCefr || session.currentCefr || "A1.1";

  // Current active level modules
  const currentLevelObj =
    levels.find(
      (l: any) =>
        l.level?.cefr?.toUpperCase() === currentCefr.toUpperCase() ||
        l.level?.id?.toUpperCase() === currentCefr.toUpperCase()
    ) || levels[0];

  const levelModules: any[] = currentLevelObj?.modules || allModules;

  // Real active module from database: first unlocked module
  const activeModule =
    allModules.find((m) => m.status === "unlocked") ||
    allModules.find((m) => m.id === "A1.1-M01") ||
    allModules[0] || {
      id: "A1.1-M01",
      title: "Unit 1: One World: Countries, Nationalities & To Be",
      cefr: currentCefr,
    };

  // Voice metrics
  const voiceSessions = Array.isArray(voiceSessionsData) ? voiceSessionsData : [];
  const voiceCallsCount = voiceSessions.length;
  const voiceTotalMinutes = Math.round(
    voiceSessions.reduce((acc: number, s: any) => acc + (s.durationSeconds || 0), 0) / 60
  );

  const chatSessions = Array.isArray(chatSessionsData) ? chatSessionsData : [];

  if (!isPlacementLoading && latestTest === null && session.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F6FF]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Redirecting to mandatory Placement Assessment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <StudentShell studentName={studentName} currentCefr={currentCefr}>
      {/* Dedicated Mobile-Only Viewport (<lg) */}
      <div className="block lg:hidden">
        <StudentDashboardMobile
          studentName={studentName}
          currentCefr={currentCefr}
          activeModule={activeModule}
          levelModules={levelModules}
          totalCompletedModules={totalCompletedModules}
          totalModules={totalModules}
          placementScore={latestTest?.scorePercent}
          placementCefr={latestTest?.overallCefr}
          voiceCallsCount={voiceCallsCount}
          voiceTotalMinutes={voiceTotalMinutes}
          voiceSessions={voiceSessions}
          chatSessions={chatSessions}
          completedModules={completedModules}
        />
      </div>

      {/* Dedicated Desktop-Only Viewport (lg+) */}
      <div className="hidden lg:flex p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex-row gap-8 items-start">
        {/* Left Column: Welcome Hero Banner + Your Progress + Recent Activity */}
        <div className="flex-1 space-y-8 min-w-0">
          <StudentHeroBanner
            studentName={studentName}
            currentCefr={currentCefr}
            activeModuleCode={activeModule.id}
          />

          <StudentProgressCards
            currentCefr={currentCefr}
            totalCompletedModules={totalCompletedModules}
            totalModules={totalModules}
            placementScore={latestTest?.scorePercent}
            placementCefr={latestTest?.overallCefr}
            voiceCallsCount={voiceCallsCount}
            voiceTotalMinutes={voiceTotalMinutes}
          />

          <StudentRecentActivitySection
            voiceSessions={voiceSessions}
            chatSessions={chatSessions}
            completedModules={completedModules}
          />
        </div>

        {/* Right Column: Calendar Strip + CEFR Level Mastery */}
        <div className="w-[360px] xl:w-[390px] space-y-8 shrink-0">
          <StudentCalendarStrip />
          <StudentLevelMasteryCard
            currentCefr={currentCefr}
            levelModules={levelModules}
            activeModule={activeModule}
          />
        </div>
      </div>
    </StudentShell>
  );
}
