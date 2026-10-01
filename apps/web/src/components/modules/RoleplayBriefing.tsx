"use client";

import React from "react";
import { Sparkles, Info, Play } from "lucide-react";

interface RoleplayBriefingProps {
  context?: string;
  autoUserRole: string;
  aiRole: string;
  onStartRoleplay: () => void;
}

export function RoleplayBriefing({
  context,
  autoUserRole,
  aiRole,
  onStartRoleplay,
}: RoleplayBriefingProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
        <Sparkles className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Simulasi Peran Interaktif (AI Roleplay)
        </span>
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          Praktik Percakapan Dua Arah Bersama AI
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Pada tahap ini, kamu akan langsung mempraktikkan percakapan nyata. AI akan menyapamu terlebih dahulu, kemudian giliranmu berbicara melafalkan respons yang tepat dengan santai.
        </p>
      </div>

      {/* Box Skenario & Karakter */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
        {context && (
          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Skenario Situasi:</strong>
              <span>{context}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
              Peranmu:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {autoUserRole} (Kamu)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Mitra Bicara:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {aiRole} (AI Mitra)
            </span>
          </div>
        </div>
      </div>

      {/* Petunjuk Singkat 3 Langkah */}
      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[11px]">
            1
          </div>
          <span>Mitra AI ({aiRole}) akan memulai obrolan dengan suara dan teks.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[11px]">
            2
          </div>
          <span>Saat giliranmu, tekan mikrofon dan bicaralah secara perlahan tanpa terburu-buru.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[11px]">
            3
          </div>
          <span>Kamu bisa klik &quot;Selesai Bicara&quot; jika sudah selesai atau tunggu jeda sejenak.</span>
        </div>
      </div>

      {/* Tombol Mulai */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartRoleplay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mulai Simulasi Percakapan</span>
        </button>
      </div>
    </div>
  );
}
