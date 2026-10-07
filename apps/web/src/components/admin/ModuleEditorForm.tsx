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
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api-client";
import {
  ModuleEditorMetadataTab,
  CEFR_LEVELS,
} from "./module-editor/ModuleEditorMetadataTab";
import {
  ModuleEditorTheoryTab,
  RuleItem,
  CommonTrapState,
} from "./module-editor/ModuleEditorTheoryTab";
import {
  ModuleEditorVocabTab,
  VocabItem,
} from "./module-editor/ModuleEditorVocabTab";
import {
  ModuleEditorDialogueTab,
  DialogueLine,
} from "./module-editor/ModuleEditorDialogueTab";
import {
  ModuleEditorQuizTab,
  QuizQuestionItem,
} from "./module-editor/ModuleEditorQuizTab";

export interface ModuleEditorFormProps {
  initialData?: {
    module: any;
    sections: any[];
  };
  isEdit?: boolean;
}

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
  const [rules, setRules] = useState<RuleItem[]>(
    Array.isArray(theorySec.rules)
      ? theorySec.rules.map((r: any) =>
          typeof r === "object" ? r : { pattern: r, meaning: "", example: "" }
        )
      : []
  );
  const [commonTrap, setCommonTrap] = useState<CommonTrapState>({
    trapTitle: theorySec.commonTrap?.trapTitle || "",
    explanation: theorySec.commonTrap?.explanation || "",
    wrong: theorySec.commonTrap?.wrong || "",
    correct: theorySec.commonTrap?.correct || "",
  });

  // Section 2: Vocab
  const [vocabItems, setVocabItems] = useState<VocabItem[]>(
    Array.isArray(vocabSec.items) ? vocabSec.items : Array.isArray(vocabSec) ? vocabSec : []
  );

  // Section 3: Dialogue
  const [dialogueContext, setDialogueContext] = useState(dialogueSec.context || "");
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>(
    Array.isArray(dialogueSec.lines) ? dialogueSec.lines : Array.isArray(dialogueSec.dialogue) ? dialogueSec.dialogue : []
  );

  // Section 4: Quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>(
    Array.isArray(quizSec.questions) ? quizSec.questions : []
  );

  // AI Auto-Draft Handler
  const handleAiDraft = async () => {
    if (!title.trim()) {
      alert("Masukkan Judul Modul terlebih dahulu sebelum melakukan Auto-Draft dengan AI!");
      return;
    }

    try {
      setDraftingAi(true);
      setFeedback(null);

      const res = await fetch(getApiUrl("/api/curriculum/admin/modules/ai-draft"), {
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

      const targetPath = isEdit
        ? `/api/curriculum/admin/modules/${initialData?.module?.id}`
        : "/api/curriculum/admin/modules";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(getApiUrl(targetPath), {
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

  const tabs = [
    { key: "info", label: "Informasi Dasar", icon: Layers },
    { key: "theory", label: "Teori & Tata Bahasa", icon: BookOpen },
    { key: "vocab", label: "Kosakata Inti", icon: Volume2 },
    { key: "dialogue", label: "Percakapan", icon: MessageSquare },
    { key: "quiz", label: "Kuis Evaluasi", icon: HelpCircle },
  ] as const;

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
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEdit ? "Edit Kurikulum Modul" : "Buat Modul Baru"}
              </h2>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                Level {cefr}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atur metadata pembelajaran, materi grammar, kosakata, percakapan, dan evaluasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={draftingAi || saving}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 transition-all disabled:opacity-50 shadow-sm"
          >
            {draftingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                <span>AI Menulis Draf...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Auto-Draft AI</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={saving || draftingAi}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 shadow-sm shadow-blue-500/20"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Simpan Perubahan" : "Publikasikan Modul"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
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

      {activeTab === "info" && (
        <ModuleEditorMetadataTab
          isEdit={isEdit}
          moduleId={moduleId}
          setModuleId={setModuleId}
          cefr={cefr}
          setCefr={setCefr}
          levelId={levelId}
          setLevelId={setLevelId}
          title={title}
          setTitle={setTitle}
          group={group}
          setGroup={setGroup}
          complexity={complexity}
          setComplexity={setComplexity}
          objective={objective}
          setObjective={setObjective}
          estimatedMinutes={estimatedMinutes}
          setEstimatedMinutes={setEstimatedMinutes}
          passingScore={passingScore}
          setPassingScore={setPassingScore}
          orderIndex={orderIndex}
          setOrderIndex={setOrderIndex}
          isExam={isExam}
          setIsExam={setIsExam}
        />
      )}

      {activeTab === "theory" && (
        <ModuleEditorTheoryTab
          summary={summary}
          setSummary={setSummary}
          rules={rules}
          setRules={setRules}
          commonTrap={commonTrap}
          setCommonTrap={setCommonTrap}
        />
      )}

      {activeTab === "vocab" && (
        <ModuleEditorVocabTab
          vocabItems={vocabItems}
          setVocabItems={setVocabItems}
        />
      )}

      {activeTab === "dialogue" && (
        <ModuleEditorDialogueTab
          dialogueContext={dialogueContext}
          setDialogueContext={setDialogueContext}
          dialogueLines={dialogueLines}
          setDialogueLines={setDialogueLines}
        />
      )}

      {activeTab === "quiz" && (
        <ModuleEditorQuizTab
          quizQuestions={quizQuestions}
          setQuizQuestions={setQuizQuestions}
        />
      )}
    </form>
  );
}
