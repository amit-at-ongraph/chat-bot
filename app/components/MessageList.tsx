"use client";

import { ExtendedUIMessage, MessagePart } from "@/types/chat";
import { Check, Copy } from "lucide-react";
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
  const initialScrollDone = React.useRef(false);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);

  const isStreaming = status === "submitted" || status === "streaming";

  // Auto-scroll logic
  React.useEffect(() => {
    if (messages.length === 0) return;

    const container = mainRef.current;
    if (!container) return;

    // We use a small timeout to ensure the DOM has updated with the new message/spacer
    const timer = setTimeout(() => {
      if (!initialScrollDone.current) {
        // Initial load: scroll to bottom instantly
        container.scrollTo({ top: container.scrollHeight, behavior: "instant" });
        initialScrollDone.current = true;
        return;
      }

      // Find the last user message
      const messageElements = container.querySelectorAll('[data-role="user"]');
      const lastUserElement = messageElements[messageElements.length - 1] as HTMLElement;

      if (lastUserElement) {
        // Calculate the target top position
        const targetTop = lastUserElement.offsetTop - 16;

        if (isStreaming) {
          // During streaming, keep it at top, but skip smooth if we are already close to prevent "bouncy" effect
          const threshold = 500;
          const behavior =
            Math.abs(container.scrollTop - targetTop) < threshold ? "instant" : "smooth";
        } else if (messages[messages.length - 1]?.role === "user") {
          // When user just submitted, scroll smoothly to their message at the top
          container.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [messages.length, isStreaming]);

  // Listen for scroll-to-bottom events
  React.useEffect(() => {
    const scrollHandler = () => {
      mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: "smooth" });
    };

    const submitHandler = () => {
      setHasSubmitted(true);
    };

    window.addEventListener("chat-scroll-to-bottom", scrollHandler as EventListener);
    window.addEventListener("chat-submitted", submitHandler as EventListener);

    return () => {
      window.removeEventListener("chat-scroll-to-bottom", scrollHandler as EventListener);
      window.removeEventListener("chat-submitted", submitHandler as EventListener);
    };
  }, []);

  React.useEffect(() => {
    initialScrollDone.current = false;
    setHasSubmitted(false);
  }, [chatId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop < 1600 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  return (
    <main
      ref={mainRef}
      style={{ overflowAnchor: "auto" }}
      className="bg-app-bg flex-1 space-y-6 overflow-y-auto p-4"
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
          const isLast = index === messages.length - 1;
          const isUser = message.role === "user";

          return (
            <div
              key={message.id + message.createdAt}
              ref={isLast ? lastMessageRef : null}
              data-role={message.role}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`mb-4 flex flex-col gap-3 ${isUser ? "max-w-[80%]" : "w-full"}`}>
                <div
                  className={`${isUser ? "border-border-light bg-border-light rounded-3xl border px-4 py-3" : ""} relative`}
                >
                  {message.parts?.map((part: MessagePart, pIndex: number) =>
                    part.type === "text" ? (
                      <div
                        key={pIndex}
                        className="text-text-secondary prose prose-slate max-w-none text-[16px] leading-relaxed"
                      >
                        <MemoizedMarkdown
                          text={part.text}
                          isStreaming={isLast && message.role === "assistant" && isStreaming}
                        />
                      </div>
                    ) : null,
                  )}

                  {message.role === "assistant" && !isStreaming && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-text-subtle block text-xs">
                        {new Date(message.createdAt || new Date()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => {
                          const text =
                            message.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") ||
                            "";
                          navigator.clipboard.writeText(text);
                          setCopiedId(message.id);
                          setTimeout(() => setCopiedId(null), 3000);
                        }}
                        className="text-text-muted hover:text-text-secondary transition-colors hover:cursor-pointer"
                        title="Copy response"
                      >
                        {copiedId === message.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
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

        {/* This spacer provides the necessary room to scroll the latest prompt to the top, only after the first message */}
        {hasSubmitted && <div className="h-[60vh]" aria-hidden="true" />}
      </div>
    </main>
  );
}
