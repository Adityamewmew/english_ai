import React from "react";
import { getSession } from "@/lib/session";
import { ChatView } from "@/features/chat";

export const metadata = {
  title: "AI Study Chat | EDDY'S ENGLISH",
  description: "Interactive English learning chat with Mr. Khoirul, powered by pedagogical RAG and LLM Guardrails.",
};

export default async function ChatPage() {
  const session = await getSession();

  return <ChatView userId={session?.userId} />;
}
