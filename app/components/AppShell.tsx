"use client";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { useChatStore } from "@/app/store/chatStore";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");
  const [isDesktop, setIsDesktop] = useState(false);

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

  const fetchChats = useCallback(
    async (options?: { silent?: boolean }) => {
      if (session?.user?.id) {
        try {
          if (!options?.silent) {
            setUserChatsLoading(true);
          }
          const { data } = await axios.get("/api/chats");
          setUserChats(data);
        } catch (error) {
          console.error("Failed to fetch chats:", error);
        } finally {
          setUserChatsLoading(false);
        }
      }
    },
    [session, setUserChats, setUserChatsLoading],
  );

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setIsDesktop(isLargeScreen);
      if (isLargeScreen) {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen for new chat creation event to refetch the chat list
  useEffect(() => {
    const handleNewChatCreated = async () => {
      await fetchChats({ silent: true });
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
      handleNewChat();
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

  if (authStatus === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const mainContentOffsetClasses =
    showSidebar && isSidebarOpen
      ? isCollapsed
        ? "lg:ml-16 lg:w-[calc(100%-4rem)]"
        : "lg:ml-72 lg:w-[calc(100%-18rem)]"
      : "lg:ml-0 lg:w-full";

  return (
    <div className="bg-app-bg text-text-main relative flex min-h-screen overflow-x-hidden font-sans shadow-xl">
      {showSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          isDesktop={isDesktop}
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

      <div className="flex h-screen flex-1 flex-col overflow-hidden transition-all duration-300">
        <Header
          skippedAuth={skippedAuth}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          mainContentOffsetClasses={mainContentOffsetClasses}
        />

        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ${
            mainContentOffsetClasses
          } `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
