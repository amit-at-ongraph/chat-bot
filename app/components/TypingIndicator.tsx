function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3 bg-chat-bg rounded-2xl w-fit shadow-sm border border-zinc-100">
      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
    </div>
  );
}

export default TypingIndicator;
