"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "@/app/(admin)/users/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    accessType?: number;
    currentCefr?: string;
  };
}

export function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let result;

      if (mode === "create") {
        result = await createUser(formData);
      } else if (initialData?.id) {
        result = await updateUser(initialData.id, formData);
      } else {
        throw new Error("ID pengguna tidak valid");
      }

      if (!result.success) {
        setError(result.message || "Gagal menyimpan data pengguna");
        setLoading(false);
        return;
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Terjadi kesalahan sistem");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Nama Lengkap"
        name="name"
        defaultValue={initialData?.name || ""}
        placeholder="Contoh: Budi Santoso"
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={initialData?.email || ""}
        placeholder="budi@example.com"
        required
      />

      <Input
        label={mode === "create" ? "Password" : "Password (kosongkan jika tidak diubah)"}
        name="password"
        type="password"
        placeholder={mode === "create" ? "Minimal 6 karakter" : "Biarkan kosong untuk mempertahankan password lama"}
        required={mode === "create"}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Hak Akses & Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            defaultValue={initialData?.role || (initialData?.accessType === 1 ? "admin" : "student")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
          >
            <option value="admin">Admin (Akses Tipe 1)</option>
            <option value="student">Siswa / Student (Akses Tipe 2)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Level CEFR Awal <span className="text-red-500">*</span>
          </label>
          <select
            name="currentCefr"
            defaultValue={initialData?.currentCefr || "A1"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
          >
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Mastery / Proficient</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
        >
          Batal
        </button>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Menyimpan..." : mode === "create" ? "Simpan Pengguna" : "Perbarui Pengguna"}
        </Button>
      </div>
    </form>
  );
}
