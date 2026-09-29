import React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  HelpCircle,
  Award,
  UserPlus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Badge } from "@/components/ui/badge";
import { adminDashboardService } from "@/services/admin-dashboard.service";

export const metadata = {
  title: "Dashboard Admin | EDDY'S AI",
};

export default async function AdminDashboardPage() {
  const result = await adminDashboardService.getStats();
  const stats = result.success && result.data ? result.data : {
    totalUsers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalModules: 0,
    totalLevels: 0,
    totalQuestions: 0,
    totalCompletedModules: 0,
    totalInProgressModules: 0,
    recentStudents: [],
    cefrDistribution: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
            EDDY&apos;S AI Administrator Control Center
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Ringkasan Sistem & Kurikulum
          </h2>
          <p className="text-xs text-blue-200 max-w-xl">
            Pantau pertumbuhan siswa, akses seluruh modul kurikulum dari level A1 hingga C2, serta kelola bank soal platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/users/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </Link>
          <Link
            href="/admin/modules"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/20"
          >
            <span>Buka Katalog Modul</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Siswa Aktif"
          value={stats.totalStudents}
          description={`${stats.totalAdmins} akun administrator terdaftar`}
          icon={Users}
          color="blue"
        />
        <AdminStatCard
          title="Modul & Kurikulum"
          value={stats.totalModules}
          description={`Tersedia di ${stats.totalLevels} tingkatan level CEFR`}
          icon={BookOpen}
          color="emerald"
        />
        <AdminStatCard
          title="Bank Soal Resmi"
          value={stats.totalQuestions}
          description="Soal kuis & placement test (A1 - C2)"
          icon={HelpCircle}
          color="amber"
        />
        <AdminStatCard
          title="Modul Diselesaikan"
          value={stats.totalCompletedModules}
          description={`${stats.totalInProgressModules} modul sedang dipelajari siswa`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Two Column Layout: Recent Students & CEFR Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Siswa Baru Mendaftar
              </h3>
              <p className="text-[11px] text-slate-500">
                5 akun siswa terakhir yang bergabung di platform
              </p>
            </div>
            <Link
              href="/users"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5">Nama & Email</th>
                  <th className="py-2.5">Level CEFR</th>
                  <th className="py-2.5 text-right">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats.recentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {s.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {s.email}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" size="sm" className="font-bold">
                        {s.currentCefr}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-slate-500 text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CEFR Level Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Distribusi Siswa</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sebaran Level CEFR
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.cefrDistribution).map(([level, count]) => {
              const max = Math.max(...Object.values(stats.cefrDistribution), 1);
              const percent = Math.round((count / max) * 100);

              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">
                      Level {level}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {count} Siswa
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
