"use client";

import { ExtendedUIMessage, MessagePart } from "@/types/chat";
import { Copy } from "lucide-react";
import React from "react";
import MemoizedMarkdown from "./Markdown";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: ExtendedUIMessage[];
  status: string;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  chatId: string | null;
}

export default function MessageList({
  messages,
  status,
  loadMore,
  hasMore,
  isLoadingMore,
  chatId,
}: MessageListProps) {
  const lastMessageRef = React.useRef<HTMLDivElement>(null);
  const mainRef = React.useRef<HTMLElement>(null);
  // 1. Track if the initial scroll has happened
  const initialScrollDone = React.useRef(false);

  React.useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // Scroll if:
    // A) First time loading
    // B) The last message was sent by the user (immediate feedback)
    // C) The assistant is currently typing/streaming
    if (!initialScrollDone.current || (lastMessage.role === "user" && status === "streaming")) {
      mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: "instant" });

      if (!initialScrollDone.current) {
        initialScrollDone.current = true;
      }
    }
  }, [messages, isLoadingMore, status]);

  // listen for scroll-to-bottom events dispatched from ChatFooter (when user types)
  React.useEffect(() => {
    const handler = () => {
      mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: "smooth" });
    };
    window.addEventListener("chat-scroll-to-bottom", handler as EventListener);
    return () => window.removeEventListener("chat-scroll-to-bottom", handler as EventListener);
  }, []);

  React.useEffect(() => {
    initialScrollDone.current = false;
  }, [chatId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    if (target.scrollTop < 300 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  return (
    <main
      ref={mainRef}
      style={{ overflowAnchor: "auto" }} // Helps keep scroll position stable during history loads
      className="bg-app-bg flex-1 space-y-6 overflow-y-auto p-4 shadow-inner"
      onScroll={handleScroll}
    >
      <div className="mx-auto max-w-3xl">
        {isLoadingMore && (
          <div className="py-4 text-center">
            <div className="border-primary inline-block h-6 w-6 animate-spin rounded-full border-b-2"></div>
            <p className="text-text-secondary mt-2">Loading more messages...</p>
          </div>
        )}
        {messages.map((message, index) => {
          // const isLastMessage = index === messages.length - 1;
          // const isAssistantStreaming = message.role === "assistant" && status === "streaming";

          return (
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
                      <div
                        key={index}
                        className="text-text-secondary prose prose-slate max-w-none text-[17px] leading-relaxed"
                      >
                        <MemoizedMarkdown
                          text={part.text}
                          // isStreaming={isLastMessage && isAssistantStreaming}
                          isStreaming={false}
                        />
                      </div>
                    ) : null,
                  )}

                  {message.role === "assistant" && (
                    <button
                      onClick={() => {
                        const text =
                          message.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") ||
                          "";
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
          );
        })}

        {(status === "submitted" || status === "streaming") && (
          <div className="mb-2 flex gap-3">
            <TypingIndicator />
          </div>
        )}

        {/* Transparent area to adjust height of last chat to top */}
        <div className="h-[40vh]"></div>
      </div>
    </main>
  );
}
