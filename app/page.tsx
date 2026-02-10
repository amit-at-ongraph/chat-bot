"use client";

import { useEffect } from "react";
import ChatFooter from "./components/ChatFooter";
import ErrorToast from "./components/ErrorToast";
import MessageList from "./components/MessageList";
import Welcome from "./components/Welcome";

import { useSession } from "next-auth/react";
import { useChatLogic } from "./hooks/useChatLogic";
import { useChatStore } from "./store/chatStore";

function HomeContent() {
  const { data: session } = useSession();
  const { skippedAuth, setSkippedAuth } = useChatStore();

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
    startNewChat,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useChatLogic();

  useEffect(() => {
    window.addEventListener("start-new-chat", startNewChat);
    return () => window.removeEventListener("start-new-chat", startNewChat);
  }, [startNewChat]);

  return (
    <>
      {/* Sign In Overlay */}
      {!session && !skippedAuth && <Welcome onSkip={() => setSkippedAuth(true)} />}

      <div className="flex h-full flex-col">
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
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
