import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTypewriter } from "../hooks/useTypewriter";

const MemoizedMarkdown = React.memo(
  ({ text, isStreaming }: { text: string; isStreaming: boolean }) => {
    const animatedText = useTypewriter(text, 5, isStreaming);

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 ml-4 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal">{children}</ol>,
          code: ({ children }) => (
            <code className="rounded px-1 font-mono text-sm">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
              {children}
            </pre>
          ),
        }}
      >
        {animatedText}
      </ReactMarkdown>
    );
  },
);
MemoizedMarkdown.displayName = "MemoizedMarkdown";

export default MemoizedMarkdown;
