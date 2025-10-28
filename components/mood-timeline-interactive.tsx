"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MoodEntry, DateRange } from "@/lib/types";
import { formatDisplayDate } from "@/lib/date-utils";

interface MoodTimelineInteractiveProps {
  moods: MoodEntry[];
  dateRange?: DateRange;
}

export function MoodTimelineInteractive({ moods, dateRange }: MoodTimelineInteractiveProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area");
  const [showAverage, setShowAverage] = useState(true);

  const chartData = useMemo(() => {
    if (!moods.length) return [];

    // Filter by date range if provided
    let filteredMoods = moods;
    if (dateRange) {
      filteredMoods = moods.filter((mood) => {
        const moodDate = new Date(mood.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return moodDate >= startDate && moodDate <= endDate;
      });
    }

    // Sort by date
    const sorted = [...filteredMoods].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate 7-day moving average
    const data = sorted.map((mood, index) => {
      const start = Math.max(0, index - 6);
      const slice = sorted.slice(start, index + 1);
      const average = slice.reduce((sum, m) => sum + m.value, 0) / slice.length;

      return {
        date: formatDisplayDate(mood.date),
        dateObj: new Date(mood.date),
        mood: mood.value,
        average: Number(average.toFixed(2)),
        notes: mood.notes,
      };
    });

    return data;
  }, [moods, dateRange]);

  if (!moods.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interactive Mood Timeline</CardTitle>
          <CardDescription>No mood data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Start tracking your mood to see your timeline
          </div>
        </CardContent>
      </Card>
    );
  }

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        mood: number;
        average: number;
        notes?: string;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <div className="font-medium">{data.date}</div>
        <div className="text-sm mt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Mood: {data.mood}/5</span>
          </div>
          {showAverage && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span>7-day avg: {data.average}/5</span>
            </div>
          )}
        </div>
        {data.notes && (
          <div className="text-xs text-muted-foreground mt-2 max-w-[200px]">
            {data.notes}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Interactive Mood Timeline</CardTitle>
            <CardDescription>
              Explore your mood patterns with zoom and filtering
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("area")}
            >
              Area
            </Button>
            <Button
              variant={showAverage ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAverage(!showAverage)}
            >
              7-Day Avg
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              {showAverage && (
                <Area
                  type="monotone"
                  dataKey="average"
                  name="7-Day Average"
                  stroke="hsl(var(--secondary))"
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="mood"
                name="Mood"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
              {showAverage && (
                <Line
                  type="monotone"
                  dataKey="average"
                  name="7-Day Average"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" />
            </LineChart>
          )}
        </ResponsiveContainer>

        <div className="mt-4 text-sm text-muted-foreground">
          Use the brush at the bottom to zoom into specific time periods. Toggle between line
          and area charts for different visualizations.
        </div>
      </CardContent>
    </Card>
  );
}
