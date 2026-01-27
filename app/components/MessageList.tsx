"use client";

import { ExtendedUIMessage, MessagePart } from "@/types/chat";
import React from "react";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: ExtendedUIMessage[];
  status: string;
}

export default function MessageList({ messages, status }: MessageListProps) {
  return (
    <main className="bg-app-bg flex-1 space-y-6 overflow-y-auto p-4 shadow-inner">
      <div className="mx-auto max-w-2xl">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`mb-4 flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar - Only for User */}
              {message.role === "user" && (
                <div className="border-border-dark bg-border-base flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                  <span className="text-primary text-lg font-bold">P</span>
                </div>
              )}

              {/* Message Content */}
              <div className="border-border-light relative rounded-2xl border p-4 shadow-sm">
                {message.parts?.map((part: MessagePart, index: number) =>
                  part.type === "text" ? (
                    <React.Fragment key={index}>
                      <p className="text-text-secondary text-[17px] leading-relaxed">{part.text}</p>
                    </React.Fragment>
                  ) : null,
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
      </div>
    </main>
  );
}
