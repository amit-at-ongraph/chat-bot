"use client";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { useChatStore } from "@/app/store/chatStore";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isCollapsed,
    setIsCollapsed,
    userChats,
    setUserChats,
    userChatsLoading,
    setUserChatsLoading,
    toggleSidebar,
    skippedAuth,
    isLoadingMessages,
  } = useChatStore();

  const fetchChats = useCallback(async () => {
    if (session?.user?.id) {
      try {
        setUserChatsLoading(true);
        const { data } = await axios.get("/api/chats");
        setUserChats(data);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setUserChatsLoading(false);
      }
    }
  }, [session, setUserChats, setUserChatsLoading]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, [setIsSidebarOpen]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen for new chat creation event to refetch the chat list
  useEffect(() => {
    const handleNewChatCreated = async () => {
      await fetchChats();
    };
    window.addEventListener("new-chat-created", handleNewChatCreated);
    return () => window.removeEventListener("new-chat-created", handleNewChatCreated);
  }, [fetchChats]);

  const handleNewChat = () => {
    router.push("/");
    // Delay to allow navigation before triggering new chat if needed
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("start-new-chat"));
    }, 100);
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await axios.delete(`/api/chats/${id}`);
      setUserChats(userChats.filter((chat) => chat.id !== id));
      if (currentChatId === id) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      await axios.patch(`/api/chats/${id}`, { title: newTitle });
      setUserChats(userChats.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)));
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  const handleSelectChat = (id: string) => {
    router.push(`/?chatId=${id}`);
  };

  const showSidebar = !!session;

  return (
    <div className="bg-app-bg text-text-main relative flex min-h-screen overflow-x-hidden font-sans shadow-xl">
      {showSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onClose={() => setIsSidebarOpen(false)}
          chats={userChats}
          currentChatId={currentChatId}
          isLoadingChats={userChatsLoading}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          selectedChatLoading={isLoadingMessages}
        />
      )}

      <div
        className={`flex h-screen flex-1 flex-col transition-all duration-300 ${
          showSidebar && isSidebarOpen ? (isCollapsed ? "lg:pl-16" : "lg:pl-72") : "lg:pl-0"
        }`}
      >
        <Header
          skippedAuth={skippedAuth}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
