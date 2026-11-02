"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentDashboardSkeleton() {
  return (
    <div className="w-full">
      {/* Mobile-Only Viewport (<lg) */}
      <div className="block lg:hidden px-3.5 py-4 space-y-3.5 max-w-md mx-auto">
        {/* Header Skeleton */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-4/5 rounded-md" />
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 min-h-[88px]"
            >
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="h-3.5 w-12 rounded-md" />
              <Skeleton className="h-2.5 w-16 rounded-md" />
            </div>
          ))}
        </div>

        {/* Active Unit Card Skeleton */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Activity Skeleton */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
          <Skeleton className="h-4 w-28 rounded-md" />
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-t border-slate-100">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-32 rounded-md" />
                <Skeleton className="h-2.5 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop-Only Viewport (lg+) */}
      <div className="hidden lg:flex p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex-row gap-8 items-start">
        {/* Left Column */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* Hero Banner Skeleton */}
          <div className="relative overflow-hidden rounded-[28px] p-8 bg-[#0D3B66]/90 border border-[#082542] min-h-[190px] flex flex-col justify-between">
            <div className="space-y-3 max-w-lg">
              <Skeleton className="h-5 w-48 rounded-full bg-white/20" />
              <Skeleton className="h-8 w-72 rounded-lg bg-white/25" />
              <Skeleton className="h-4 w-full rounded-md bg-white/15" />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Skeleton className="h-11 w-44 rounded-full bg-white/20" />
              <Skeleton className="h-11 w-36 rounded-full bg-white/15" />
            </div>
          </div>

          {/* 4 Progress Metric Cards Skeleton */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Section Skeleton */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-48 rounded-md" />
                      <Skeleton className="h-2.5 w-32 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[360px] xl:w-[390px] space-y-8 shrink-0">
          {/* Calendar Strip Skeleton */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Level Mastery Card Skeleton */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Skeleton className="w-16 h-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

