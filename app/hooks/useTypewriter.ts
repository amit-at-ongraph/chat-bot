import { useEffect, useRef, useState } from "react";

export function useTypewriter(text: string, speed = 10, active: boolean) {
  // CRITICAL: Initialize based on the active prop.
  // If active is false (history), isWriting is false, and we show the full text immediately.
  const [isWriting, setIsWriting] = useState(active);
  const [displayedText, setDisplayedText] = useState(() => (active || isWriting ? "" : text));

  const textRef = useRef(text);
  const activeRef = useRef(active);

  // Sync refs and handle static content
  useEffect(() => {
    textRef.current = text;
    activeRef.current = active;
  }, [text, isWriting, active]);

  useEffect(() => {
    if (!isWriting) return;

    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        const target = textRef.current;
        const currentActive = activeRef.current;

        if (prev.length < target.length) {
          const diff = target.length - prev.length;
          const jump = diff > 80 ? 6 : diff > 40 ? 2 : 1;
          return target.slice(0, prev.length + jump);
        }

        // Catch-up finished. We only stop writing mode if the stream is dead.
        if (!currentActive) {
          setIsWriting(false);
        }
        return prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isWriting, speed]);

  return displayedText;
}
