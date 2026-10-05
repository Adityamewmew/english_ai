"use client";

import React from "react";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface ModuleEditorMetadataTabProps {
  isEdit: boolean;
  moduleId: string;
  setModuleId: (v: string) => void;
  cefr: string;
  setCefr: (v: string) => void;
  levelId: string;
  setLevelId: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  group: string;
  setGroup: (v: string) => void;
  complexity: string;
  setComplexity: (v: string) => void;
  objective: string;
  setObjective: (v: string) => void;
  estimatedMinutes: number;
  setEstimatedMinutes: (v: number) => void;
  passingScore: number;
  setPassingScore: (v: number) => void;
  orderIndex: number;
  setOrderIndex: (v: number) => void;
  isExam: boolean;
  setIsExam: (v: boolean) => void;
}

export function ModuleEditorMetadataTab({
  isEdit,
  moduleId,
  setModuleId,
  cefr,
  setCefr,
  levelId,
  setLevelId,
  title,
  setTitle,
  group,
  setGroup,
  complexity,
  setComplexity,
  objective,
  setObjective,
  estimatedMinutes,
  setEstimatedMinutes,
  passingScore,
  setPassingScore,
  orderIndex,
  setOrderIndex,
  isExam,
  setIsExam,
}: ModuleEditorMetadataTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            ID Modul {!isEdit && <span className="text-slate-400 font-normal">(Opsional)</span>}
          </label>
          <input
            type="text"
            disabled={isEdit}
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            placeholder="Contoh: B1.1-M14"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Level CEFR</label>
          <select
            value={cefr}
            onChange={(e) => {
              setCefr(e.target.value);
              setLevelId(`${e.target.value}.1`);
            }}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {CEFR_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>Level {lvl}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Level ID</label>
          <input
            type="text"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            placeholder="Contoh: B1.1"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Modul</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Unit 14: Career Choices: Modal Verbs of Obligation & Career Plans"
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori / Topik (Group)</label>
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Contoh: Work & Professional Communication"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tingkat Kompleksitas</label>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="basic">Basic (Dasar)</option>
            <option value="medium">Medium (Menengah)</option>
            <option value="deep">Deep (Mendalam)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tujuan Pembelajaran (Objective)</label>
        <textarea
          rows={2}
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Jelaskan kompetensi komunikatif yang akan dikuasai siswa setelah menyelesaikan modul ini."
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimasi (Menit)</label>
          <input
            type="number"
            min={5}
            max={120}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Passing Score (%)</label>
          <input
            type="number"
            min={50}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Urutan Indeks</label>
          <input
            type="number"
            min={1}
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isExamCheck"
            checked={isExam}
            onChange={(e) => setIsExam(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600"
          />
          <label htmlFor="isExamCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            Ujian Kelulusan
          </label>
        </div>
      </div>
    </div>
  );
}
