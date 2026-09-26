import React from "react";
import Link from "next/link";
import { userService } from "@/services/user.service";
import { SearchBar } from "@/components/admin/search-bar";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Manajemen Pengguna | Admin EDDY'S AI",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ keywords?: string; role?: string; page?: string }>;
}) {
  const params = await searchParams;
  const keywords = params.keywords ?? "";
  const role = params.role ?? "all";
  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await userService.getAll({
    keywords,
    role,
    page,
    perPage: 15,
  });

  const { list = [], total = 0, perPage = 15 } = result.success && result.data ? result.data : {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-primary">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akun siswa dan administrator dalam platform pembelajaran EDDY'S AI.
          </p>
        </div>

        <Link
          href="/users/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 bg-white">
        <SearchBar defaultValue={keywords} defaultRole={role} actionUrl="/users" />
      </Card>

      {/* User Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Level CEFR</TableHead>
              <TableHead>Terdaftar Sejak</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm font-medium">Tidak ada data pengguna yang ditemukan.</p>
                    {keywords && (
                      <p className="text-xs text-slate-400">
                        Coba kata kunci pencarian lain atau klik tombol Reset.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              list.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge variant="secondary" size="sm">
                        ADMIN
                      </Badge>
                    ) : (
                      <Badge variant="primary" size="sm">
                        STUDENT
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="accent" size="sm">
                      {user.currentCefr || "A1"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition"
                        title="Edit Pengguna"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>

                      <UserDeleteButton userId={user.id} userName={user.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-semibold text-slate-700">{list.length}</span> dari{" "}
            <span className="font-semibold text-slate-700">{total}</span> total pengguna
          </div>

          {total > perPage && (
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/users?keywords=${encodeURIComponent(keywords)}&role=${role}&page=${page - 1}`}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  Sebelumnya
                </Link>
              )}
              <span>Halaman {page}</span>
              {page * perPage < total && (
                <Link
                  href={`/users?keywords=${encodeURIComponent(keywords)}&role=${role}&page=${page + 1}`}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  Selanjutnya
                </Link>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
