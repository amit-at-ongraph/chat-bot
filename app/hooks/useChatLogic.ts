"use client";

import { DBMessage, ExtendedUIMessage } from "@/types/chat";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useLanguageStore } from "../store/languageStore";

export function useChatLogic() {
  const searchParams = useSearchParams();
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { isLoadingMessages, setIsLoadingMessages } = useChatStore();
  const chatIdRef = useRef<string | null>(null);
  const { language } = useLanguageStore();
  const languageRef = useRef(language);

  // Keep refs in sync with state
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const { messages, setMessages, status, stop, sendMessage, regenerate, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        const headers = new Headers(init?.headers);
        if (chatIdRef.current) {
          headers.set("x-chat-id", chatIdRef.current);
        }
        headers.set("x-language", languageRef.current);
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

  const loadChat = useCallback(
    async (id: string) => {
      setChatId(id);
      chatIdRef.current = id;
      setIsLoadingMessages(true);
      try {
        const { data: response } = await axios.get<{
          data: DBMessage[];
          nextCursor: string | null;
        }>(`/api/chats/${id}/messages?limit=20`);
        const { data, nextCursor } = response;
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
    },
    [setMessages, setIsLoadingMessages],
  );

  const loadMore = async () => {
    if (!hasMore || !cursor || !chatId || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { data: response } = await axios.get<{
        data: DBMessage[];
        nextCursor: string | null;
      }>(`/api/chats/${chatId}/messages?cursor=${cursor}&limit=20`);
      const { data, nextCursor } = response;
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

  const startNewChat = useCallback(() => {
    setChatId(null);
    chatIdRef.current = null;
    setMessages([]);
    setHasMore(false);
    setCursor(null);
    setIsLoadingMore(false);
    setIsLoadingMessages(false);
    // Dispatch event to signal a new chat has been created
    window.dispatchEvent(new Event("new-chat-created"));
  }, [setMessages, setIsLoadingMessages]);

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

  useEffect(() => {
    const urlChatId = searchParams.get("chatId");
    if (urlChatId) {
      if (urlChatId !== chatIdRef.current) {
        loadChat(urlChatId);
      }
    } else {
      if (chatIdRef.current) {
        startNewChat();
      }
    }
  }, [searchParams, loadChat, startNewChat]);

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
