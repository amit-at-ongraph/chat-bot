"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslation } from "../i18n/useTranslation";
import { Button } from "./ui/Button";

interface HowToUseProps {
  onBack: () => void;
}

export default function HowToUse({ onBack }: HowToUseProps) {
  const { t } = useTranslation();

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
        <h2 className="text-text-main m-0 text-[18px] font-semibold">{t("common.how_to_use")}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <div className="mb-4 text-2xl">📖</div>

        <section className="space-y-2">
          <h3 className="text-text-main flex items-center gap-2 text-[14px] font-semibold">
            {t("how_to.ask_about")}
          </h3>
          <ul className="space-y-3 pl-1">
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">🚪</span>
              <span className="text-text-secondary">{t("how_to.ice_door")}</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">⚖️</span>
              <span className="text-text-secondary">{t("how_to.legal_rights")}</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">🆘</span>
              <span className="text-text-secondary">{t("how_to.detained")}</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">📝</span>
              <span className="text-text-secondary">{t("how_to.warrant_help")}</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-sm leading-none">✊</span>
              <span className="text-text-secondary">{t("how_to.protest_action")}</span>
            </li>
          </ul>
        </section>

        <p className="text-text-secondary text-[14px]">{t("how_to.languages")}</p>

        <section className="space-y-2">
          <h3 className="text-text-main text-[16px] font-bold">
            <span className="text-red-500">{t("common.paxis")}</span> {t("how_to.replies_with")}
          </h3>
          <ul className="mt-1 space-y-2">
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-xs leading-none">✅</span>
              <span className="text-text-secondary">{t("how_to.say_not_say")}</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-xs leading-none">✅</span>
              <span className="text-text-secondary">{t("how_to.rights_apply")}</span>
            </li>
            <li className="flex gap-3 text-[14px]">
              <span className="mt-1 shrink-0 text-xs leading-none">✅</span>
              <span className="text-text-secondary">{t("how_to.do_next")}</span>
            </li>
          </ul>
        </section>

        <div className="border-border-base space-y-4 border-t pt-4">
          <p className="text-text-secondary text-[14px]">{t("how_to.urgent_note")}</p>
          <p className="text-text-main text-[14px] leading-snug font-semibold">
            <span className="text-red-500">{t("common.paxis")}</span> {t("how_to.purpose_note")}
          </p>
        </div>
      </div>
    </div>
  );
}
