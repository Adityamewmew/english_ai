import { getApiUrl } from "@/lib/api-client";

export interface ChatSessionItem {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageItem {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    guardrailTriggered?: boolean;
    guardrailBlocked?: boolean;
    violation?: string;
  } | null;
  createdAt: string;
}

export interface ChatSessionDetail {
  session: ChatSessionItem;
  messages: ChatMessageItem[];
}

export const chatApi = {
  listSessions: async (userId?: string): Promise<ChatSessionItem[]> => {
    const url = getApiUrl(`/api/chat/sessions${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`);
    const res = await fetch(url, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch conversations list");
    const json = await res.json();
    return json.data || [];
  },

  createSession: async (title?: string, userId?: string): Promise<ChatSessionItem> => {
    const url = getApiUrl("/api/chat/sessions");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, userId }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to create new conversation");
    const json = await res.json();
    return json.data;
  },

  getSessionDetail: async (sessionId: string): Promise<ChatSessionDetail> => {
    const url = getApiUrl(`/api/chat/sessions/${sessionId}`);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load conversation details");
    const json = await res.json();
    return json.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    const url = getApiUrl(`/api/chat/sessions/${sessionId}`);
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
  },

  streamMessage: async (
    sessionId: string,
    message: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: any) => void,
    signal?: AbortSignal,
    clientMessageId?: string
  ): Promise<void> => {
    const url = getApiUrl(`/api/chat/sessions/${sessionId}/stream`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, clientMessageId }),
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.body) {
        throw new Error("Stream response body is empty");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const lines = block.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const jsonStr = trimmed.replace(/^data:\s*/, "");
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "token" && typeof parsed.text === "string") {
                onToken(parsed.text);
              } else if (parsed.type === "done") {
                onDone();
              } else if (parsed.type === "error") {
                onError(new Error(parsed.error || parsed.message || "Streaming error"));
              }
            } catch {
              if (jsonStr) onToken(jsonStr);
            }
          }
        }
      }
      onDone();
    } catch (err: any) {
      if (err.name === "AbortError") {
        onDone();
        return;
      }
      onError(err);
    }
  },
};
