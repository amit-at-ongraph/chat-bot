"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/Button";

interface HowToUseProps {
  onBack: () => void;
}

export default function HowToUse({ onBack }: HowToUseProps) {
  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header with Back Button */}
      <div className="border-border-base bg-muted/30 flex h-16.25 items-center gap-4 border-b px-4">
        <Button
          variant="none"
          size="none"
          onClick={onBack}
          className="text-text-main hover:text-primary cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-text-main m-0 text-[18px] font-semibold">
          How To Use <span className="text-red-500">PAXIS</span>
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <div className="mb-4 text-2xl">📖</div>

        <section className="space-y-2">
          <h3 className="text-text-main flex items-center gap-2 text-[14px] font-semibold">
            You can ask about:
          </h3>
          <ul className="space-y-3 pl-1">
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">🚪</span>
              <span className="text-text-secondary">ICE at your door or work</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">⚖️</span>
              <span className="text-text-secondary">Legal rights or immigration court</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">🆘</span>
              <span className="text-text-secondary">If someone has been detained</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">📝</span>
              <span className="text-text-secondary">How to check a warrant or find help</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">✊</span>
              <span className="text-text-secondary">Preparing for a protest or public action</span>
            </li>
          </ul>
        </section>

        <p className="text-text-secondary text-[14px]">
          Ask in English, Spanish, or your language.
        </p>

        <section className="space-y-2">
          <h3 className="text-text-main text-[16px] font-bold">
            <span className="text-red-500">PAXIS</span> will reply with:
          </h3>
          <ul className="mt-1 space-y-2">
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-xs leading-none">✅</span>
              <span className="text-text-secondary">What to say or not say</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-xs leading-none">✅</span>
              <span className="text-text-secondary">What rights apply</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-xs leading-none">✅</span>
              <span className="text-text-secondary">What to do next — calmly and lawfully</span>
            </li>
          </ul>
        </section>

        <div className="border-border-base space-y-4 border-t pt-4">
          <p className="text-text-secondary text-[14px]">
            If it&apos;s urgent, use the quick reply buttons to get help fast.
          </p>
          <p className="text-text-main text-[14px] leading-snug font-semibold">
            <span className="text-red-500">PAXIS</span> is here for lawful, nonviolent response —
            not fear.
          </p>
        </div>
      </div>
    </div>
  );
}
