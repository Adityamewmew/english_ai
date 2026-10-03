"use client";

import React, { useState } from "react";
import Link from "next/link";
import { doRegister } from "../auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <span className="w-12 h-12 rounded-2xl bg-blue-600 inline-flex items-center justify-center text-white font-bold text-xl mb-3 shadow-sm">
            E
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daftar Akun EDDY&apos;S AI</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mulai perjalanan belajar Bahasa Inggrismu</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <Input
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Contoh: Budi Santoso"
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <Input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <Input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            {loading ? "Mendaftarkan..." : "Daftar & Mulai Belajar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </Card>
    </div>
  );
}
