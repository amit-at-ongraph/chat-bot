"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LANGUAGES } from "@/lib/constants";
import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguageStore } from "../../store/languageStore";
import { Button } from "./Button";

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguageStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLangOpen) {
      // Small timeout to ensure the dialog content is rendered
      setTimeout(() => {
        const activeElement = scrollContainerRef.current?.querySelector("[data-active='true']");
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: "instant", block: "center" });
        }
      }, 50);
    }
  }, [isLangOpen]);

  return (
    <Dialog open={isLangOpen} onOpenChange={setIsLangOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-text-muted hover:text-text-main h-9 w-9 transition-colors"
          aria-label="Select language"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Language</DialogTitle>
        </DialogHeader>
        <div ref={scrollContainerRef} className="max-h-[60vh] space-y-2 overflow-y-auto py-4 pr-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              data-active={language === lang.value}
              className={`group flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200 outline-none ${
                language === lang.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-selected border-transparent"
              }`}
              onClick={() => {
                setLanguage(lang.value);
                setIsLangOpen(false);
              }}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span
                  className={`text-[15px] font-medium ${
                    language === lang.value ? "text-primary" : "text-text-main"
                  }`}
                >
                  {lang.native}
                </span>
                <span className="text-text-muted group-hover:text-text-main text-[13px] font-light">
                  {lang.english}
                </span>
              </div>
              {language === lang.value && <div className="bg-primary size-2 rounded-full" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
