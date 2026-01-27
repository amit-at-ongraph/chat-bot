"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import ChatFooter from "./components/ChatFooter";
import ErrorToast from "./components/ErrorToast";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import Welcome from "./components/Welcome";

import { DBChat } from "@/types/chat";
import Sidebar from "./components/Sidebar";
import { useChatLogic } from "./hooks/useChatLogic";
import Loading from "./loading";

export default function Home() {
  const { data: session, status: authStatus } = useSession();
  const [skippedAuth, setSkippedAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userChats, setUserChats] = useState<DBChat[]>([]);

  const {
    messages,
    status,
    stop,
    input,
    setInput,
    errorToast,
    chatId,
    handleSubmit,
    handleRetry,
    handleClearError,
    loadChat,
    startNewChat,
  } = useChatLogic();

  const fetchChats = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const res = await fetch("/api/chats");
        if (res.ok) {
          const data = await res.json();
          setUserChats(data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    }
  }, [session]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChats();
  }, [fetchChats, chatId]);

  if (authStatus === "loading") {
    return <Loading />;
  }

  return (
    <div className="bg-app-bg text-text-main relative flex min-h-screen font-sans shadow-xl">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={userChats}
        currentChatId={chatId}
        onSelectChat={loadChat}
        onNewChat={startNewChat}
      />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-0"
        }`}
      >
        {/* Sign In Overlay */}
        {!session && !skippedAuth && <Welcome onSkip={() => setSkippedAuth(true)} />}

        {/* Header */}
        <Header
          session={session}
          skippedAuth={skippedAuth}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Chat Area */}
        <MessageList messages={messages} status={status} />

        {/* Footer Area */}
        <ChatFooter
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
        />

        {errorToast && (
          <ErrorToast error={errorToast} onRetry={handleRetry} onClear={handleClearError} />
        )}
      </div>
    </div>
  );
}
