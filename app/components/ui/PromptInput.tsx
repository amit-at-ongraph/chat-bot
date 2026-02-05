"use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
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
  placeholder = "Ask a question...",
  maxHeight = 160,
}: PromptInputProps) => {
  const { theme } = useTheme();
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
    if (e.key === "Enter" && !e.shiftKey) {
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
      {/* <Dialog>
        <DialogTrigger asChild>
          <button
            type={"button"}
            className="hover:bg-border-base flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all active:scale-90"
          >
            <PlusIcon className="h-5 w-5" fill={theme === "dark" ? "rgb(24,24,24)" : "black"} />
          </button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>Select an option to add to your prompt.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input id="file" type="file" />
          </div>
        </DialogContent>
      </Dialog> */}

      <div
        className={`border-border-base bg-prompt-input shadow-outline relative w-full border transition-all duration-200 ${
          isMultiline ? "rounded-[28px]" : "rounded-4xl"
        }`}
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
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
