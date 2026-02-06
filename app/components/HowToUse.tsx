"use client";

import { ChevronLeft } from "lucide-react";
import React from "react";
import { Button } from "./ui/Button";

interface HowToUseProps {
  onBack: () => void;
}

export default function HowToUse({ onBack }: HowToUseProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header with Back Button */}
      <div className="flex h-16.25 items-center gap-4 px-4 border-b border-border-base bg-muted/30">
        <Button
          variant="none"
          size="none"
          onClick={onBack}
          className="text-text-main hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-[18px] font-semibold text-text-main m-0">
          How To Use <span className="text-red-500">PAXIS</span>
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="text-2xl mb-4">📖</div>

        <section className="space-y-2">
          <h3 className="text-[14px] font-semibold text-text-main flex items-center gap-2">
            You can ask about:
          </h3>
          <ul className="space-y-3 pl-1">
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-sm leading-none mt-1">🚪</span>
              <span className="text-text-secondary">ICE at your door or work</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-sm leading-none mt-1">⚖️</span>
              <span className="text-text-secondary">Legal rights or immigration court</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-sm leading-none mt-1">🆘</span>
              <span className="text-text-secondary">If someone has been detained</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-sm leading-none mt-1">📝</span>
              <span className="text-text-secondary">How to check a warrant or find help</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-sm leading-none mt-1">✊</span>
              <span className="text-text-secondary">Preparing for a protest or public action</span>
            </li>
          </ul>
        </section>

        <p className="text-[14px] text-text-secondary">
          Ask in English, Spanish, or your language.
        </p>

        <section className="space-y-2">
          <h3 className="text-[16px] font-bold text-text-main">
            <span className="text-red-500">PAXIS</span> will reply with:
          </h3>
          <ul className="space-y-2 mt-1">
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-xs mt-1 leading-none">✅</span>
              <span className="text-text-secondary">What to say or not say</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-xs mt-1 leading-none">✅</span>
              <span className="text-text-secondary">What rights apply</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="shrink-0 text-xs mt-1 leading-none">✅</span>
              <span className="text-text-secondary">What to do next — calmly and lawfully</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-border-base pt-4 space-y-4">
          <p className="text-[14px] text-text-secondary">
            If it&apos;s urgent, use the quick reply buttons to get help fast.
          </p>
          <p className="text-[14px] font-semibold text-text-main leading-snug">
            <span className="text-red-500">PAXIS</span> is here for lawful, nonviolent response — not fear.
          </p>
        </div>
      </div>
    </div>
  );
}
