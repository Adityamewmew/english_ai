import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { doLogout } from "@/app/(auth)/auth.actions";
import { Badge } from "@/components/ui/badge";

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
      redirect("/login?redirect=/users");
    } else {
      redirect("/dashboard");
    }
  }

  const { session } = guard;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/users" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-sm">
                  E
                </div>
                <div>
                  <span className="font-heading font-extrabold text-primary text-base tracking-tight">
                    EDDY'S AI
                  </span>
                  <span className="ml-2 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-secondary/15 text-secondary">
                    Admin
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/users"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-primary/10 text-primary transition"
                >
                  Manajemen Pengguna
                </Link>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-100 transition"
                >
                  Lihat Tampilan Siswa
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {session.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {session.email}
                </span>
              </div>

              <Badge variant="secondary" size="sm">
                ADMIN
              </Badge>

              <form action={doLogout}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition border border-slate-200"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
