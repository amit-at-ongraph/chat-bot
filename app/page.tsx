"use client";

import { useEffect } from "react";
import ChatFooter from "./components/ChatFooter";
import ErrorToast from "./components/ErrorToast";
import MessageList from "./components/MessageList";
import Welcome from "./components/Welcome";

import { useSession } from "next-auth/react";
import { useChatLogic } from "./hooks/useChatLogic";
import { useHasAnonymousCookie } from "./hooks/useHasAnonymousCookie";

function HomeContent() {
  const { data: session } = useSession();
  const hasAnonymousCookie = useHasAnonymousCookie();

  const {
    messages,
    status,
    stop,
    input,
    setInput,
    errorToast,
    chatId,
    handleSubmit,
    handleChatAction,
    handleRetry,
    handleClearError,
    startNewChat,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useChatLogic();

  useEffect(() => {
    window.addEventListener("start-new-chat", startNewChat);
    return () => window.removeEventListener("start-new-chat", startNewChat);
  }, [startNewChat]);

  // Show loading state while checking cookie
  if (hasAnonymousCookie === null) {
    return null; // or a loading spinner
  }

  return (
    <>
      {/* Sign In Overlay - Show welcome if no session and no anonymous cookie */}
      {!session && !hasAnonymousCookie && <Welcome />}

      <div className="flex h-full min-h-0 flex-col overflow-hidden">
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
          handleChatAction={handleChatAction}
          status={status}
          stop={stop}
          hasMessages={messages.length > 0}
        />

        {errorToast && (
          <ErrorToast error={errorToast} onRetry={handleRetry} onClear={handleClearError} />
        )}
      </div>
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
