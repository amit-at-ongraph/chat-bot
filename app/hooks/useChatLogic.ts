"use client";

import { DBMessage, ExtendedUIMessage } from "@/types/chat";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

export function useChatLogic() {
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const chatIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const { messages, setMessages, status, stop, sendMessage, regenerate, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        const headers = new Headers(init?.headers);
        if (chatIdRef.current) {
          headers.set("x-chat-id", chatIdRef.current);
        }
        const response = await fetch(url, { ...init, headers });
        const id = response.headers.get("x-chat-id");
        if (id) {
          setChatId(id);
          chatIdRef.current = id;
        }
        return response;
      },
    }),
    onError: (error: Error): void => {
      setErrorToast(error?.message);
    },
    onData: (data: { type: string; data: unknown; id?: string }) => {
      console.log("Received data part from server:", data);
    },
    onFinish: () => {
      clearError();
      // Dispatch event to signal a new conversation was created and submitted
      if (chatIdRef.current) {
        window.dispatchEvent(new Event("new-chat-created"));
      }
    },
  });

  const loadChat = async (id: string) => {
    setChatId(id);
    chatIdRef.current = id;
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/${id}/messages?limit=20`);
      if (!res.ok) throw new Error("Failed to load chat history");
      const { data, nextCursor }: { data: DBMessage[]; nextCursor: string | null } =
        await res.json();
      setMessages(
        data.reverse().map(
          (m): ExtendedUIMessage => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text", text: m.content }],
            createdAt: new Date(m.createdAt),
          }),
        ),
      );
      if (data.length === 20) {
        setCursor(nextCursor);
        setHasMore(true);
      } else {
        setHasMore(false);
        setCursor(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorToast(error.message);
      } else {
        setErrorToast(String(error));
      }
    }
      setIsLoadingMessages(false);
  };

  const loadMore = async () => {
    if (!hasMore || !cursor || !chatId || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/messages?cursor=${cursor}&limit=20`);
      if (!res.ok) throw new Error("Failed to load more messages");
      const { data, nextCursor }: { data: DBMessage[]; nextCursor: string | null } =
        await res.json();
      setMessages((prev) => [
        ...data.reverse().map(
          (m) =>
            ({
              id: m.id,
              role: m.role as "user" | "assistant",
              parts: [{ type: "text", text: m.content }],
              createdAt: new Date(m.createdAt),
            }) as ExtendedUIMessage,
        ),
        ...prev,
      ]);
      if (data.length === 20) {
        setCursor(nextCursor);
      } else {
        setHasMore(false);
        setCursor(null);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const startNewChat = () => {
    setChatId(null);
    chatIdRef.current = null;
    setMessages([]);
    setHasMore(false);
    setCursor(null);
    setIsLoadingMore(false);
    setIsLoadingMessages(false);
    // Dispatch event to signal a new chat has been created
    window.dispatchEvent(new Event("new-chat-created"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({
        text: input,
      });
      setInput("");
    }
  };

  const handleRetry = () => {
    setErrorToast(null);
    regenerate();
  };

  const handleClearError = () => {
    clearError();
    setErrorToast(null);
  };

  return {
    messages,
    status,
    stop,
    input,
    setInput,
    errorToast,
    chatId,
    handleSubmit,
    handleRetry,
    handleClearError,
    loadChat,
    startNewChat,
    loadMore,
    hasMore,
    isLoadingMore,
    isLoadingMessages,
  };
}
