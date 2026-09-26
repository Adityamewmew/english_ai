import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, BookOpen, Award, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
              E
            </span>
            <div>
              <span className="font-extrabold text-primary tracking-tight text-lg">
                EDDY&apos;S <span className="text-secondary">AI</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/placement">
              <Button variant="secondary" size="sm">
                Tes Penempatan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>Tutor AI Bahasa Inggris Pribadimu — Mr. Khoirul</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight max-w-4xl mx-auto">
          Jangan Hanya Belajar.{" "}
          <span className="text-secondary underline decoration-accent/60 underline-offset-8">
            Bangun Kemampuan
          </span>{" "}
          Bahasa Inggrismu.
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Latihan percakapan telepon real-time tanpa rasa minder. Dilengkapi tes penempatan akurat CEFR A1 hingga C2 dan kurikulum berstandar IELTS &amp; TOEIC.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/placement">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Ikuti Tes Penempatan (15 Menit)
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/call">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Mic className="w-4 h-4 text-secondary" />
              Coba Voice Call Mr. Khoirul
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white border-t py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-surface border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-primary">Voice Call Interaktif</h3>
            <p className="mt-2 text-sm text-slate-600">
              Bicara langsung lewat suara dengan Mr. Khoirul. Mengerti bahasa Indonesia saat kamu macet, koreksi lembut tanpa menginterupsi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-primary">36 Modul Terstruktur</h3>
            <p className="mt-2 text-sm text-slate-600">
              Dari pemula A1 hingga mahir C2. Materi grammar, vocabulary, dan reading yang disesuaikan langsung dengan level terbukamu.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center text-primary mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-primary">Standar IELTS &amp; CEFR</h3>
            <p className="mt-2 text-sm text-slate-600">
              Penilaian speaking dan writing transparan berdasarkan 4 kriteria resmi: Fluency, Lexical, Grammar, dan Pronunciation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-slate-400 py-8 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} EDDY&apos;S AI — Bagian dari EDDY&apos;S ENGLISH. Hak cipta dilindungi.</p>
      </footer>
    </main>
  );
}
