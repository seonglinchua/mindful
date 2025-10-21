"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataManagerProps {
  onImport?: () => void;
}

const STORAGE_PREFIX = "mindful:";

const collectMindfulKeys = () => {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const keys: string[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }

  return keys.sort();
};

export function DataManager({ onImport }: DataManagerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleExport = () => {
    if (typeof window === "undefined") return;

    try {
      const data: Record<string, unknown> = {};
      const keys = collectMindfulKeys();

      keys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindful-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window === "undefined") return;

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        const confirmImport = confirm(
          "This will overwrite your current data. Are you sure you want to continue?",
        );

        if (!confirmImport) {
          return;
        }

        const existingKeys = collectMindfulKeys();

        existingKeys.forEach((key) => {
          localStorage.removeItem(key);
        });

        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });

        alert("Data imported successfully! Refreshing page...");
        window.location.reload();

        if (onImport) {
          onImport();
        }
      } catch (error) {
        console.error("Import failed:", error);
        alert("Failed to import data. Please check the file format.");
      }
    };

    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data management</CardTitle>
          <CardDescription>
            Export your data for safekeeping or import from a previous backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" disabled>
            Export data
          </Button>
          <Button variant="outline" disabled>
            Import data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data management</CardTitle>
        <CardDescription>
          Export your data for safekeeping or import from a previous backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={handleExport} variant="outline">
          Export data
        </Button>
        <Button onClick={handleImportClick} variant="outline">
          Import data
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import data file"
        />
      </CardContent>
    </Card>
  );
}
