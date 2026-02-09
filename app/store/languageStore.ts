import { LANGUAGES } from "@/lib/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = (typeof LANGUAGES)[number]["value"];

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "language-storage",
    },
  ),
);
