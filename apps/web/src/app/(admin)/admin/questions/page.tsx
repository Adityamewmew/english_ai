import React from "react";
import { adminApi } from "@/features/admin";
import { AdminQuestionsClient } from "@/components/admin/AdminQuestionsClient";

export const metadata = {
  title: "Bank Soal & Ujian | Admin EDDY'S AI",
};

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ cefr?: string; skill?: string; keywords?: string; page?: string }>;
}) {
  const params = await searchParams;
  const cefr = params.cefr ?? "all";
  const skill = params.skill ?? "all";
  const keywords = params.keywords ?? "";
  const page = params.page ? parseInt(params.page, 10) : 1;

  let data = {
    list: [],
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 1,
  };

  try {
    const res = await adminApi.getAllQuestions({
      cefr,
      skill,
      keywords,
      page,
      perPage: 20,
    });
    if (res) data = res;
  } catch (e) {
    console.error("Gagal mengambil bank soal via API:", e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bank Soal & Penilaian
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kelola dan telusuri seluruh 226+ bank soal placement test dan kuis modul berdasarkan level CEFR serta kemampuan spesifik.
        </p>
      </div>

      <AdminQuestionsClient
        initialData={data}
        currentCefr={cefr}
        currentSkill={skill}
        currentKeywords={keywords}
      />
    </div>
  );
}
