"use client";

import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  PhoneCall,
  CheckCircle2,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Bell,
  Globe,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import {
  HighlightData,
  STUDY_SCHEDULE_DAYS,
  YOUR_PROGRESS_ITEMS,
  ProgressCardItem,
} from "../data/landing-data";

interface DashboardMockupFrameProps {
  highlightData: HighlightData;
  onSwitchHighlight: (section: string) => void;
  onTriggerVoiceDemo: () => void;
  isFlatMode: boolean;
}

export function DashboardMockupFrame({
  highlightData,
  onSwitchHighlight,
  onTriggerVoiceDemo,
  isFlatMode,
}: DashboardMockupFrameProps) {
  const sidebarNavItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      key: "chat",
      label: "AI Study Chat",
      icon: MessageSquare,
      isActive: false,
    },
    {
      key: "curriculum",
      label: "Curriculum Modules",
      icon: BookOpen,
      isActive: false,
    },
    {
      key: "voice",
      label: "AI Voice Call",
      icon: PhoneCall,
      isActive: false,
      hasDot: true,
    },
    {
      key: "cefr",
      label: "Placement Test",
      icon: CheckCircle2,
      isActive: false,
    },
    {
      key: "certificate",
      label: "CEFR Certificates",
      icon: Award,
      isActive: false,
    },
  ];

  const renderProgressIcon = (iconType: ProgressCardItem["iconType"]) => {
    switch (iconType) {
      case "book":
        return <BookOpen className="w-4 h-4 text-white" />;
      case "phone":
        return <PhoneCall className="w-4 h-4 text-[#0F172A]" />;
      case "award":
        return <Award className="w-4 h-4 text-white" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div
      id="dashboardMockup"
      style={{
        transform: isFlatMode
          ? "rotateX(0deg) rotateY(0deg) rotateZ(0deg)"
          : undefined,
      }}
      className="dashboard-3d-frame w-full lg:w-[88%] lg:ml-auto rounded-2xl p-2 sm:p-3.5 border border-white/90 relative z-10"
    >
      <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5 border-b border-[#E5E9F5]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EB8317]/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F3C623] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10375C]/40 inline-block" />
          <span className="ml-2 text-[11px] font-medium text-primary/50 hidden sm:inline">
            eddys.ai.id
          </span>
        </div>
      </div>

      <div className="bg-[#F4F6FF] rounded-xl overflow-hidden grid grid-cols-12 min-h-[420px] sm:min-h-[470px] text-primary border border-[#E5E9F5]">
        {/* SIDEBAR KIRI */}
        <aside className="hidden md:flex md:col-span-3 bg-white border-r border-[#E5E9F5] p-4 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E9F5]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-accent font-heading font-bold text-xs shadow-inner shrink-0">
                  E
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-heading font-extrabold tracking-tight leading-none whitespace-nowrap">
                    <span className="text-primary">EDDY&apos;S</span>{" "}
                    <span className="text-secondary">ENGLISH</span>
                  </div>
                  <div className="text-[8px] font-semibold tracking-wider text-primary/50 uppercase mt-1 whitespace-nowrap">
                    LEARNING PORTAL
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-5 h-5 rounded border border-[#E5E9F5] flex items-center justify-center text-primary/50 hover:bg-surface cursor-pointer shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <ul className="space-y-1.5 text-xs font-medium">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() =>
                        item.key === "voice"
                          ? onTriggerVoiceDemo()
                          : onSwitchHighlight(item.key)
                      }
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                        item.isActive
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-primary/75 hover:bg-surface"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            item.isActive
                              ? "text-accent"
                              : item.key === "voice"
                              ? "text-secondary"
                              : "text-primary/60"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.hasDot && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="pt-3 border-t border-[#E5E9F5] flex items-center gap-2 text-xs text-primary/60 px-2">
            <LogOut className="w-3.5 h-3.5 text-primary/50" />
            <span>Sign out</span>
          </div>
        </aside>

        {/* MAIN CONTENT & RIGHT PANEL */}
        <div className="col-span-12 md:col-span-9 p-4 sm:p-5 grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 flex items-center justify-between bg-white/80 px-3.5 py-2 rounded-xl border border-[#E5E9F5]">
            <div className="flex items-center gap-2 text-xs font-medium text-primary/70">
              <Menu className="w-3.5 h-3.5 text-primary/60" />
              <span>{highlightData.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-surface px-2.5 py-1 rounded-md whitespace-nowrap border border-[#E5E9F5]">
                <Globe className="w-3 h-3 text-primary/60" />
                <span>EN / ID</span>
              </div>
              <div className="w-7 h-7 rounded-full border border-[#E5E9F5] bg-white flex items-center justify-center relative shrink-0">
                <Bell className="w-3.5 h-3.5 text-primary/70" />
                <span className="w-2 h-2 rounded-full bg-secondary absolute top-1 right-1" />
              </div>
            </div>
          </div>

          {/* KOLOM TENGAH DASHBOARD */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div
              className="rounded-xl p-5 text-white relative overflow-hidden shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #164875 0%, #10375C 65%, #0b2641 100%)",
              }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/10 border border-white/15 text-[10px] font-bold tracking-wider uppercase text-accent mb-3">
                <BookOpen className="w-3 h-3 text-accent" />
                <span>PERSONALIZED TRACK • ENGLISH AI COMPANION</span>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-8">
                  <h2 className="font-heading font-extrabold text-xl sm:text-2xl leading-tight mb-2">
                    Welcome back,
                    <br />
                    Learner!
                  </h2>
                  <p className="text-white/80 text-[11px] sm:text-xs leading-relaxed mb-4">
                    Ready to boost your English fluency today? Continue your structured curriculum modules or practice real-time speaking with your AI Tutor.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSwitchHighlight("curriculum")}
                      className="px-4 py-2 rounded-2xl bg-secondary text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow hover:opacity-95 transition-opacity whitespace-nowrap cursor-pointer"
                      style={{ boxShadow: "0 3px 0 #b8620c" }}
                    >
                      <span>Continue Learning</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={onTriggerVoiceDemo}
                      className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium text-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Speaking Practice
                    </button>
                  </div>
                </div>

                <div className="hidden sm:flex sm:col-span-4 justify-center items-end">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/illustrations/hero-learning.svg"
                    alt="Online Learning Illustration"
                    className="w-28 h-28 lg:w-32 lg:h-32 object-contain drop-shadow-md select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* YOUR PROGRESS (Mapped Cleanly) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-heading font-extrabold text-xs tracking-wider uppercase text-primary">
                  YOUR PROGRESS
                </h3>
                <span className="text-[11px] text-primary/60">This Week</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {YOUR_PROGRESS_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl p-3 border ${item.borderColor} flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center text-xs font-bold shadow-xs`}>
                        {renderProgressIcon(item.iconType)}
                      </div>
                      <MoreHorizontal className="w-3.5 h-3.5 text-primary/40" />
                    </div>
                    <div className="text-sm font-heading font-bold text-primary">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-primary/60">{item.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN DASHBOARD */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-4 border border-[#E5E9F5]">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border border-[#E5E9F5] flex items-center justify-center text-primary/60 hover:bg-surface cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-heading font-extrabold text-xs tracking-wider uppercase text-primary whitespace-nowrap">
                  STUDY SCHEDULE
                </span>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border border-[#E5E9F5] flex items-center justify-center text-primary/60 hover:bg-surface cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center items-center">
                {STUDY_SCHEDULE_DAYS.map((day, idx) => (
                  <div
                    key={idx}
                    className={
                      day.isToday
                        ? "py-2 rounded-xl bg-primary text-white shadow-md"
                        : "py-1.5"
                    }
                    style={
                      day.isToday
                        ? { boxShadow: "0 4px 10px rgba(16,55,92,0.25)" }
                        : undefined
                    }
                  >
                    <div className={`text-[9px] ${day.isToday ? "text-white/80" : "text-primary/50"}`}>
                      {day.day}
                    </div>
                    <div className={`text-xs ${day.isToday ? "font-extrabold" : "font-bold text-primary"} mt-1`}>
                      {day.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-xs tracking-wider uppercase text-primary mb-2">
                ACTIVE LEARNING GOAL
              </h3>
              <div className="bg-white rounded-xl p-4 border border-[#E5E9F5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-2xl bg-primary text-white text-[10px] font-bold whitespace-nowrap">
                      CEFR B2
                    </span>
                    <span className="text-[11px] font-medium text-primary/70 whitespace-nowrap">
                      Cambridge Standard
                    </span>
                  </div>
                  <Award className="w-4 h-4 text-accent" />
                </div>
                <div className="font-heading font-bold text-xs sm:text-sm text-primary">
                  Core Daily Communication Track
                </div>
                <p className="text-[11px] text-primary/65 leading-relaxed">
                  Build natural sentence structure, practical vocabulary, and confident real-life speaking skills.
                </p>
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-primary mb-1">
                    <span>{highlightData.label}</span>
                    <span>{highlightData.percent}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: highlightData.percent }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-[#E5E9F5] mt-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-2xl bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                      UP NEXT
                    </span>
                    <span className="text-[10px] text-primary/45 font-medium whitespace-nowrap">
                      UNIT 06
                    </span>
                  </div>
                  <div className="font-heading font-bold text-xs text-primary">
                    Everyday Fluency &amp; Confident Small Talk
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
