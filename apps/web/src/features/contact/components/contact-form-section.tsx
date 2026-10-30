"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, User, Phone, Building, BookOpen } from "lucide-react";

export function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    branch: "kalimantan",
    program: "speaking-ai",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    // Compose formatted WhatsApp URL
    const branchNames: Record<string, string> = {
      kalimantan: "Jl. Kalimantan No. 77 (Sekolah Bahasa Inggris)",
      tidar: "Jl. Tidar (Kantor Perusahaan)",
      online: "Platform Online EDDY'S AI",
    };

    const programNames: Record<string, string> = {
      "speaking-ai": "Latihan Speaking 24/7 (EDDY'S AI)",
      general: "General English (Anak / Remaja / Dewasa)",
      toefl: "Persiapan TOEFL / IELTS",
      corporate: "In-House Training Perusahaan / Sekolah",
    };

    const text = `Halo Admin Eddy's English Jember,
Saya ingin konsultasi pendaftaran kelas:
- Nama: ${formData.name}
- No. WhatsApp: ${formData.phone}
- Pilihan Lokasi: ${branchNames[formData.branch] || formData.branch}
- Program yang Diminati: ${programNames[formData.program] || formData.program}
- Catatan/Pertanyaan: ${formData.message || "Mohon informasi jadwal & biaya"}

Terima kasih.`;

    const waUrl = `https://wa.me/6281336712345?text=${encodeURIComponent(text)}`;
    setSubmitted(true);
    window.open(waUrl, "_blank");
  };

  return (
    <section id="konsultasi" className="py-14 sm:py-20 px-4 sm:px-6 md:px-8 relative bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 border-b-[5px] border-b-slate-300/80 shadow-[0_20px_45px_-12px_rgba(16,55,92,0.12),inset_0_1.5px_1px_#ffffff] p-6 sm:p-10 md:p-12 relative overflow-hidden">
          {/* Subtle Decorative Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[11px] font-heading font-bold uppercase tracking-wider border border-secondary/20">
                Formulir Konsultasi Cepat
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-primary tracking-tight">
                Tanyakan Program &amp; Jadwal Belajar
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Isi form singkat ini untuk langsung terhubung dengan tim konsultan akademik Eddy&apos;s English Jember via WhatsApp resmi kami.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 border-b-4 border-b-emerald-300 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-heading font-bold text-base text-emerald-900">
                  Pesan Konsultasi Sedang Dibuka di WhatsApp!
                </div>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Jika jendela WhatsApp tidak terbuka otomatis, Anda dapat mengklik tombol di bawah ini untuk memulai chat.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    &larr; Isi form pertanyaan lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-heading font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Nama Lengkap *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dimas Prasetyo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 bg-slate-50/80 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04)] transition-all"
                    />
                  </div>

                  {/* No WhatsApp */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-heading font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>Nomor WhatsApp Aktif *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 bg-slate-50/80 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04)] transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pilihan Cabang */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-heading font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-primary" />
                      <span>Pilihan Cabang / Layanan</span>
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 bg-slate-50/80 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04)] transition-all"
                    >
                      <option value="kalimantan">Jl. Kalimantan No. 77 (Sekolah Bahasa Inggris)</option>
                      <option value="tidar">Jl. Tidar (Kantor Perusahaan)</option>
                      <option value="online">Platform Online EDDY&apos;S AI</option>
                    </select>
                  </div>

                  {/* Pilihan Program */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-heading font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span>Program yang Diminati</span>
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 bg-slate-50/80 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04)] transition-all"
                    >
                      <option value="speaking-ai">Latihan Speaking 24/7 (EDDY&apos;S AI)</option>
                      <option value="general">General English (Kids, Teens, Adults)</option>
                      <option value="toefl">Persiapan Tes TOEFL / IELTS</option>
                      <option value="corporate">In-House Training Perusahaan / Sekolah</option>
                    </select>
                  </div>
                </div>

                {/* Pesan */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-heading font-bold text-slate-700">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan jadwal kelas yang diinginkan, jenjang pendidikan, atau pertanyaan khusus Anda..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 bg-slate-50/80 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04)] transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-heading font-bold text-xs sm:text-sm text-white bg-gradient-to-b from-[#184e7d] to-primary hover:from-[#1d5c94] hover:to-[#13426e] active:translate-y-1 shadow-[0_5px_0_#092138,0_12px_24px_-4px_rgba(16,55,92,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-accent stroke-[2.4]" />
                    <span>Kirim &amp; Hubungi via WhatsApp Resmi</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Data Anda aman dan hanya digunakan untuk keperluan konsultasi kelas Eddy&apos;s English.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

