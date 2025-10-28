"use client";

import { useLocalStorage } from "./use-local-storage";
import type { DashboardWidget } from "./customization-types";

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "mood-tracker", type: "mood-tracker", enabled: true, order: 0 },
  { id: "breathing", type: "breathing", enabled: true, order: 1 },
  { id: "intentions", type: "intentions", enabled: true, order: 2 },
  { id: "journal", type: "journal", enabled: true, order: 3 },
  { id: "stats", type: "stats", enabled: true, order: 4 },
  { id: "calendar", type: "calendar", enabled: true, order: 5 },
];

export function useDashboardLayout() {
  const [widgets, setWidgets, hydrated] = useLocalStorage<DashboardWidget[]>(
    "mindful:dashboard-layout",
    DEFAULT_WIDGETS
  );

  const toggleWidget = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const reorderWidget = (widgetId: string, direction: "up" | "down") => {
    const currentIndex = widgets.findIndex((w) => w.id === widgetId);
    if (currentIndex === -1) return;

    const newWidgets = [...widgets];
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newWidgets.length) return;

    // Swap orders
    const temp = newWidgets[currentIndex].order;
    newWidgets[currentIndex] = { ...newWidgets[currentIndex], order: newWidgets[targetIndex].order };
    newWidgets[targetIndex] = { ...newWidgets[targetIndex], order: temp };

    // Sort by order
    setWidgets(newWidgets.sort((a, b) => a.order - b.order));
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const getEnabledWidgets = () => {
    return widgets.filter((w) => w.enabled).sort((a, b) => a.order - b.order);
  };

  return {
    widgets,
    hydrated,
    toggleWidget,
    reorderWidget,
    resetLayout,
    getEnabledWidgets,
  };
}
