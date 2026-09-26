import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { doLogout } from "@/app/(auth)/auth.actions";
import { Button } from "@/components/ui/button";
import { Award, PhoneCall, BookOpen, LogOut, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const student = session;
  const API_URL = process.env.API_URL || "http://localhost:3001";

  let allModules: any[] = [];
  try {
    const modulesRes = await fetch(`${API_URL}/api/curriculum/modules`, { cache: "no-store" }).then(r => r.json());
    if (modulesRes.success) allModules = modulesRes.data || [];
  } catch (e) {
    console.error("Dashboard fetch modules error:", e);
  }

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

        {/* Curriculum Modules Catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">Katalog 36 Modul Kurikulum</h2>
              <p className="text-xs text-slate-500">Struktur materi sistematis dari level A1 hingga C2.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
              {allModules.length} Modul Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allModules.map((m: any) => (
              <div
                key={m.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-secondary transition-all hover:shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-secondary tracking-wide">{m.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.cefr === "A1" || m.cefr === "A2"
                          ? "bg-emerald-50 text-emerald-700"
                          : m.cefr === "B1" || m.cefr === "B2"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {m.cefr}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-primary group-hover:text-secondary transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{m.objective}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {m.lessonsCount || 1} Pelajaran
                  </span>
                  <span className="font-medium text-primary hover:text-secondary cursor-pointer">
                    Pelajari &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
