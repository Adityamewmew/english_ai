"use client";

import React from "react";
import { PhoneCall, Clock, User, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CallSessionItem {
  id: string;
  userId: string;
  studentName?: string | null;
  studentEmail?: string | null;
  studentCefr?: string | null;
  moduleId?: string | null;
  topic: string;
  durationSeconds: number;
  transcript?: string | null;
  evaluation?: {
    fluency?: number;
    lexical?: number;
    grammar?: number;
    pronunciation?: number;
    feedback_id?: string;
  } | null;
  createdAt: Date;
}

interface CallSessionListTableProps {
  calls: CallSessionItem[];
}

export function CallSessionListTable({ calls }: CallSessionListTableProps) {
  if (calls.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <PhoneCall className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Belum Ada Sesi Panggilan</h4>
        <p className="text-xs text-slate-500 mt-1">Siswa belum melakukan panggilan suara interaktif bersama Mr. Khoirul.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Siswa</th>
              <th className="py-3 px-4">Topik & Durasi</th>
              <th className="py-3 px-4">Ringkasan Transkrip</th>
              <th className="py-3 px-4">Rubrik Penilaian AI</th>
              <th className="py-3 px-4 text-right">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {calls.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors align-top">
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {c.studentName || "Siswa Tanpa Nama"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {c.studentEmail || c.userId}
                  </div>
                  {c.studentCefr && (
                    <Badge variant="outline" size="sm" className="mt-1 font-bold">
                      {c.studentCefr}
                    </Badge>
                  )}
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {c.topic}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>{Math.round(c.durationSeconds)} detik</span>
                    {c.moduleId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-blue-600">{c.moduleId}</span>
                      </>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 max-w-sm">
                  {c.transcript ? (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 italic">
                      &ldquo;{c.transcript}&rdquo;
                    </p>
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">Tidak ada transkrip</span>
                  )}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {c.evaluation ? (
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                        Fluency: <strong>{c.evaluation.fluency || 0}/100</strong>
                      </div>
                      <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        Grammar: <strong>{c.evaluation.grammar || 0}/100</strong>
                      </div>
                      <div className="p-1 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                        Lexical: <strong>{c.evaluation.lexical || 0}/100</strong>
                      </div>
                      <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                        Pronun: <strong>{c.evaluation.pronunciation || 0}/100</strong>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">Tanpa Penilaian</span>
                  )}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-right text-[11px] text-slate-500">
                  {new Date(c.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
