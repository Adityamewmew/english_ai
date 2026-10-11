"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

export function StudentCalendarStrip() {
  // Real current date computation
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = monthNames[today.getMonth()];
  const year = today.getFullYear();

  // Get current week days (Mon -> Sun)
  const currentDayOfWeek = today.getDay(); // 0 is Sun
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + idx);
    return {
      day: label,
      date: d.getDate(),
      isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth(),
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 shadow-xs space-y-4">
      {/* Month Navigator with Real Current Month */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="w-8 h-8 rounded-full border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h4 className="font-black text-sm text-slate-900 dark:text-white">
          {monthName} {year}
        </h4>

        <button
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="w-8 h-8 rounded-full border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 7-Day Horizontal Row (Flex for bulletproof layout) */}
      <div className="flex items-center justify-between gap-1 text-center">
        {weekDays.map((d) => {
          const isSelected = selectedDate === d.date;

          return (
            <button
              key={`${d.day}-${d.date}`}
              type="button"
              onClick={(e) => {
                animeButtonPop(e.currentTarget as HTMLElement);
                setSelectedDate(d.date);
              }}
              style={isSelected ? { backgroundColor: "#c5cafc", color: "#0f172a" } : undefined}
              className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? "font-black shadow-xs scale-105"
                  : d.isToday
                  ? "border border-indigo-300 dark:border-indigo-600 font-bold text-slate-800 dark:text-slate-200"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-[10px] font-semibold opacity-75">{d.day}</span>
              <span className="text-xs sm:text-sm font-extrabold">{d.date}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
