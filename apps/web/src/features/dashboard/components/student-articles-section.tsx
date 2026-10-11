"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

export function StudentArticlesSection() {
  const articles = [
    {
      id: "art-1",
      title: "Think Starter Framework: 12 Core Countries, Nationalities & Contractions",
      tag: "A1.1 Curriculum",
      readTime: "5 min",
      imgSrc: "/illustrations/article-vocab.svg",
      bgColor: "#fce7f3",
      href: "/modules/A1.1-M01",
    },
    {
      id: "art-2",
      title: "Overcoming Spoken English Anxiety: Building Natural Voice Reflexes",
      tag: "Speaking Lab",
      readTime: "3 min",
      imgSrc: "/illustrations/article-guide.svg",
      bgColor: "#e0e7ff",
      href: "/call",
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Curated learning guides
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={art.href}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[26px] overflow-hidden p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer"
          >
            {/* Illustration Frame from Internet SVG */}
            <div
              style={{ backgroundColor: art.bgColor }}
              className="w-full h-36 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 p-2 group-hover:scale-[1.01] transition-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={art.imgSrc}
                alt={art.title}
                className="w-full h-full object-contain drop-shadow-2xs"
              />
            </div>

            {/* Content & Metadata */}
            <div className="px-1.5 pb-1.5 space-y-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {art.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{art.tag}</span>
                  <span>•</span>
                  <span>{art.readTime}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
