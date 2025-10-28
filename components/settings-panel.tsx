"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCustomization } from "@/lib/use-customization";
import {
  COLOR_THEMES,
  FONT_SIZES,
  LANGUAGES,
  type ColorTheme,
  type FontSize,
  type Language,
} from "@/lib/customization-types";

export function SettingsPanel() {
  const {
    settings,
    mounted,
    setColorTheme,
    setFontSize,
    setLanguage,
    toggleDarkMode,
  } = useCustomization();

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your mindfulness dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted-foreground">
                Use dark theme for better viewing in low light
              </div>
            </div>
            <Switch
              checked={settings.darkMode === "dark"}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          {/* Color Theme Selection */}
          <div>
            <div className="font-medium mb-3">Color Theme</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key as ColorTheme)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    settings.colorTheme === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-sm">{theme.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {theme.description}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {key !== "monochrome" ? (
                      <>
                        <div
                          className={`w-6 h-6 rounded ${getThemePreviewClass(key as ColorTheme, "primary")}`}
                        />
                        <div
                          className={`w-6 h-6 rounded ${getThemePreviewClass(key as ColorTheme, "secondary")}`}
                        />
                        <div
                          className={`w-6 h-6 rounded ${getThemePreviewClass(key as ColorTheme, "accent")}`}
                        />
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded bg-black" />
                        <div className="w-6 h-6 rounded bg-gray-500" />
                        <div className="w-6 h-6 rounded bg-white border" />
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Selection */}
          <div>
            <div className="font-medium mb-3">Font Size</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(FONT_SIZES).map(([key, size]) => (
                <Button
                  key={key}
                  variant={settings.fontSize === key ? "default" : "outline"}
                  onClick={() => setFontSize(key as FontSize)}
                  className="h-auto py-3 flex-col items-start"
                >
                  <div className="font-medium">{size.name}</div>
                  <div className="text-xs opacity-80 mt-1">{size.description}</div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <Button
                key={key}
                variant={settings.language === key ? "default" : "outline"}
                onClick={() => setLanguage(key as Language)}
                className="h-auto py-3 flex-col items-start"
              >
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs opacity-80 mt-1">{lang.nativeName}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Mindful - Your personal wellness companion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <div>Version: 1.0.0</div>
            <div className="mt-2">
              Mindful helps you track your mood, practice breathing exercises, and maintain a
              wellness journal.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get theme preview colors
function getThemePreviewClass(theme: ColorTheme, variant: "primary" | "secondary" | "accent") {
  const colors: Record<ColorTheme, Record<string, string>> = {
    default: {
      primary: "bg-blue-500",
      secondary: "bg-slate-500",
      accent: "bg-teal-500",
    },
    ocean: {
      primary: "bg-sky-500",
      secondary: "bg-cyan-600",
      accent: "bg-teal-400",
    },
    forest: {
      primary: "bg-green-600",
      secondary: "bg-emerald-700",
      accent: "bg-lime-500",
    },
    sunset: {
      primary: "bg-orange-500",
      secondary: "bg-pink-600",
      accent: "bg-yellow-400",
    },
    lavender: {
      primary: "bg-purple-500",
      secondary: "bg-violet-600",
      accent: "bg-fuchsia-400",
    },
    monochrome: {
      primary: "bg-gray-700",
      secondary: "bg-gray-500",
      accent: "bg-gray-400",
    },
  };

  return colors[theme]?.[variant] || "bg-gray-400";
}
