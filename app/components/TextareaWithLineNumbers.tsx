"use client";

import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

type LayoutConfig = {
  fontSize: number;
  lineHeight: number;
  paddingX: number;
  paddingY: number;
  lineNumberPaddingRight: number;
  lineNumberMinWidth: number;
  gap: number;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  layout?: Partial<LayoutConfig>;
};

const DEFAULT_LAYOUT: LayoutConfig = {
  fontSize: 13,
  lineHeight: 18,
  paddingX: 6,
  paddingY: 12,
  lineNumberPaddingRight: 8,
  lineNumberMinWidth: 10,
  gap: 4,
};

export const TextareaWithLineNumbers = forwardRef<HTMLTextAreaElement, Props>(
  function TextareaWithLineNumbers(
    { value, onChange, placeholder, className = "", layout = {} },
    forwardedRef,
  ) {
    const cfg = { ...DEFAULT_LAYOUT, ...layout };

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const mirrorContainerRef = useRef<HTMLDivElement>(null);
    const lineNumberRef = useRef<HTMLDivElement>(null);
    const mirrorLineRefs = useRef<HTMLDivElement[]>([]);

    const lines = useMemo(() => value.split("\n"), [value]);
    const { t } = useTranslation();

    // Calculate line number column width dynamically (no state needed)
    const lineNumberWidth = useMemo(() => {
      const digits = String(lines.length || 1).length;

      const estimatedWidth = digits * cfg.fontSize * 0.6 + cfg.lineNumberPaddingRight + cfg.gap + 4;

      return Math.max(cfg.lineNumberMinWidth, estimatedWidth);
    }, [lines.length, cfg.fontSize, cfg.lineNumberPaddingRight, cfg.gap, cfg.lineNumberMinWidth]);

    const [lineHeights, setLineHeights] = useState<number[]>([]);

    // Measure real wrapped line heights
    useLayoutEffect(() => {
      if (!mirrorLineRefs.current.length) return;

      const heights = mirrorLineRefs.current.map((el) => el?.offsetHeight || cfg.lineHeight);

      setLineHeights((prev) => {
        if (prev.length === heights.length && prev.every((h, i) => h === heights[i])) {
          return prev;
        }
        return heights;
      });
    }, [lines, cfg.lineHeight, lineNumberWidth]);

    // Reset mirror refs when lines change
    useEffect(() => {
      mirrorLineRefs.current = [];
    }, [lines]);

    // Scroll sync
    const handleScroll = () => {
      const scrollTop = textareaRef.current?.scrollTop ?? 0;

      if (lineNumberRef.current) lineNumberRef.current.scrollTop = scrollTop;

      if (mirrorContainerRef.current) mirrorContainerRef.current.scrollTop = scrollTop;
    };

    // Merge refs safely
    const setTextareaRef = (node: HTMLTextAreaElement) => {
      textareaRef.current = node;

      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <div className="space-y-4">
        <div
          className={`group border-border-base focus-within:ring-primary/10 focus-within:border-primary/50 relative flex h-80 w-full flex-col overflow-hidden rounded-xl border transition-all focus-within:ring-2 ${className}`}
        >
          {/* Editor area */}
          <div
            className="relative flex-1 overflow-hidden bg-white"
            style={{
              fontSize: cfg.fontSize,
              lineHeight: `${cfg.lineHeight}px`,
            }}
          >
            {/* Line numbers */}
            <div
              ref={lineNumberRef}
              className="border-border-base bg-muted/10 text-text-muted absolute top-0 bottom-0 left-0 overflow-hidden border-r text-right select-none"
              style={{
                width: lineNumberWidth,
                paddingTop: cfg.paddingY,
                paddingBottom: cfg.paddingY,
                fontSize: cfg.fontSize - 1,
              }}
            >
              {lines.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: lineHeights[i] || cfg.lineHeight,
                    paddingRight: cfg.lineNumberPaddingRight,
                    boxSizing: "border-box",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Hidden mirror */}
            <div
              ref={mirrorContainerRef}
              className="invisible absolute top-0 right-0 wrap-break-word whitespace-pre-wrap"
              style={{
                left: lineNumberWidth,
                padding: `${cfg.paddingY}px ${cfg.paddingX}px`,
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) mirrorLineRefs.current[i] = el;
                  }}
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={setTextareaRef}
              value={value}
              placeholder={placeholder}
              spellCheck={false}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              className="absolute top-0 right-0 bottom-0 z-10 resize-none overflow-y-auto bg-white wrap-break-word whitespace-pre-wrap focus:outline-none"
              style={{
                left: lineNumberWidth, // prevents overlap
                paddingTop: cfg.paddingY,
                paddingBottom: cfg.paddingY,
                paddingRight: cfg.paddingX,
                paddingLeft: cfg.paddingX,
                fontSize: cfg.fontSize,
                lineHeight: `${cfg.lineHeight}px`,
              }}
            />
          </div>
        </div>

        {/* Footer (fixed bottom, white bg) */}
        <div className="flex items-center justify-between bg-transparent px-2">
          <p className="text-text-muted text-[11px] italic">{t("upload.utf8_hint")}</p>

          <p className="text-text-muted text-[11px] font-medium tracking-tight uppercase">
            {value.length} {t("upload.characters")}
          </p>
        </div>
      </div>
    );
  },
);
