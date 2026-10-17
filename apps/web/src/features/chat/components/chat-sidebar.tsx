"use client";

import React from "react";
import Link from "next/link";
import { Plus, MessageSquare, Trash2, ArrowLeft, X } from "lucide-react";
import { ChatSessionItem } from "../api/chat.api";

interface ChatSidebarProps {
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup menu sidebar"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden cursor-pointer"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-xl md:shadow-none transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0D3B66] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Portal</span>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              aria-label="Tutup sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button (Skeuomorphic Yellow Button) */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full btn-skeuo-yellow px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Chat Baru</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Riwayat Percakapan
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400 leading-relaxed">
              Belum ada riwayat percakapan. Mulai tanya Mr. Khoirul sekarang!
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSession(s.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all select-none ${
                    isActive
                      ? "bg-[#0D3B66]/10 text-[#0D3B66] font-bold border-l-4 border-[#0D3B66] shadow-xs"
                      : "text-slate-700 hover:bg-slate-100/80 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#0D3B66]" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate">{s.title || "Percakapan"}</span>
                  </div>

                  {/* Delete Action */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Hapus sesi percakapan ini?")) {
                        onDeleteSession(s.id);
                      }
                    }}
                    title="Hapus percakapan"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area with Mr. Khoirul Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-[#0D3B66] text-[#F4B41A] font-black text-xs flex items-center justify-center shrink-0">
              K
            </div>
            <div className="leading-tight truncate">
              <span className="block text-xs font-bold text-slate-800 truncate">
                Mr. Khoirul
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                Study Companion v2.0
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
