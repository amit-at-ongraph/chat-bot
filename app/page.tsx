"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import ChatFooter from "./components/ChatFooter";
import ErrorToast from "./components/ErrorToast";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import Welcome from "./components/Welcome";

import { useChatLogic } from "./hooks/useChatLogic";
import Loading from "./loading";

export default function Home() {
  const { data: session, status: authStatus } = useSession();
  const [skippedAuth, setSkippedAuth] = useState(false);

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
    <div className="bg-app-bg text-text-main relative flex min-h-screen flex-col font-sans shadow-xl">
      {/* Sign In Overlay */}
      {!session && !skippedAuth && <Welcome onSkip={() => setSkippedAuth(true)} />}

      {/* Header */}
      <Header session={session} skippedAuth={skippedAuth} />

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
  );
}
