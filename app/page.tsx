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
  const [userChatsLoading, setUserChatsLoading] = useState(false);

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
    loadMore,
    hasMore,
    isLoadingMore,
    isLoadingMessages,
  } = useChatLogic();

  const fetchChats = useCallback(async () => {
    if (session?.user?.id) {
      try {
        setUserChatsLoading(true);
        const res = await fetch("/api/chats");
        if (res.ok) {
          const data = await res.json();
          setUserChats(data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setUserChatsLoading(false);
      }
    }
  }, [session]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen for new chat creation event to refetch the chat list
  useEffect(() => {
    const handleNewChat = async () => {
      await fetchChats();
    };
    window.addEventListener("new-chat-created", handleNewChat);
    return () => window.removeEventListener("new-chat-created", handleNewChat);
  }, [fetchChats]);

  if (authStatus === "loading") {
    return <Loading />;
  }

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (chatId === id) {
          startNewChat();
        }
        setUserChats((prev) => prev.filter((chat) => chat.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setUserChats((prev) =>
          prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
        );
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  return (
    <div className="bg-app-bg text-text-main relative flex min-h-screen overflow-x-hidden font-sans shadow-xl">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={userChats}
        currentChatId={chatId}
        isLoadingChats={userChatsLoading}
        selectedChatLoading={isLoadingMessages}
        onSelectChat={loadChat}
        onNewChat={startNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      <div
        className={`flex h-screen flex-1 flex-col transition-all duration-300 ${
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
        <MessageList
          messages={messages}
          status={status}
          loadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          chatId={chatId}
        />

        {/* Footer Area */}
        <ChatFooter
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          hasMessages={messages.length > 0}
        />

        {errorToast && (
          <ErrorToast error={errorToast} onRetry={handleRetry} onClear={handleClearError} />
        )}
      </div>
    </div>
  );
}
