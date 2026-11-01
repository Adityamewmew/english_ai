import React from "react";
import { StudentShell, StudentDashboardSkeleton } from "@/features/dashboard";

export default function StudentLoading() {
  return (
    <StudentShell>
      <StudentDashboardSkeleton />
    </StudentShell>
  );
}
