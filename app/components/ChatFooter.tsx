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
}

export default function ChatFooter({
  input,
  setInput,
  handleSubmit,
  status,
  stop,
}: ChatFooterProps) {
  return (
    <>
      {/* Action Buttons Area */}
      <div className="bg-header-bg px-4 py-6">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          {CHAT_ACTIONS.map((action: ChatAction, idx: number) => (
            <button
              key={idx}
              onClick={() => setInput(action.label)}
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

      {/* Input Area */}
      <footer className="border-border-base bg-app-bg sticky bottom-0 border-t p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="focus:ring-primary/50 focus:border-primary border-border-base bg-input-bg w-full rounded-full border py-4 pr-4 pl-6 text-lg shadow-inner transition-all focus:ring-2 focus:outline-none"
            />
            {(status === "submitted" || status === "streaming") && (
              <div className="border-border-base bg-app-bg/80 absolute top-1/2 right-4 flex -translate-y-1/2 items-center rounded-full border px-2 py-1 shadow-sm backdrop-blur-sm">
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
