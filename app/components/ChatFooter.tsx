"use client";

import { CHAT_ACTIONS } from "@/lib/constants";
import { ChatAction } from "@/types/chat";
import { Send } from "lucide-react";
import React from "react";

interface ChatFooterProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  status: string;
  stop: () => void;
  hasMessages: boolean;
}

const MAX_HEIGHT = 160; // px (≈ 6–7 lines)

export default function ChatFooter({
  input,
  setInput,
  handleSubmit,
  status,
  stop,
  hasMessages,
}: ChatFooterProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [input]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
      // ask the message list to scroll to bottom so user's input remains visible
      try {
        window.dispatchEvent(new CustomEvent("chat-scroll-to-bottom"));
      } catch {
        // ignore for non-browser environments
      }
    }
  };

  return (
    <>
      {/* Action Buttons Area - Only show when no messages */}
      {!hasMessages && (
        <div className="bg-header-bg px-4 py-6">
          <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
            {CHAT_ACTIONS.map((action: ChatAction, idx: number) => (
              <button
                key={idx}
                onClick={() => setInput(action.prompt)}
                className="bg-action-btn-bg border-border-base hover:bg-app-bg flex cursor-pointer items-center gap-3 rounded-full border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-text-secondary overflow-hidden text-[15px] font-medium text-ellipsis whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="border-border-base bg-app-bg sticky bottom-0 border-t p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl items-center gap-3">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              placeholder="Ask a question..."
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              className="no-scrollbar focus:ring-primary/50 focus:border-primary border-border-base bg-input-bg w-full resize-none rounded-2xl border py-3 pr-4 pl-6 text-lg shadow-inner transition-all focus:ring-2 focus:outline-none"
            />

            {(status === "submitted" || status === "streaming") && (
              <div className="border-border-base bg-app-bg/80 absolute top-1/2 right-4 flex -translate-y-4 items-center rounded-full border px-2 py-1 shadow-sm backdrop-blur-sm">
                <button
                  type="button"
                  onClick={stop}
                  className="hover:text-primary text-text-muted flex cursor-pointer items-center gap-1.5 text-xs font-bold transition-colors"
                >
                  <div className="bg-primary/60 h-2.5 w-2.5 rounded-sm"></div>
                  Stop
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={status !== "ready"}
            className="bg-primary hover:bg-primary-hover flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all active:scale-90"
          >
            <Send className="text-app-bg h-7 w-7" />
          </button>
        </form>
      </footer>
    </>
  );
}
