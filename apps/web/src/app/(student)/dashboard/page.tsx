import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { doLogout } from "@/app/(auth)/auth.actions";
import { Button } from "@/components/ui/button";
import { Award, PhoneCall, LogOut, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const student = session;
  const API_URL = process.env.API_URL || "http://localhost:3001";

  let latestTest: any = null;
  try {
    const testRes = await fetch(`${API_URL}/api/placement/latest/${session.userId}`, { cache: "no-store" }).then(r => r.json());
    if (testRes.success) latestTest = testRes.data;
  } catch (e) {
    console.error("Dashboard fetch latestTest error:", e);
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navbar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
              E
            </span>
            <span className="font-extrabold text-primary text-base">
              EDDY&apos;S <span className="text-secondary">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/call">
              <Button variant="secondary" size="sm">
                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                Call Mr. Khoirul
              </Button>
            </Link>

            <form action={doLogout}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-red-600">
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Banner Profil & Grade Real */}
        <div className="bg-gradient-to-r from-primary to-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-accent uppercase tracking-wider">
              Student English Passport
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">Selamat Datang, {student.name}!</h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg">
              {student.email} • Akun aktif terdaftar di sistem.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-4 text-center min-w-[160px]">
            <span className="text-xs text-slate-300">Level CEFR Aktif</span>
            <div className="text-4xl font-extrabold text-accent mt-1">{student.currentCefr}</div>
            {latestTest ? (
              <span className="text-[11px] text-slate-300 mt-1 block">
                Skor: {latestTest.scorePercent}%
              </span>
            ) : (
              <span className="text-[11px] text-slate-300 mt-1 block">
                Status: Terverifikasi
              </span>
            )}
            <Link href="/placement" className="text-[11px] text-white/80 hover:text-white underline mt-1 block">
              Ulangi Tes Penempatan
            </Link>
          </div>
        </div>

        {/* Quick Hero Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-primary">Latihan Percakapan Langsung</h2>
              <p className="text-xs text-slate-500">Telepon Mr. Khoirul untuk melatih speaking tanpa rasa takut.</p>
            </div>
            <Link href="/call">
              <Button variant="secondary">
                Mulai Call
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-primary">Uji Level Kemampuan</h2>
              <p className="text-xs text-slate-500">Ikuti Tes Penempatan adaptif untuk memperbarui CEFR grade.</p>
            </div>
            <Link href="/placement">
              <Button variant="outline">
                <Award className="w-4 h-4 mr-1 text-secondary" />
                Tes Penempatan
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
