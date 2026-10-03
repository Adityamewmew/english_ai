import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mic, BookOpen, Award, Sparkles, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              E
            </span>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                EDDY&apos;S <span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/placement">Tes Penempatan</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <Badge
          variant="secondary"
          className="gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 mb-6 py-1 px-3.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Tutor AI Bahasa Inggris Pribadimu: Mr. Khoirul</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight max-w-4xl mx-auto">
          Jangan Hanya Belajar.{" "}
          <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-400/40 underline-offset-8">
            Bangun Refleks Bicara
          </span>{" "}
          Bahasa Inggrismu.
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Latihan percakapan telepon langsung tanpa rasa cemas. Didukung kurikulum komprehensif 180 modul CEFR A1 hingga C2 serta evaluasi standar IELTS dan TOEIC.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto sm:max-w-none">
          <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-xl shadow-md">
            <Link href="/placement">
              <span>Ikuti Tes Penempatan (15 Menit)</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900">
            <Link href="/call">
              <Mic className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
              <span>Coba Voice Call Mr. Khoirul</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Flagship Feature & Supporting Grid */}
      <section className="bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          {/* Flagship Hero Card: Voice Call Mr. Khoirul */}
          <Card className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border-blue-800/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <Badge variant="outline" className="gap-1.5 bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                <span>Fitur Unggulan Utama</span>
              </Badge>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Simulasi Telepon Suara Real-Time dengan Mr. Khoirul
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Bicara langsung secara alami. Mr. Khoirul mengerti konteks saat kamu kesulitan mencari kosakata, memberikan bimbingan pelafalan yang ramah, dan membantu membangun keberanian berbicara.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tanpa Rasa Minder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Koreksi Lembut Ramah Pemula</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kapan Saja &amp; Di Mana Saja</span>
                </div>
              </div>
            </div>

            {/* Interactive Preview Snippet */}
            <div className="w-full lg:w-96 bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl p-4 space-y-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pb-2 border-b border-white/10">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Contoh Interaksi Langsung</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-500/30 text-blue-100">
                  <strong className="block text-[10px] text-blue-300 mb-0.5">Siswa:</strong>
                  &ldquo;I want to describe my daily routine in the morning.&rdquo;
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 text-slate-200">
                  <strong className="block text-[10px] text-amber-300 mb-0.5">Mr. Khoirul:</strong>
                  &ldquo;Awesome topic! Start with what you usually do right after waking up.&rdquo;
                </div>
              </div>
            </div>
          </Card>

          {/* 2 Supporting Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  180 Modul Terstruktur (CEFR A1 - C2)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tersedia 30 modul berjenjang di setiap tingkatan CEFR (A1.1 hingga C2.2). Materi tata bahasa kontekstual, kosakata tematik, hingga Speaking Lab siap pakai.
                </p>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Standar Evaluasi CEFR &amp; IELTS
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Penilaian kelancaran, tata bahasa, dan kosakata berbasis rubrik internasional resmi, memberikan umpan balik konstruktif untuk setiap latihan bicara.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 py-8 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} EDDY&apos;S AI: Bagian dari EDDY&apos;S ENGLISH. Hak cipta dilindungi.</p>
      </footer>
    </main>
  );
}
