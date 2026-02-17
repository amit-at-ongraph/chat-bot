"use client";

import { CHAT_ACTIONS } from "@/lib/constants";
import React from "react";
import { ChatActionButton } from "./ui/ChatActionButton";
import { PromptInput } from "./ui/PromptInput";

import { useTranslation } from "../i18n/useTranslation";

interface ChatFooterProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleChatAction: (prompt: string) => void;
  status: string;
  stop: () => void;
  hasMessages: boolean;
}

export default function ChatFooter({
  input,
  setInput,
  handleSubmit,
  handleChatAction,
  status,
  stop,
  hasMessages,
}: ChatFooterProps) {
  const isStreaming = status === "submitted" || status === "streaming";
  const { t } = useTranslation();

  return (
    <>
      {/* Action Buttons Area - Only show when no messages */}
      {!hasMessages && (
        <div className="bg-selected shrink-0 px-4 py-6">
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 max-sm:grid-cols-2 sm:grid-cols-3">
            {CHAT_ACTIONS.map((action, idx: number) => (
              <ChatActionButton
                key={idx}
                icon={action.icon}
                label={t(`chat_actions.${action.id}_label`) || action.label}
                color={action.color}
                onClick={() => handleChatAction(t(`chat_actions.${action.id}_prompt`) || action.prompt)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="border-border-base bg-app-bg shrink-0 p-4">
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
