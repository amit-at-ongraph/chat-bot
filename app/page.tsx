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
  X,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import Spinner from "./components/Spinner";
import { signIn, signOut, useSession } from "next-auth/react";
import TypingIndicator from "./components/TypingIndicator";

export default function Home() {
  const { data: session, status: authStatus } = useSession();
  const actions = [
    {
      icon: <HomeIcon className="h-5 w-5 text-amber-900" />,
      label: "ICE at my door",
    },
    {
      icon: <BookOpen className="h-5 w-5 text-blue-400" />,
      label: "ICE at my work",
    },
    {
      icon: <Scale className="h-5 w-5 text-amber-600" />,
      label: "Find legal help",
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      label: "Friend taken by ICE",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
      label: "Protest prep guide",
    },
    {
      icon: <FileText className="h-5 w-5 text-red-400" />,
      label: "About ICE warrants",
    },
  ];
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [skippedAuth, setSkippedAuth] = useState(false);

  const {
    messages,
    sendMessage,
    status,
    stop,
    regenerate: reload,
    clearError,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error: any): void => {
      setErrorToast(error?.message);
    },
    onData: (data) => {
      console.log("Received data part from server:", data);
    },
    onFinish: () => {
      clearError();
    },
  });
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  }

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-app-bg text-text-main relative flex min-h-screen flex-col font-sans shadow-xl">
      {/* Sign In Overlay */}
      {!session && !skippedAuth && (
        <div className="bg-app-bg/80 absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="border-border-light bg-app-bg w-full max-w-sm space-y-6 rounded-3xl border p-8 text-center shadow-2xl">
            <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
              <Globe className="text-primary h-10 w-10" />
            </div>
            <div>
              <h2 className="text-text-main text-2xl font-bold">Welcome</h2>
              <p className="text-text-muted mt-2">
                Please sign in to access the Immigration Action Guide.
              </p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => signIn("google")}
                className="bg-text-main text-app-bg hover:bg-text-secondary flex w-full items-center justify-center gap-3 rounded-full py-4 font-bold transition-all active:scale-95"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={() => setSkippedAuth(true)}
                className="bg-border-light text-text-secondary hover:bg-border-base w-full rounded-full py-3 font-semibold transition-all active:scale-95"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-header-bg border-border-dark sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Menu className="text-text-secondary h-6 w-6 cursor-pointer" />
          <div className="flex items-center gap-2">
            <div className="border-border-base bg-app-bg flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-sm">
              <img
                src={
                  session?.user?.image ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
                alt="logo"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-text-main text-xl font-bold tracking-tight">
              Immigration Action Guide
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-text-muted hover:text-error text-xs font-bold transition-colors"
            >
              Sign Out
            </button>
          ) : skippedAuth ? (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="bg-text-main text-app-bg hover:bg-text-secondary rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
            >
              Sign In
            </button>
          ) : null}
          <Globe className="text-text-secondary h-6 w-6 cursor-pointer" />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 space-y-6 overflow-y-auto bg-white p-4 shadow-inner">
        <div className="mx-auto max-w-2xl">
          {messages.map((message) => (
            <div key={message.id} className="flex w-full justify-end">
              {/* {message.role === "user" ? "User: " : "AI: "} */}
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <div key={index} className="mb-2 flex gap-3">
                    <div className="border-border-dark bg-border-base flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                      <span className="text-primary text-lg font-bold">P</span>
                    </div>
                    <div className="border-border-light relative max-w-[85%] rounded-2xl border p-4 shadow-sm">
                      <p className="text-text-secondary text-[17px] leading-relaxed">
                        {part.text}
                      </p>
                      <span className="text-text-subtle mt-2 block text-xs">
                        18:13
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

      {/* Action Buttons Area */}
      <div className="bg-header-bg px-4 py-6">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => setInput(action.label)}
              className="bg-action-btn-bg border-border-base hover:bg-app-bg flex cursor-pointer items-center gap-3 rounded-full border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              {action.icon}
              <span className="text-text-secondary overflow-hidden text-[15px] font-medium text-ellipsis whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <footer className="border-border-base bg-app-bg sticky bottom-0 border-t p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-xl items-center gap-3"
        >
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
                  onClick={() => stop()}
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

      {errorToast && (
        <div className="border-error/20 bg-error-bg text-error-text fixed top-4 right-4 z-50 flex max-w-md items-center gap-3 rounded-lg border px-4 py-3 shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="flex-1 text-sm">{errorToast}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setErrorToast(null);
                reload();
              }}
              className="hover:text-error cursor-pointer text-xs font-semibold underline transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => setErrorToast(null)}
              className="hover:bg-error/10 absolute top-2 right-2 cursor-pointer rounded-full p-1 transition-colors"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
