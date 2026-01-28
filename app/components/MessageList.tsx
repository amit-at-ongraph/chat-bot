"use client";

import { ExtendedUIMessage, MessagePart } from "@/types/chat";
import { Copy } from "lucide-react";
import React from "react";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: ExtendedUIMessage[];
  status: string;
}

export default function MessageList({ messages, status }: MessageListProps) {
  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  return (
    <main className="bg-app-bg flex-1 space-y-6 overflow-y-auto p-4 shadow-inner">
      <div className="mx-auto max-w-2xl">
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`mb-4 flex flex-row gap-3 ${message.role === "user" ? "max-w-[80%]" : ""}`}
            >
              {/* Avatar - Only for User */}
              {message.role === "user" && (
                <div className="border-border-dark bg-border-base flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                  <span className="text-primary text-lg font-bold">P</span>
                </div>
              )}

              {/* Message Content */}
              <div className="border-border-light relative rounded-2xl border p-4 shadow-xs">
                {message.parts?.map((part: MessagePart, index: number) =>
                  part.type === "text" ? (
                    <React.Fragment key={index}>
                      <p className="text-text-secondary text-[17px] leading-relaxed whitespace-pre-wrap">
                        {part.text}
                      </p>
                    </React.Fragment>
                  ) : null,
                )}
                {message.role === "assistant" && (
                  <button
                    onClick={() => {
                      const text =
                        message.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") || "";
                      navigator.clipboard.writeText(text);
                    }}
                    className="text-text-muted hover:text-text-secondary absolute top-2 right-2 transition-colors"
                    title="Copy response"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
                <span className="text-text-subtle mt-2 block text-xs">
                  {new Date(message.createdAt || new Date()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {(status === "submitted" || status === "streaming") && (
          <div className="mb-2 flex gap-3">
            <TypingIndicator />
          </div>
        )}

        {/* Transparent area to adjust height of last chat to top */}
        <div className="h-[61vh]"></div>
      </div>
    </main>
  );
}
