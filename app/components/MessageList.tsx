"use client";

import { CustomMessage, MessagePart } from "@/types/chat";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: CustomMessage[];
  status: string;
}

export default function MessageList({ messages, status }: MessageListProps) {
  return (
    <main className="flex-1 space-y-6 overflow-y-auto bg-white p-4 shadow-inner">
      <div className="mx-auto max-w-2xl">
        {messages.map((message) => (
          <div key={message.id} className="flex w-full justify-end">
            {message.parts?.map((part: MessagePart, index: number) =>
              part.type === "text" ? (
                <div key={index} className="mb-2 flex gap-3">
                  <div className="border-border-dark bg-border-base flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                    <span className="text-primary text-lg font-bold">P</span>
                  </div>
                  <div className="border-border-light relative max-w-[85%] rounded-2xl border p-4 shadow-sm">
                    <p className="text-text-secondary text-[17px] leading-relaxed">{part.text}</p>
                    <span className="text-text-subtle mt-2 block text-xs">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ) : null,
            )}
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
