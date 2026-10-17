"use client";

import React, { useState, useEffect } from "react";
import { StudentShell } from "./student-shell";
import { StudentHeroBanner } from "./student-hero-banner";
import { StudentProgressCards } from "./student-progress-cards";
import { StudentArticlesSection } from "./student-articles-section";
import { StudentCalendarStrip } from "./student-calendar-strip";
import { StudentUpcomingMilestones } from "./student-upcoming-milestones";
import { useCurriculumLevels } from "@/features/curriculum/hooks/use-curriculum";
import { useUserProfile } from "@/features/users/hooks/use-user";
import { useLatestPlacement } from "@/features/placement/hooks/use-placement";

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
  const { data: latestTest } = useLatestPlacement(session.userId);

  const levels: any[] = Array.isArray(levelsData) ? levelsData : [];
  let totalCompletedModules = 0;
  let totalModules = 0;
  const allModules: any[] = [];

  levels.forEach((lvl: any) => {
    totalCompletedModules += lvl.completedModules || 0;
    totalModules += lvl.totalModules || 0;
    if (Array.isArray(lvl.modules)) {
      allModules.push(...lvl.modules);
    }
  });

  const studentName = userProfile?.name || session.name;
  const currentCefr = userProfile?.currentCefr || session.currentCefr || "A1.1";

  // Real active module from database: first unlocked module
  const activeModule =
    allModules.find((m) => m.status === "unlocked") ||
    allModules.find((m) => m.id === "A1.1-M01") ||
    allModules[0] || {
      id: "A1.1-M01",
      title: "Unit 1: One World: Countries, Nationalities & To Be",
      cefr: "A1.1",
    };

  // Real upcoming modules (excluding the active one)
  const upcomingModules = allModules.filter(
    (m) => m.id !== activeModule.id && m.status !== "completed"
  );

  return (
    <StudentShell studentName={studentName} currentCefr={currentCefr}>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Column: Hero Banner + Your Progress + Articles */}
        <div className="w-full lg:flex-1 space-y-6 lg:space-y-8 min-w-0">
          <StudentHeroBanner
            activeModuleCode={activeModule.id}
            activeModuleTitle={activeModule.title}
            currentCefr={currentCefr}
          />

          <StudentProgressCards
            currentCefr={currentCefr}
            totalCompletedModules={totalCompletedModules}
            totalModules={totalModules}
            placementScore={latestTest?.scorePercent}
            placementCefr={latestTest?.overallCefr}
          />

          <StudentArticlesSection />
        </div>

        {/* Right Column: Calendar Strip + Upcoming Milestones */}
        <div className="w-full lg:w-[360px] xl:w-[390px] space-y-6 lg:space-y-8 shrink-0">
          <StudentCalendarStrip />
          <StudentUpcomingMilestones modules={upcomingModules} />
        </div>
      </div>
    </StudentShell>
  );
}
