"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { chatApi, ChatSessionItem, ChatMessageItem } from "../api/chat.api";

export function useChat(userId?: string) {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>("");
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef<string>("");

  // Load user sessions list on mount
  const refreshSessions = useCallback(async () => {
    try {
      const data = await chatApi.listSessions(userId);
      setSessions(data);
      return data;
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
      return [];
    }
  }, [userId]);

  useEffect(() => {
    refreshSessions().then((data) => {
      // If there are existing sessions, pick the latest one by default
      if (data.length > 0 && !activeSessionId) {
        selectSession(data[0].id);
      }
    });
  }, [refreshSessions]);

  // Select a session and load its message history
  const selectSession = useCallback(async (sessionId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingText("");
    }
    setActiveSessionId(sessionId);
    setIsLoadingHistory(true);
    try {
      const detail = await chatApi.getSessionDetail(sessionId);
      setMessages(detail.messages || []);
    } catch (err) {
      console.error("Failed to load session detail:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Create a new blank chat session
  const createNewChat = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingText("");
    }
    try {
      const newSession = await chatApi.createSession("Percakapan Baru", userId);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setInput("");
      return newSession.id;
    } catch (err) {
      console.error("Failed to create new session:", err);
      return null;
    }
  }, [userId]);

  // Delete a chat session
  const deleteChat = useCallback(
    async (sessionId: string) => {
      try {
        await chatApi.deleteSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          if (remaining.length > 0) {
            selectSession(remaining[0].id);
          } else {
            setActiveSessionId(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error("Failed to delete chat session:", err);
      }
    },
    [activeSessionId, sessions, selectSession]
  );

  // Send message and stream reply
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = await createNewChat();
      if (!targetSessionId) return;
    }

    // Optimistically add user message
    const optimisticUserMessage: ChatMessageItem = {
      id: "usr-" + Date.now(),
      sessionId: targetSessionId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");
    streamingTextRef.current = "";

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await chatApi.streamMessage(
      targetSessionId,
      trimmed,
      (token: string) => {
        streamingTextRef.current += token;
        setStreamingText(streamingTextRef.current);
      },
      () => {
        // Stream completed
        const finalReply = streamingTextRef.current;
        if (finalReply) {
          const assistantMsg: ChatMessageItem = {
            id: "asst-" + Date.now(),
            sessionId: targetSessionId!,
            role: "assistant",
            content: finalReply,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
        setIsStreaming(false);
        setStreamingText("");
        streamingTextRef.current = "";
        abortControllerRef.current = null;
        // Refresh sessions to get any updated title
        refreshSessions();
      },
      (err: any) => {
        console.error("Chat streaming error in hook:", err);
        setIsStreaming(false);
        setStreamingText("");
        streamingTextRef.current = "";
        abortControllerRef.current = null;
      },
      controller.signal
    );
  }, [input, isStreaming, activeSessionId, createNewChat, refreshSessions]);

  // Stop generating
  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      const accumulated = streamingTextRef.current;
      if (accumulated && activeSessionId) {
        const assistantMsg: ChatMessageItem = {
          id: "asst-" + Date.now(),
          sessionId: activeSessionId,
          role: "assistant",
          content: accumulated,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setIsStreaming(false);
      setStreamingText("");
      streamingTextRef.current = "";
      abortControllerRef.current = null;
    }
  }, [activeSessionId]);

  return {
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
  };
}
