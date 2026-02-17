"use client";

import { useTranslation } from "@/app/i18n/useTranslation";
import { ArrowUp, SquareIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
  maxHeight?: number;
}

export const PromptInput = ({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming = false,
  placeholder,
  maxHeight = 160,
}: PromptInputProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const defaultPlaceholder = t("common.ask_question");
  const finalPlaceholder = placeholder || defaultPlaceholder;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  const updateHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    setIsMultiline(scrollHeight > 60);
  }, [maxHeight]);

  useEffect(() => {
    updateHeight();
  }, [value, updateHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Detect touch device (phone/tablet) vs pointer device (desktop/laptop).
    // On touch devices, Enter inserts a newline; user must tap the send button.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (e.key === "Enter" && !e.shiftKey && !isTouchDevice) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
      try {
        window.dispatchEvent(new CustomEvent("chat-scroll-to-bottom"));
        window.dispatchEvent(new CustomEvent("chat-submitted"));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`border-border-base bg-prompt-input shadow-outline relative w-full border transition-all duration-200 ${
          isMultiline ? "rounded-[28px]" : "rounded-4xl"
        }`}
      >
        <textarea
          ref={textareaRef}
          placeholder={finalPlaceholder}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="no-scrollbar w-full resize-none border border-transparent bg-transparent py-3 pr-14 pl-6 text-[16px] transition-all duration-300 focus:outline-none"
        />

        <button
          type={isStreaming ? "button" : "submit"}
          className="bg-primary hover:bg-primary-hover absolute right-3 bottom-0 flex h-10 w-10 -translate-y-2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all active:scale-90"
          onClick={isStreaming ? onStop : undefined}
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
    </div>
  );
};
