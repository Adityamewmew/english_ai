import React from "react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  defaultValue?: string;
  defaultRole?: string;
  actionUrl?: string;
}

export function SearchBar({
  defaultValue = "",
  defaultRole = "all",
  actionUrl = "/users",
}: SearchBarProps) {
  return (
    <form action={actionUrl} method="GET" className="flex flex-col sm:flex-row gap-3 items-center w-full">
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          name="keywords"
          defaultValue={defaultValue}
          placeholder="Cari nama atau email pengguna..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <select
          name="role"
          defaultValue={defaultRole}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
        >
          <option value="all">Semua Role</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <Button type="submit" variant="primary" size="md">
          Filter
        </Button>

        {(defaultValue || (defaultRole && defaultRole !== "all")) && (
          <a
            href={actionUrl}
            className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            Reset
          </a>
        )}
      </div>
    </form>
  );
}
