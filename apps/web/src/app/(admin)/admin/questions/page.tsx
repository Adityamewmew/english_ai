import React from "react";
import { adminQuestionsService } from "@/services/admin-questions.service";
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

  const result = await adminQuestionsService.getAllQuestions({
    cefr,
    skill,
    keywords,
    page,
    perPage: 20,
  });

  const data = result.success && result.data ? result.data : {
    list: [],
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 1,
  };

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
