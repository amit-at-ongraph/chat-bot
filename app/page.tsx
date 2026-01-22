"use client";

import {
  Menu,
  Globe,
  Send,
  MessageSquare,
  Scale,
  AlertCircle,
  Home as HomeIcon,
  BookOpen,
  FileText,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function Home() {
  const actions = [
    {
      icon: <HomeIcon className="w-5 h-5 text-amber-900" />,
      label: "ICE at my door",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      label: "ICE at my work",
    },
    {
      icon: <Scale className="w-5 h-5 text-amber-600" />,
      label: "Find legal help",
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      label: "Friend taken by ICE",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
      label: "Protest prep guide",
    },
    {
      icon: <FileText className="w-5 h-5 text-red-400" />,
      label: "About ICE warrants",
    },
  ];

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans shadow-xl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-header-bg border-b border-zinc-300 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-zinc-700 cursor-pointer" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-zinc-800 tracking-tight">
              Immigration Action Guide
            </h1>
          </div>
        </div>
        <Globe className="w-6 h-6 text-zinc-700 cursor-pointer" />
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
        {/* <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300">
            <span className="text-red-500 font-bold text-lg">P</span>
          </div>
          <div className="bg-chat-bg rounded-2xl p-4 max-w-[85%] relative shadow-sm border border-zinc-100">
            <p className="text-[17px] leading-relaxed text-zinc-800">
              Instant help with legal rights, court issues, and urgent ICE
              support — in any language.
            </p>
            <span className="text-xs text-zinc-400 mt-2 block">18:13</span>
          </div>
          
        </div> */}
        <div className="max-w-2xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="flex w-full justify-end">
              {/* {message.role === "user" ? "User: " : "AI: "} */}
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <div key={index} className="flex gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300">
                      <span className="text-red-500 font-bold text-lg">P</span>
                    </div>
                    <div className="bg-chat-bg rounded-2xl p-4 max-w-[85%] relative shadow-sm border border-zinc-100">
                      <p className="text-[17px] leading-relaxed text-zinc-800">
                        {part.text}
                      </p>
                      <span className="text-xs text-zinc-400 mt-2 block">
                        18:13
                      </span>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Action Buttons Area */}
      <div className="bg-header-bg py-6 px-4">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {actions.map((action, idx) => (
            <button
              key={idx}
              className="flex items-center gap-3 bg-button-bg px-4 py-3 rounded-full border border-zinc-200 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 text-left active:scale-[0.98]"
            >
              {action.icon}
              <span className="text-[15px] font-medium text-zinc-700 whitespace-nowrap overflow-hidden text-ellipsis">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-zinc-200 sticky bottom-0">
        <div className="flex gap-3 items-center max-w-xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-6 pr-4 py-4 rounded-full border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-lg shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={status !== "ready"}
            onClick={handleSubmit}
            className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg hover:bg-accent/50 active:scale-90 transition-all cursor-pointer"
          >
            <Send className="w-7 h-7" />
          </button>
        </div>
      </footer>
    </div>
  );
}
