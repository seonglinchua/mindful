"use client";

import { useEffect, useState } from "react";
import type { Language } from "./customization-types";
import { translations, type Translations } from "./translations";

export function useTranslations() {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLanguage = localStorage.getItem("mindful:language") as Language | null;
    const browserLanguage = navigator.language.split("-")[0] as Language;
    const supportedLanguages: Language[] = ["en", "es", "fr", "zh"];

    const initialLanguage =
      savedLanguage || (supportedLanguages.includes(browserLanguage) ? browserLanguage : "en");

    setLanguage(initialLanguage);
    setMounted(true);
  }, []);

  const t = (key: keyof Translations): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return { t, language, setLanguage, mounted };
}
