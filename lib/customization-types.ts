export type ColorTheme =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "monochrome";

export type DarkMode = "light" | "dark";

export type FontSize = "small" | "medium" | "large" | "extra-large";

export type Language = "en" | "es" | "fr" | "zh";

export interface CustomizationSettings {
  colorTheme: ColorTheme;
  darkMode: DarkMode;
  fontSize: FontSize;
  language: Language;
}

export interface DashboardWidget {
  id: string;
  type: "mood-tracker" | "breathing" | "journal" | "intentions" | "stats" | "calendar";
  enabled: boolean;
  order: number;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

export const COLOR_THEMES: Record<ColorTheme, { name: string; description: string }> = {
  default: { name: "Default", description: "Classic blue theme" },
  ocean: { name: "Ocean", description: "Calming blue and teal" },
  forest: { name: "Forest", description: "Natural green tones" },
  sunset: { name: "Sunset", description: "Warm orange and pink" },
  lavender: { name: "Lavender", description: "Gentle purple hues" },
  monochrome: { name: "Monochrome", description: "Pure black and white" },
};

export const FONT_SIZES: Record<FontSize, { name: string; description: string }> = {
  small: { name: "Small", description: "Compact text" },
  medium: { name: "Medium", description: "Standard size" },
  large: { name: "Large", description: "Larger text" },
  "extra-large": { name: "Extra Large", description: "Maximum readability" },
};

export const LANGUAGES: Record<Language, { name: string; nativeName: string }> = {
  en: { name: "English", nativeName: "English" },
  es: { name: "Spanish", nativeName: "Español" },
  fr: { name: "French", nativeName: "Français" },
  zh: { name: "Chinese", nativeName: "中文" },
};
