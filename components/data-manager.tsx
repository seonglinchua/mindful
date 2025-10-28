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
import { useToast } from "@/components/toast";

interface DataManagerProps {
  onImport?: () => void;
}

const STORAGE_PREFIX = "mindful:";

interface DataStats {
  totalKeys: number;
  moods: number;
  journals: number;
  intentions: number;
  breathSessions: number;
  sizeBytes: number;
}

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

const getDataStats = (): DataStats => {
  if (typeof window === "undefined") {
    return { totalKeys: 0, moods: 0, journals: 0, intentions: 0, breathSessions: 0, sizeBytes: 0 };
  }

  const keys = collectMindfulKeys();
  let totalSize = 0;
  let moods = 0;
  let journals = 0;
  let intentions = 0;
  let breathSessions = 0;

  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      totalSize += key.length + value.length;

      try {
        const parsed = JSON.parse(value);
        if (key.includes("moods") && Array.isArray(parsed)) {
          moods = parsed.length;
        } else if (key.includes("journals") && Array.isArray(parsed)) {
          journals = parsed.length;
        } else if (key.includes("intentions") && typeof parsed === "object") {
          intentions = Object.keys(parsed).length;
        } else if (key.includes("breath-sessions") && Array.isArray(parsed)) {
          breathSessions = parsed.length;
        }
      } catch {
        // Skip parsing errors
      }
    }
  });

  return {
    totalKeys: keys.length,
    moods,
    journals,
    intentions,
    breathSessions,
    sizeBytes: totalSize * 2, // Approximate UTF-16 bytes
  };
};

const validateImportData = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Invalid data format: expected an object" };
  }

  const dataObj = data as Record<string, unknown>;

  // Check if at least one mindful: key exists
  const mindfulKeys = Object.keys(dataObj).filter((key) => key.startsWith(STORAGE_PREFIX));
  if (mindfulKeys.length === 0) {
    return { valid: false, error: "No mindful data found in import file" };
  }

  // Validate structure of known keys
  for (const [key, value] of Object.entries(dataObj)) {
    if (!key.startsWith(STORAGE_PREFIX)) continue;

    try {
      if (key.includes("moods") || key.includes("journals") || key.includes("breath-sessions")) {
        if (!Array.isArray(value)) {
          return { valid: false, error: `Invalid format for ${key}: expected an array` };
        }
      } else if (key.includes("intentions")) {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          return { valid: false, error: `Invalid format for ${key}: expected an object` };
        }
      }
    } catch {
      return { valid: false, error: `Invalid data structure for ${key}` };
    }
  }

  return { valid: true };
};

export function DataManager({ onImport }: DataManagerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState<DataStats | null>(null);
  const { showToast, showConfirm } = useToast();

  React.useEffect(() => {
    setMounted(true);
    setStats(getDataStats());
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleExport = (type: "all" | "moods" | "journals" | "intentions" | "breathSessions" = "all") => {
    if (typeof window === "undefined") return;

    try {
      const data: Record<string, unknown> = {};
      const keys = collectMindfulKeys();

      keys.forEach((key) => {
        // Filter based on export type
        if (type !== "all") {
          if (type === "moods" && !key.includes("moods")) return;
          if (type === "journals" && !key.includes("journals")) return;
          if (type === "intentions" && !key.includes("intentions")) return;
          if (type === "breathSessions" && !key.includes("breath-sessions")) return;
        }

        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      if (Object.keys(data).length === 0) {
        showToast(`No ${type === "all" ? "" : type + " "}data to export`, "warning");
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = type === "all" ? "" : `-${type}`;
      a.download = `mindful-backup${suffix}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Data exported successfully (${formatBytes(blob.size)})`, "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Failed to export data. Please try again.", "error");
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

        // Validate data
        const validation = validateImportData(data);
        if (!validation.valid) {
          showToast(validation.error || "Invalid data format", "error");
          return;
        }

        showConfirm(
          "This will overwrite your current data. Are you sure you want to continue?",
          () => {
            try {
              const existingKeys = collectMindfulKeys();

              existingKeys.forEach((key) => {
                localStorage.removeItem(key);
              });

              Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith(STORAGE_PREFIX)) {
                  localStorage.setItem(key, JSON.stringify(value));
                }
              });

              showToast("Data imported successfully! Refreshing page...", "success");
              setTimeout(() => {
                window.location.reload();
              }, 1000);

              if (onImport) {
                onImport();
              }
            } catch (error) {
              console.error("Import failed:", error);
              showToast("Failed to import data. Please try again.", "error");
            }
          },
          () => {
            showToast("Import cancelled", "info");
          }
        );
      } catch (error) {
        console.error("Import failed:", error);
        showToast("Failed to parse file. Please check the file format.", "error");
      }
    };

    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  const handleClearAllData = () => {
    showConfirm(
      "This will permanently delete all your data including moods, journals, intentions, and breathing sessions. This action cannot be undone. Are you sure?",
      () => {
        if (typeof window === "undefined") return;

        try {
          const keys = collectMindfulKeys();
          keys.forEach((key) => {
            localStorage.removeItem(key);
          });

          showToast("All data cleared successfully! Refreshing page...", "success");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error("Clear failed:", error);
          showToast("Failed to clear data. Please try again.", "error");
        }
      },
      () => {
        showToast("Clear cancelled", "info");
      }
    );
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
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" disabled>
              Export all data
            </Button>
            <Button variant="outline" disabled>
              Import data
            </Button>
            <Button variant="outline" disabled>
              Clear all data
            </Button>
          </div>
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
      <CardContent className="space-y-4">
        {stats && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <div className="font-medium mb-1">Current data:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>{stats.moods} mood entries</div>
              <div>{stats.journals} journal entries</div>
              <div>{stats.intentions} daily intentions</div>
              <div>{stats.breathSessions} breathing sessions</div>
            </div>
            <div className="mt-1">Total size: {formatBytes(stats.sizeBytes)}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="font-medium text-sm">Export options:</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleExport("all")} variant="outline" size="sm">
              Export all data
            </Button>
            <Button onClick={() => handleExport("moods")} variant="outline" size="sm">
              Moods only
            </Button>
            <Button onClick={() => handleExport("journals")} variant="outline" size="sm">
              Journals only
            </Button>
            <Button onClick={() => handleExport("intentions")} variant="outline" size="sm">
              Intentions only
            </Button>
            <Button onClick={() => handleExport("breathSessions")} variant="outline" size="sm">
              Breathing sessions
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-sm">Other actions:</div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleImportClick} variant="outline">
              Import data
            </Button>
            <Button onClick={handleClearAllData} variant="outline">
              Clear all data
            </Button>
          </div>
        </div>

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
