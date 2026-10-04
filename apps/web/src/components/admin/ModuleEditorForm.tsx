"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Layers,
  BookOpen,
  Volume2,
  MessageSquare,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ModuleEditorFormProps {
  initialData?: {
    module: any;
    sections: any[];
  };
  isEdit?: boolean;
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function ModuleEditorForm({ initialData, isEdit = false }: ModuleEditorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "theory" | "vocab" | "dialogue" | "quiz">("info");
  const [saving, setSaving] = useState(false);
  const [draftingAi, setDraftingAi] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State: Module Metadata
  const [moduleId, setModuleId] = useState(initialData?.module?.id || "");
  const [title, setTitle] = useState(initialData?.module?.title || "");
  const [cefr, setCefr] = useState(initialData?.module?.cefr || "B1");
  const [levelId, setLevelId] = useState(initialData?.module?.levelId || "B1.1");
  const [group, setGroup] = useState(initialData?.module?.group || "General English");
  const [objective, setObjective] = useState(initialData?.module?.objective || "");
  const [complexity, setComplexity] = useState(initialData?.module?.complexity || "medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialData?.module?.estimatedMinutes || 15);
  const [isExam, setIsExam] = useState(initialData?.module?.isExam || false);
  const [passingScore, setPassingScore] = useState(initialData?.module?.passingScore || 70);
  const [orderIndex, setOrderIndex] = useState(initialData?.module?.orderIndex || 1);

  // Form State: Sections
  const theorySec = initialData?.sections?.find((s) => s.sectionType === "theory")?.content || {};
  const vocabSec = initialData?.sections?.find((s) => s.sectionType === "vocab")?.content || {};
  const dialogueSec = initialData?.sections?.find((s) => s.sectionType === "dialogue")?.content || {};
  const quizSec = initialData?.sections?.find((s) => s.sectionType === "quiz")?.content || {};

  // Section 1: Theory
  const [summary, setSummary] = useState(theorySec.summary || "");
  const [rules, setRules] = useState<Array<{ pattern: string; meaning: string; example: string }>>(
    Array.isArray(theorySec.rules)
      ? theorySec.rules.map((r: any) =>
          typeof r === "object" ? r : { pattern: r, meaning: "", example: "" }
        )
      : []
  );
  const [commonTrap, setCommonTrap] = useState({
    trapTitle: theorySec.commonTrap?.trapTitle || "",
    explanation: theorySec.commonTrap?.explanation || "",
    wrong: theorySec.commonTrap?.wrong || "",
    correct: theorySec.commonTrap?.correct || "",
  });

  // Section 2: Vocab
  const [vocabItems, setVocabItems] = useState<Array<{ word: string; translation: string; example: string; context?: string }>>(
    Array.isArray(vocabSec.items) ? vocabSec.items : Array.isArray(vocabSec) ? vocabSec : []
  );

  // Section 3: Dialogue
  const [dialogueContext, setDialogueContext] = useState(dialogueSec.context || "");
  const [dialogueLines, setDialogueLines] = useState<Array<{ speaker: string; text: string; translation: string }>>(
    Array.isArray(dialogueSec.lines) ? dialogueSec.lines : Array.isArray(dialogueSec.dialogue) ? dialogueSec.dialogue : []
  );

  // Section 4: Quiz
  const [quizQuestions, setQuizQuestions] = useState<Array<{ prompt: string; options: string[]; correctIndex: number; explanation: string }>>(
    Array.isArray(quizSec.questions) ? quizSec.questions : []
  );

  // Handlers for dynamic arrays
  const addRule = () => setRules((prev) => [...prev, { pattern: "", meaning: "", example: "" }]);
  const removeRule = (idx: number) => setRules((prev) => prev.filter((_, i) => i !== idx));

  const addVocab = () => setVocabItems((prev) => [...prev, { word: "", translation: "", example: "", context: "" }]);
  const removeVocab = (idx: number) => setVocabItems((prev) => prev.filter((_, i) => i !== idx));

  const addDialogueLine = () => setDialogueLines((prev) => [...prev, { speaker: "Speaker A", text: "", translation: "" }]);
  const removeDialogueLine = (idx: number) => setDialogueLines((prev) => prev.filter((_, i) => i !== idx));

  const addQuizQuestion = () =>
    setQuizQuestions((prev) => [
      ...prev,
      { prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
    ]);
  const removeQuizQuestion = (idx: number) => setQuizQuestions((prev) => prev.filter((_, i) => i !== idx));

  // AI Auto-Draft Handler
  const handleAiDraft = async () => {
    if (!title.trim()) {
      alert("Masukkan Judul Modul terlebih dahulu sebelum melakukan Auto-Draft dengan AI!");
      return;
    }

    try {
      setDraftingAi(true);
      setFeedback(null);

      const res = await fetch("/api/curriculum/admin/modules/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          cefr,
          levelId,
          objective,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Gagal membuat draf dengan AI");
      }

      const draft = json.data;
      if (draft.objective && !objective) setObjective(draft.objective);
      if (draft.group && (!group || group === "General English")) setGroup(draft.group);
      if (draft.complexity) setComplexity(draft.complexity);

      // Theory draft
      if (draft.theory) {
        if (draft.theory.summary) setSummary(draft.theory.summary);
        if (Array.isArray(draft.theory.rules) && draft.theory.rules.length > 0) setRules(draft.theory.rules);
        if (draft.theory.commonTrap) setCommonTrap(draft.theory.commonTrap);
      }

      // Vocab draft
      if (Array.isArray(draft.vocab) && draft.vocab.length > 0) setVocabItems(draft.vocab);

      // Dialogue draft
      if (draft.dialogue) {
        if (draft.dialogue.context) setDialogueContext(draft.dialogue.context);
        if (Array.isArray(draft.dialogue.lines) && draft.dialogue.lines.length > 0) setDialogueLines(draft.dialogue.lines);
      }

      // Quiz draft
      if (draft.quiz && Array.isArray(draft.quiz.questions) && draft.quiz.questions.length > 0) {
        setQuizQuestions(draft.quiz.questions);
      }

      setFeedback({
        type: "success",
        message: "✨ Draf lengkap materi (Teori, Kosakata, Dialog & Kuis) berhasil digenerate otomatis oleh AI!",
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Gagal memproses AI Draft" });
    } finally {
      setDraftingAi(false);
    }
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Judul modul wajib diisi!");
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const payload = {
        id: moduleId || undefined,
        levelId,
        title,
        cefr,
        group,
        objective,
        complexity,
        estimatedMinutes: Number(estimatedMinutes),
        isExam,
        passingScore: Number(passingScore),
        orderIndex: Number(orderIndex),
        sections: [
          {
            sectionType: "theory",
            title: "Teori & Tata Bahasa (Theory & Grammar)",
            orderIndex: 1,
            content: {
              summary,
              rules,
              commonTrap,
              readinessQuestions: theorySec.readinessQuestions || [],
            },
          },
          {
            sectionType: "vocab",
            title: "Kosakata Inti (Core Vocabulary)",
            orderIndex: 2,
            content: { items: vocabItems },
          },
          {
            sectionType: "dialogue",
            title: "Percakapan Kontekstual (Dialogue)",
            orderIndex: 3,
            content: { context: dialogueContext, lines: dialogueLines },
          },
          {
            sectionType: "practice",
            title: "Praktik Berbicara (Speaking Lab)",
            orderIndex: 4,
            content: {
              goal: `Menerapkan percakapan topik ${title} secara lisan.`,
              scenario: dialogueContext || `Skenario latihan ${title}`,
            },
          },
          {
            sectionType: "quiz",
            title: "Kuis Evaluasi (Module Assessment)",
            orderIndex: 5,
            content: { passingScore: Number(passingScore), questions: quizQuestions },
          },
        ],
      };

      const url = isEdit
        ? `/api/curriculum/admin/modules/${initialData?.module?.id}`
        : "/api/curriculum/admin/modules";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal menyimpan modul");
      }

      setFeedback({
        type: "success",
        message: isEdit ? "Modul berhasil diperbarui!" : "Modul baru berhasil dibuat dan disimpan!",
      });

      setTimeout(() => {
        router.push("/admin/modules");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan saat menyimpan modul" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/modules"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {isEdit ? `Edit Modul: ${title || moduleId}` : "Buat Modul Kurikulum Baru"}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                {cefr}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {isEdit ? "Perbarui informasi dan materi pembelajaran modul ini." : "Lengkapi metadata dan 5 bagian materi pembelajaran modul baru."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={draftingAi || saving}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/80 dark:border-purple-800/60 text-xs font-bold transition-all disabled:opacity-50"
            title="Isi draf materi lengkap otomatis dengan AI"
          >
            {draftingAi ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            <span>Auto-Draft AI</span>
          </button>

          <button
            type="submit"
            disabled={saving || draftingAi}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? "Simpan Perubahan" : "Publikasikan Modul"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        {[
          { id: "info", label: "Informasi Dasar", icon: Layers },
          { id: "theory", label: "Teori & Tata Bahasa", icon: BookOpen },
          { id: "vocab", label: "Kosakata Inti", icon: Volume2 },
          { id: "dialogue", label: "Percakapan Kontekstual", icon: MessageSquare },
          { id: "quiz", label: "Kuis Evaluasi", icon: HelpCircle },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Informasi Dasar */}
      {activeTab === "info" && (
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
      )}

      {/* Tab 2: Teori & Tata Bahasa */}
      {activeTab === "theory" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ringkasan Konsep Teori (Summary)
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Penjelasan ringkas mengenai konsep tata bahasa atau formula utama materi ini."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Kaidah / Pola Pembentukan Kalimat (Rules)
              </label>
              <button
                type="button"
                onClick={addRule}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Aturan
              </button>
            </div>

            {rules.map((rule, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Kaidah #{idx + 1}</span>
                  <button type="button" onClick={() => removeRule(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Pola/Formula (e.g. Subject + must + V1)"
                    value={rule.pattern}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].pattern = e.target.value;
                      setRules(updated);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Arti/Konteks (e.g. Menyatakan keharusan mutlak)"
                    value={rule.meaning}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].meaning = e.target.value;
                      setRules(updated);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Contoh Kalimat (e.g. You must wear a helmet.)"
                    value={rule.example}
                    onChange={(e) => {
                      const updated = [...rules];
                      updated[idx].example = e.target.value;
                      setRules(updated);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Common Trap */}
          <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Peringatan Kesalahan Umum (Common Trap)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Judul Kesalahan (e.g. Salah meletakkan kata kerja)"
                value={commonTrap.trapTitle}
                onChange={(e) => setCommonTrap({ ...commonTrap, trapTitle: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Penjelasan Jebakan"
                value={commonTrap.explanation}
                onChange={(e) => setCommonTrap({ ...commonTrap, explanation: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Contoh SALAH (Wrong)"
                value={commonTrap.wrong}
                onChange={(e) => setCommonTrap({ ...commonTrap, wrong: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-rose-600 font-medium"
              />
              <input
                type="text"
                placeholder="Contoh BENAR (Correct)"
                value={commonTrap.correct}
                onChange={(e) => setCommonTrap({ ...commonTrap, correct: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-emerald-600 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kosakata Inti */}
      {activeTab === "vocab" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Kosakata Inti ({vocabItems.length})</h3>
              <p className="text-[11px] text-slate-500">Kosakata target yang akan dipelajari dan dilatih siswa.</p>
            </div>
            <button type="button" onClick={addVocab} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Tambah Kosakata
            </button>
          </div>

          <div className="space-y-2.5">
            {vocabItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Kata (English)"
                  value={item.word}
                  onChange={(e) => {
                    const u = [...vocabItems];
                    u[idx].word = e.target.value;
                    setVocabItems(u);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
                <input
                  type="text"
                  placeholder="Terjemahan (Indonesia)"
                  value={item.translation}
                  onChange={(e) => {
                    const u = [...vocabItems];
                    u[idx].translation = e.target.value;
                    setVocabItems(u);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Contoh Kalimat"
                  value={item.example}
                  onChange={(e) => {
                    const u = [...vocabItems];
                    u[idx].example = e.target.value;
                    setVocabItems(u);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Konteks (Opsional)"
                    value={item.context || ""}
                    onChange={(e) => {
                      const u = [...vocabItems];
                      u[idx].context = e.target.value;
                      setVocabItems(u);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <button type="button" onClick={() => removeVocab(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Percakapan Kontekstual */}
      {activeTab === "dialogue" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Konteks Skenario Percakapan</label>
            <input
              type="text"
              value={dialogueContext}
              onChange={(e) => setDialogueContext(e.target.value)}
              placeholder="Contoh: Alex and Jordan are discussing company policy during lunchtime."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Alur Giliran Dialog ({dialogueLines.length})</h3>
            <button type="button" onClick={addDialogueLine} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Tambah Baris Dialog
            </button>
          </div>

          <div className="space-y-3">
            {dialogueLines.map((line, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={line.speaker}
                    onChange={(e) => {
                      const u = [...dialogueLines];
                      u[idx].speaker = e.target.value;
                      setDialogueLines(u);
                    }}
                    placeholder="Nama Tokoh"
                    className="w-40 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <button type="button" onClick={() => removeDialogueLine(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Kalimat Bahasa Inggris"
                    value={line.text}
                    onChange={(e) => {
                      const u = [...dialogueLines];
                      u[idx].text = e.target.value;
                      setDialogueLines(u);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Terjemahan Bahasa Indonesia"
                    value={line.translation}
                    onChange={(e) => {
                      const u = [...dialogueLines];
                      u[idx].translation = e.target.value;
                      setDialogueLines(u);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Kuis Evaluasi */}
      {activeTab === "quiz" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Soal Kuis Evaluasi ({quizQuestions.length})</h3>
              <p className="text-[11px] text-slate-500">Soal pilihan ganda yang menguji pemahaman akhir modul siswa.</p>
            </div>
            <button type="button" onClick={addQuizQuestion} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Tambah Soal Kuis
            </button>
          </div>

          <div className="space-y-4">
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Soal #{qIdx + 1}</span>
                  <button type="button" onClick={() => removeQuizQuestion(qIdx)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pertanyaan</label>
                  <input
                    type="text"
                    value={q.prompt}
                    onChange={(e) => {
                      const u = [...quizQuestions];
                      u[qIdx].prompt = e.target.value;
                      setQuizQuestions(u);
                    }}
                    placeholder="Tuliskan pertanyaan kuis..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct_q_${qIdx}`}
                        checked={q.correctIndex === optIdx}
                        onChange={() => {
                          const u = [...quizQuestions];
                          u[qIdx].correctIndex = optIdx;
                          setQuizQuestions(u);
                        }}
                        className="w-4 h-4 text-emerald-600"
                        title="Tandai sebagai kunci jawaban"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const u = [...quizQuestions];
                          u[qIdx].options[optIdx] = e.target.value;
                          setQuizQuestions(u);
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-lg border ${
                          q.correctIndex === optIdx
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-semibold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={q.explanation || ""}
                    onChange={(e) => {
                      const u = [...quizQuestions];
                      u[qIdx].explanation = e.target.value;
                      setQuizQuestions(u);
                    }}
                    placeholder="Penjelasan jawaban benar..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
