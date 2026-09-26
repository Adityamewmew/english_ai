import React from "react";
import Link from "next/link";
import { UserForm } from "@/components/admin/user-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Tambah Pengguna | Admin EDDY'S AI",
};

export default function AddUserPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/users" className="hover:text-primary transition">
          Manajemen Pengguna
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Tambah Baru</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Pengguna Baru</CardTitle>
          <CardDescription>
            Masukkan detail data pengguna untuk membuat akun siswa atau administrator baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
