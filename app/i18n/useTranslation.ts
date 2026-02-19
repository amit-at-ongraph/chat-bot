"use client";

import { useCallback } from "react";
import { useLanguageStore } from "../store/languageStore";
import { toTitleCaseFromSnakeCase } from "../utils/string.utils";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fil from "./locales/fil.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";
import ta from "./locales/ta.json";
import tel from "./locales/tel.json";
import vi from "./locales/vi.json";
import zh from "./locales/zh.json";

const translations = { en, hi, es, fr, zh, ar, pt, fil, vi, tel, ta };

export type TranslationKeys = keyof typeof en;

export function useTranslation() {
  const { language } = useLanguageStore();

  const t = useCallback(
    (key: string, data?: Record<string, string | number>) => {
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
          value = found ? fallback : (toTitleCaseFromSnakeCase(keys[1]) ?? key);
          break;
        }
      }

      if (typeof value === "string" && data) {
        Object.entries(data).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }

      return value;
    },
    [language],
  );

  return { t, language };
}
