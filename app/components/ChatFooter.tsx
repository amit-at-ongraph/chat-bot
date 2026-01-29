"use client";

import { CHAT_ACTIONS } from "@/lib/constants";
import { ChatAction } from "@/types/chat";
import { ArrowUp, SquareIcon } from "lucide-react";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [isMultiline, setIsMultiline] = React.useState(false);

  const updateHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
    setIsMultiline(scrollHeight > 60);
  }, []);

  React.useEffect(() => {
    updateHeight();
  }, [input, updateHeight]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    updateHeight();
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

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <>
      {/* Action Buttons Area - Only show when no messages */}
      {!hasMessages && (
        <div className="bg-header-bg px-4 py-6">
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {CHAT_ACTIONS.map((action: ChatAction, idx: number) => (
              <button
                key={idx}
                onClick={() => setInput(action.prompt)}
                className="bg-action-btn-bg border-border-base hover:bg-app-bg flex cursor-pointer items-center gap-3 rounded-full border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-text-secondary overflow-hidden text-[12px] font-medium text-ellipsis whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="border-border-base bg-app-bg sticky bottom-0 p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl items-center gap-3">
          <div className="relative flex-1">
            <div
              className={`border-border-base bg-prompt-input shadow-outline relative border ${
                isMultiline ? "rounded-[28px]" : "rounded-[32px]"
              }`}
            >
              <textarea
                ref={textareaRef}
                placeholder="Ask a question..."
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                className={`no-scrollbar w-full resize-none border border-transparent py-3 pr-14 pl-6 text-[16px] transition-all duration-300 focus:outline-none`}
              />

              <button
                type={isStreaming ? "button" : "submit"}
                className="bg-primary hover:bg-primary-hover absolute right-3 bottom-0 flex h-10 w-10 -translate-y-2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all active:scale-90"
                onClick={isStreaming ? stop : undefined}
              >
                {isStreaming ? (
                  <SquareIcon
                    fill={theme === "dark" ? "rgb(24,24,24)" : "white"}
                    className="text-app-bg h-4 w-4"
                  />
                ) : (
                  <ArrowUp className="text-app-bg h-5 w-5" />
                )}
              </button>
            </div>

            {/* {(status === "submitted" || status === "streaming") && (
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
            )} */}
          </div>
        </form>
      </footer>
    </>
  );
}
