"use client";

import React, { useState } from "react";
import Link from "next/link";
import { doRegister } from "../auth.actions";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await doRegister(formData);

    if (res && !res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <span className="w-12 h-12 rounded-2xl bg-secondary inline-flex items-center justify-center text-white font-bold text-xl mb-3 shadow">
            E
          </span>
          <h1 className="text-2xl font-bold text-primary">Daftar Akun EDDY&apos;S AI</h1>
          <p className="text-xs text-slate-500 mt-1">Mulai perjalanan belajar Bahasa Inggrismu</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <Button type="submit" variant="secondary" disabled={loading} className="w-full mt-2">
            {loading ? "Mendaftarkan..." : "Daftar & Mulai Tes Penempatan"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
