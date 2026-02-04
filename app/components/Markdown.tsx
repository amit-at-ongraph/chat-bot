import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTypewriter } from "../hooks/useTypewriter";

const MemoizedMarkdown = React.memo(
  ({ text, isStreaming }: { text: string; isStreaming: boolean }) => {
    const animatedText = useTypewriter(text, 2, isStreaming);

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-4 whitespace-pre-line last:mb-0">{children}</p>,
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
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-gray-400 pl-4 italic">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="font-medium not-italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-blue-800"
            >
              {children}
            </a>
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
