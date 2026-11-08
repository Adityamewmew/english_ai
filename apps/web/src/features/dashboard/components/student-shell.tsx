"use client";

import React, { useState } from "react";
import { StudentSidebarRail } from "./student-sidebar-rail";
import { StudentTopbar } from "./student-topbar";
import { StudentMobileHeader } from "./student-mobile-header";
import { StudentMobileBottomNav } from "./student-mobile-bottom-nav";
import { SessionIdleTimeoutModal } from "./session-idle-timeout-modal";
import { useIdleTimeout } from "../hooks/use-idle-timeout";

interface StudentShellProps {
  children: React.ReactNode;
  studentName?: string;
  currentCefr?: string;
  userId?: string;
  showSearch?: boolean;
  hideBottomNav?: boolean;
}

export function StudentShell({
  children,
  studentName = "",
  currentCefr = "A1.1",
  userId,
  showSearch = false,
  hideBottomNav = false,
}: StudentShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isWarningOpen, remainingSeconds, resetTimer, logout } = useIdleTimeout();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="no-print hidden lg:block shrink-0">
        <StudentSidebarRail
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          userId={userId}
          currentCefr={currentCefr}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="no-print">
          <StudentMobileHeader
            studentName={studentName}
            currentCefr={currentCefr}
          />
        </div>

        {/* Desktop Topbar (Hidden on Mobile) */}
        <div className="no-print hidden lg:block">
          <StudentTopbar
            studentName={studentName}
            currentCefr={currentCefr}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            showSearch={showSearch}
          />
        </div>

        {/* Page Main Content: Generous bottom padding on mobile if bottom nav present */}
        <main className={`flex-1 ${hideBottomNav ? "pb-12 sm:pb-8 lg:pb-8" : "pb-40 sm:pb-32 lg:pb-8"}`}>
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop & when hideBottomNav is true) */}
        {!hideBottomNav && (
          <div className="no-print">
            <StudentMobileBottomNav userId={userId} currentCefr={currentCefr} />
          </div>
        )}

        {/* Global Idle Timeout Warning Guard */}
        <SessionIdleTimeoutModal
          isOpen={isWarningOpen}
          remainingSeconds={remainingSeconds}
          onContinue={resetTimer}
          onLogout={logout}
        />
      </div>
    </div>
  );
}
