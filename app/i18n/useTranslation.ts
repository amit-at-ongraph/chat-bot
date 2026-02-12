"use client";

import { useCallback } from "react";
import { useLanguageStore } from "../store/languageStore";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import zh from "./locales/zh.json";
import ar from "./locales/ar.json";
import pt from "./locales/pt.json";

const translations = { en, hi, es, fr, zh, ar, pt };

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
    },
    [language],
  );

  return { t, language };
}
