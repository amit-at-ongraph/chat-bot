function TypingIndicator() {
  return (
    <div className="bg-chat-bg flex w-fit items-center gap-1 rounded-2xl border border-zinc-100 px-4 py-3 shadow-sm">
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"></div>
    </div>
  );
}

export default TypingIndicator;
