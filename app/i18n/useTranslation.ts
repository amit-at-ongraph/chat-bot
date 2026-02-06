"use client";

import { useLanguageStore } from "../store/languageStore";
import en from "./locales/en.json";
import hi from "./locales/hi.json";

const translations = { en, hi };

export type TranslationKeys = keyof typeof en;

export function useTranslation() {
  const { language } = useLanguageStore();

  const t = (key: string, data?: Record<string, string | number>) => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to English if key missing in current language
        let fallback: any = translations["en"];
        let found = true;
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk];
          } else {
            found = false;
            break;
          }
        }
        value = found ? fallback : key;
        break;
      }
    }

    if (typeof value === "string" && data) {
      Object.entries(data).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }

    return value;
  };

  return { t, language };
}
