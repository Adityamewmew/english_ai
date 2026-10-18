"use client";

import React, { useState } from "react";
import { StudentSidebarRail } from "./student-sidebar-rail";
import { StudentTopbar } from "./student-topbar";
import { StudentMobileHeader } from "./student-mobile-header";
import { StudentMobileBottomNav } from "./student-mobile-bottom-nav";

interface StudentShellProps {
  children: React.ReactNode;
  studentName?: string;
  currentCefr?: string;
  showSearch?: boolean;
}

export function StudentShell({
  children,
  studentName = "",
  currentCefr = "A1.1",
  showSearch = false,
}: StudentShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:block shrink-0">
        <StudentSidebarRail
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <StudentMobileHeader
          studentName={studentName}
          currentCefr={currentCefr}
        />

        {/* Desktop Topbar (Hidden on Mobile) */}
        <div className="hidden lg:block">
          <StudentTopbar
            studentName={studentName}
            currentCefr={currentCefr}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            showSearch={showSearch}
          />
        </div>

        {/* Page Main Content: Generous bottom padding on mobile (pb-40 / 160px) so content and bottom buttons are never covered by fixed bottom nav + browser chrome */}
        <main className="flex-1 pb-40 sm:pb-32 lg:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
        <StudentMobileBottomNav />
      </div>
    </div>
  );
}
