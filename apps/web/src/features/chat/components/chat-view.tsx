"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PanelLeft, Plus, ArrowLeft } from "lucide-react";
import { useChat } from "../hooks/use-chat";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessageBubble } from "./chat-message-item";
import { ChatInputDock } from "./chat-input-dock";

interface ChatViewProps {
  userId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ userId }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  const {
    sessions,
    activeSessionId,
    messages,
    input,
    setInput,
    isStreaming,
    streamingText,
    isLoadingHistory,
    createNewChat,
    selectSession,
    deleteChat,
    sendMessage,
    stopGenerating,
  } = useChat(userId);

  // Auto-scroll to bottom on new messages or streaming tokens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      {/* ChatGPT / Gemini Style Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteSession={deleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar (Skeuomorphic Touch) */}
        <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back to Portal (Prominent on Mobile) */}
            <Link
              href="/dashboard"
              className="p-2 text-slate-500 hover:text-[#0D3B66] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Toggle History Sidebar */}
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title="Riwayat Chat"
              className="p-2 text-slate-600 hover:text-[#0D3B66] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-[#0D3B66] tracking-tight truncate max-w-[150px] sm:max-w-md">
                  {activeSession ? activeSession.title : "Percakapan Baru"}
                </h1>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Mr. Khoirul • Online
              </p>
            </div>
          </div>

          {/* Quick New Chat Button on Topbar */}
          <button
            type="button"
            onClick={createNewChat}
            className="btn-skeuo-navy px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Percakapan Baru</span>
          </button>
        </header>

        {/* Message Feed Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-between">
            {isLoadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                <div className="w-8 h-8 border-3 border-[#0D3B66] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Memuat riwayat obrolan...</span>
              </div>
            ) : messages.length === 0 && !isStreaming ? (
              /* Minimalist Empty Greeting State with Mr. Khoirul */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 max-w-lg mx-auto">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-amber-50 border-3 border-[#F4B41A] shadow-[0_4px_14px_rgba(244,180,26,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center justify-center mb-5 overflow-hidden">
                  <Image
                    src="/illustrations/tutor/khoirul-waving.png"
                    alt="Mr. Khoirul Waving"
                    width={110}
                    height={110}
                    className="object-contain transform scale-110"
                    priority
                  />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#0D3B66] tracking-tight">
                  Halo! Saya Mr. Khoirul.
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm">
                  Ada materi atau pertanyaan bahasa Inggris yang ingin kamu diskusikan hari ini?
                </p>
              </div>
            ) : (
              /* Conversation Messages */
              <div className="flex-1 flex flex-col justify-end space-y-1">
                {messages.map((msg) => (
                  <ChatMessageBubble key={msg.id} message={msg} />
                ))}

                {/* Live Streaming Assistant Message */}
                {isStreaming && streamingText && (
                  <ChatMessageBubble
                    message={{
                      id: "streaming-temp",
                      sessionId: activeSessionId || "",
                      role: "assistant",
                      content: streamingText,
                      createdAt: new Date().toISOString(),
                    }}
                    isStreaming={true}
                  />
                )}

                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </main>

        {/* Tactile Input Dock */}
        <footer className="shrink-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pt-2">
          <ChatInputDock
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            isStreaming={isStreaming}
            onStop={stopGenerating}
            disabled={isLoadingHistory}
          />
        </footer>
      </div>
    </div>
  );
};
