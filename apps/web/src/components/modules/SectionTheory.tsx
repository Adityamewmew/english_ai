import React from "react";
import { BookOpen, ShieldAlert, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TheoryContent {
  summary: string;
  rules?: Array<Record<string, string>>;
  commonTrap?: {
    trapTitle: string;
    explanation: string;
    wrong: string;
    correct: string;
  };
}

interface SectionTheoryProps {
  title: string;
  content: TheoryContent;
}

export function SectionTheory({ title, content }: SectionTheoryProps) {
  const { summary, rules, commonTrap } = content;

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-none">
        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
          <BookOpen className="w-4 h-4" />
          <h4 className="text-sm font-semibold uppercase tracking-wider">{title}</h4>
        </div>
        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {summary}
        </p>
      </Card>

      {/* Rules Grid if available */}
      {rules && rules.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-none">
          <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pola & Aturan Penggunaan
            </h5>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rules.map((rule, idx) => {
              const keys = Object.keys(rule);
              return (
                <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm">
                  {keys.map((k) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                        {k}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {rule[k]}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Indonesian Common Trap Callout */}
      {commonTrap && (
        <Card className="rounded-xl border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-5 shadow-none">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <h5 className="text-sm font-bold text-red-900 dark:text-red-200">
              {commonTrap.trapTitle}
            </h5>
          </div>
          <p className="text-xs md:text-sm text-red-800/90 dark:text-red-300/90 leading-relaxed mb-4">
            {commonTrap.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-100/60 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 text-xs">
              <X className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-red-900 dark:text-red-200 block mb-0.5">
                  Salah Kaprah:
                </span>
                <span className="text-red-800 dark:text-red-300 line-through">
                  {commonTrap.wrong}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-0.5">
                  Baku & Tepat:
                </span>
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                  {commonTrap.correct}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
