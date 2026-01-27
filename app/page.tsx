"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ChatFooter from "./components/ChatFooter";
import ErrorToast from "./components/ErrorToast";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import Welcome from "./components/Welcome";

import Sidebar from "./components/Sidebar";
import { useChatLogic } from "./hooks/useChatLogic";
import Loading from "./loading";

export default function Home() {
  const { data: session, status: authStatus } = useSession();
  const [skippedAuth, setSkippedAuth] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const {
    messages,
    status,
    stop,
    input,
    setInput,
    errorToast,
    handleSubmit,
    handleRetry,
    handleClearError,
  } = useChatLogic();

  if (authStatus === "loading") {
    return <Loading />;
  }

  return (
    <div className="bg-app-bg text-text-main relative flex min-h-screen font-sans shadow-xl">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
