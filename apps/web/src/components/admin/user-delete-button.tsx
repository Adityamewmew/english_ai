"use client";

import React, { useState } from "react";
import { deleteUser } from "@/app/(admin)/users/actions";
import { useRouter } from "next/navigation";

interface UserDeleteButtonProps {
  userId: string;
  userName: string;
}

export function UserDeleteButton({ userId, userName }: UserDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userName}"?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await deleteUser(userId);
      if (!result.success) {
        alert(result.message || "Gagal menghapus pengguna");
        return;
      }
      router.refresh();
    } catch (err) {
      alert((err as Error).message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
      title="Hapus Pengguna"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
