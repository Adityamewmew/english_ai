"use client";

import React from "react";
import Image from "next/image";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { ChatMessageItem as IChatMessageItem } from "../api/chat.api";
import { MarkdownRenderer } from "./markdown-renderer";

interface ChatMessageBubbleProps {
  message: IChatMessageItem;
  isStreaming?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isStreaming = false,
}) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end my-3.5 pl-10">
        <div className="bg-[#0D3B66] text-white rounded-2xl rounded-tr-xs px-4 sm:px-5 py-3 sm:py-3.5 max-w-[88%] sm:max-w-[75%] border-b border-[#082542] shadow-[0_2px_4px_rgba(13,59,102,0.18),inset_0_1px_0_rgba(255,255,255,0.15)] leading-relaxed text-sm sm:text-base">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  const isGuardrailBlocked = message.metadata?.guardrailBlocked;

  return (
    <div className="flex items-start gap-3 my-4 pr-6 sm:pr-12">
      {/* Mr. Khoirul Avatar */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 border-2 border-[#F4B41A] shadow-[0_2px_4px_rgba(244,180,26,0.25)] flex items-center justify-center shrink-0 overflow-hidden relative mt-1">
        <Image
          src={isStreaming ? "/illustrations/tutor/khoirul-talking.png" : "/illustrations/tutor/khoirul-idle.png"}
          alt="Mr. Khoirul"
          width={44}
          height={44}
          className="object-contain transform scale-110"
        />
      </div>

      {/* Mr. Khoirul Message Card (Skeuomorphic) */}
      <div className="bg-white border border-slate-200/90 shadow-[0_2px_6px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] rounded-2xl rounded-tl-xs p-4 sm:p-5 max-w-[90%] sm:max-w-[82%] relative">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0D3B66] text-sm sm:text-base tracking-tight">
              Mr. Khoirul
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4B41A]/20 text-[#92400E] border border-[#F4B41A]/40">
              AI Tutor
            </span>
          </div>

          {/* Guardrail Status Badge */}
          {isGuardrailBlocked ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
              <ShieldAlert className="w-3 h-3 text-red-600" />
              <span>Guardrail Shield</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>RAG & Guardrail Active</span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="text-slate-800 break-words">
          <MarkdownRenderer content={message.content} />
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-[#F4B41A] animate-pulse rounded-xs align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};
