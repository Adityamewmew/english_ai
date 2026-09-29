import React from "react";
import Link from "next/link";
import { adminCallsService } from "@/services/admin-calls.service";
import { CallSessionListTable } from "@/components/admin/CallSessionListTable";
import { ChevronLeft, ChevronRight, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Riwayat Sesi Panggilan AI | Admin EDDY'S AI",
};

export default async function AdminCallsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await adminCallsService.getAllCalls(page, 15);
  const data = result.success && result.data ? result.data : {
    list: [],
    total: 0,
    page: 1,
    perPage: 15,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Riwayat Sesi Percakapan AI
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pantau sesi latihan bicara siswa bersama Mr. Khoirul, termasuk durasi, rekaman transkrip, dan rubrik evaluasi.
        </p>
      </div>

      {/* Pagination & Count Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-semibold text-slate-500">
          Total <strong>{data.total}</strong> panggilan suara (Halaman {data.page} dari {data.totalPages || 1})
        </span>

        <div className="flex items-center gap-2">
          {data.page > 1 ? (
            <Link
              href={`/admin/calls?page=${data.page - 1}`}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </span>
          )}

          {data.page < data.totalPages ? (
            <Link
              href={`/admin/calls?page=${data.page + 1}`}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      <CallSessionListTable calls={data.list} />
    </div>
  );
}
