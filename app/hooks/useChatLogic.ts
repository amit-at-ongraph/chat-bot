"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export function useChatLogic() {
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error: Error): void => {
      setErrorToast(error?.message);
    },
    onData: (data: { type: string; data: unknown; id?: string }) => {
      console.log("Received data part from server:", data);
    },
    onFinish: () => {
      chat.clearError();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      chat.sendMessage({ text: input });
      setInput("");
    }
  };

  const handleRetry = () => {
    setErrorToast(null);
    chat.regenerate();
  };

  const handleClearError = () => {
    setErrorToast(null);
  };

  return {
    ...chat,
    input,
    setInput,
    errorToast,
    handleSubmit,
    handleRetry,
    handleClearError,
  };
}
