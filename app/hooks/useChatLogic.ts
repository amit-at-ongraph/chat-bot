"use client";

import { DBMessage, ExtendedUIMessage } from "@/types/chat";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

export function useChatLogic() {
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
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
        console.log({ response });
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
    },
  });

  const loadChat = async (id: string) => {
    setChatId(id);
    chatIdRef.current = id;
    try {
      const res = await fetch(`/api/chats/${id}/messages`);
      if (!res.ok) throw new Error("Failed to load chat history");
      const data: DBMessage[] = await res.json();
      setMessages(
        data.map(
          (m): ExtendedUIMessage => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text", text: m.content }],
            createdAt: new Date(m.createdAt),
          }),
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorToast(error.message);
      } else {
        setErrorToast(String(error));
      }
    }
  };

  const startNewChat = () => {
    setChatId(null);
    chatIdRef.current = null;
    setMessages([]);
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
  };
}
