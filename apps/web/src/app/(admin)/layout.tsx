import React from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin Panel | EDDY'S AI",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requireRole(["admin"]);

  if (!guard.success) {
    if (guard.message === "Unauthorized") {
      redirect("/login?redirect=/admin");
    } else {
      redirect("/dashboard");
    }
  }

  const { session } = guard;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Nav */}
      <AdminSidebar
        adminName={session.name}
        adminEmail={session.email}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
