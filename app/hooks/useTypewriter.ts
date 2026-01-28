import { useEffect, useRef, useState } from "react";

export function useTypewriter(text: string, speed = 10, active: boolean) {
  const [displayedText, setDisplayedText] = useState("");
  const textRef = useRef(text);

  // Sync the latest text from the stream into a ref
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        // If the displayed text is still shorter than the total received text
        if (prev.length < textRef.current.length) {
          // Calculate how many characters to add.
          // If we are way behind, add 2-3 chars to keep it snappy.
          const jump = textRef.current.length - prev.length > 50 ? 3 : 1;
          return textRef.current.slice(0, prev.length + jump);
        }

        // If we've caught up, just stay there
        return prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed, active]); // Only restart if speed changes, NOT when text or active changes

  return displayedText;
}
