"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDashboardLayout } from "@/lib/use-dashboard-layout";
import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react";

const WIDGET_LABELS: Record<string, { title: string; description: string }> = {
  "mood-tracker": {
    title: "Mood Tracker",
    description: "Track your daily mood and emotions",
  },
  breathing: {
    title: "Breathing Exercise",
    description: "Guided breathing exercises",
  },
  intentions: {
    title: "Daily Intentions",
    description: "Set your daily affirmations and intentions",
  },
  journal: {
    title: "Journal",
    description: "Write and manage journal entries",
  },
  stats: {
    title: "Statistics",
    description: "View your mood trends and insights",
  },
  calendar: {
    title: "Mood Calendar",
    description: "Calendar view of your mood history",
  },
};

export function DashboardLayoutManager() {
  const { widgets, hydrated, toggleWidget, reorderWidget, resetLayout } = useDashboardLayout();

  if (!hydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Layout</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dashboard Layout</CardTitle>
            <CardDescription>
              Customize which widgets appear on your dashboard and their order
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {widgets.map((widget, index) => {
            const label = WIDGET_LABELS[widget.id] || {
              title: widget.id,
              description: "",
            };

            return (
              <div
                key={widget.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reorderWidget(widget.id, "up")}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reorderWidget(widget.id, "down")}
                    disabled={index === widgets.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium">{label.title}</div>
                  <div className="text-sm text-muted-foreground">{label.description}</div>
                </div>

                <Switch
                  checked={widget.enabled}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          Enabled widgets will appear on your dashboard in the order shown above. Disabled
          widgets will be hidden but your data will be preserved.
        </div>
      </CardContent>
    </Card>
  );
}
