"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  description?: string;
}

export function AdminHeader({
  title = "Panel Administrator",
  description = "Pusat pengelolaan sistem dan kurikulum pembelajaran EDDY'S AI",
}: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Aktif</span>
        </span>

        <Badge variant="secondary" size="sm" className="hidden sm:inline-flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-blue-600" />
          <span>Admin Access</span>
        </Badge>
      </div>
    </header>
  );
}
