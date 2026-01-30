"use client";

import { CHAT_ACTIONS } from "@/lib/constants";
import { ChatAction } from "@/types/chat";
import React from "react";
import { ChatActionButton } from "./ui/ChatActionButton";
import { PromptInput } from "./ui/PromptInput";

interface ChatFooterProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  status: string;
  stop: () => void;
  hasMessages: boolean;
}

export default function ChatFooter({
  input,
  setInput,
  handleSubmit,
  status,
  stop,
  hasMessages,
}: ChatFooterProps) {
  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <>
      {/* Action Buttons Area - Only show when no messages */}
      {!hasMessages && (
        <div className="bg-selected px-4 py-6">
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {CHAT_ACTIONS.map((action: ChatAction, idx: number) => (
              <ChatActionButton
                key={idx}
                icon={action.icon}
                label={action.label}
                color={action.color}
                onClick={() => setInput(action.prompt)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="border-border-base bg-app-bg sticky bottom-0 p-4">
        <form
          onSubmit={(e) => {
            handleSubmit(e);
            window.dispatchEvent(new CustomEvent("chat-submitted"));
          }}
          className="mx-auto flex max-w-xl items-center gap-3"
        >
          <div className="relative flex-1">
            <PromptInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onStop={stop}
              isStreaming={isStreaming}
            />
          </div>
        </form>
      </footer>
    </>
  );
}
