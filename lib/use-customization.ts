"use client";

import { useEffect, useState } from "react";
import type {
  CustomizationSettings,
  ColorTheme,
  DarkMode,
  FontSize,
  Language,
} from "./customization-types";

const DEFAULT_SETTINGS: CustomizationSettings = {
  colorTheme: "default",
  darkMode: "light",
  fontSize: "medium",
  language: "en",
};

export function useCustomization() {
  const [settings, setSettings] = useState<CustomizationSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("mindful:color-theme") as ColorTheme | null;
    const savedDarkMode = localStorage.getItem("theme") as DarkMode | null;
    const savedFontSize = localStorage.getItem("mindful:font-size") as FontSize | null;
    const savedLanguage = localStorage.getItem("mindful:language") as Language | null;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const loadedSettings: CustomizationSettings = {
      colorTheme: savedTheme || "default",
      darkMode: savedDarkMode || (prefersDark ? "dark" : "light"),
      fontSize: savedFontSize || "medium",
      language: savedLanguage || "en",
    };

    setSettings(loadedSettings);
    applySettings(loadedSettings);
    setMounted(true);
  }, []);

  const applySettings = (newSettings: CustomizationSettings) => {
    if (typeof window === "undefined") return;

    const htmlElement = document.documentElement;

    // Apply dark mode
    htmlElement.classList.toggle("dark", newSettings.darkMode === "dark");

    // Apply color theme
    // Remove all theme classes first
    htmlElement.classList.remove(
      "theme-ocean",
      "theme-forest",
      "theme-sunset",
      "theme-lavender",
      "theme-monochrome"
    );
    if (newSettings.colorTheme !== "default") {
      htmlElement.classList.add(`theme-${newSettings.colorTheme}`);
    }

    // Apply font size
    htmlElement.classList.remove(
      "font-size-small",
      "font-size-large",
      "font-size-extra-large"
    );
    if (newSettings.fontSize !== "medium") {
      htmlElement.classList.add(`font-size-${newSettings.fontSize}`);
    }

    // Store language for i18n (will be used by translation hook)
    htmlElement.lang = newSettings.language;
  };

  const updateSettings = (partial: Partial<CustomizationSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    applySettings(newSettings);

    // Persist to localStorage
    if (partial.colorTheme !== undefined) {
      localStorage.setItem("mindful:color-theme", partial.colorTheme);
    }
    if (partial.darkMode !== undefined) {
      localStorage.setItem("theme", partial.darkMode);
    }
    if (partial.fontSize !== undefined) {
      localStorage.setItem("mindful:font-size", partial.fontSize);
    }
    if (partial.language !== undefined) {
      localStorage.setItem("mindful:language", partial.language);
    }
  };

  const setColorTheme = (theme: ColorTheme) => updateSettings({ colorTheme: theme });
  const setDarkMode = (mode: DarkMode) => updateSettings({ darkMode: mode });
  const setFontSize = (size: FontSize) => updateSettings({ fontSize: size });
  const setLanguage = (lang: Language) => updateSettings({ language: lang });
  const toggleDarkMode = () =>
    updateSettings({ darkMode: settings.darkMode === "light" ? "dark" : "light" });

  return {
    settings,
    mounted,
    setColorTheme,
    setDarkMode,
    setFontSize,
    setLanguage,
    toggleDarkMode,
    updateSettings,
  };
}
