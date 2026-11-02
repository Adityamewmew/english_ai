"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ModulesGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex flex-col justify-between min-h-[300px] space-y-4"
        >
          {/* Card Top / Thumbnail Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
          </div>

          {/* Card Bottom CTA Skeleton */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

