"use client";

import { useMemo } from "react";
import { MoodEntry, Timeframe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOODS } from "@/lib/mood-utils";

interface MoodTrendsChartProps {
  moods: MoodEntry[];
  timeframe: Timeframe;
  dateRange?: { start: string; end: string };
}

export function MoodTrendsChart({ moods, timeframe, dateRange }: MoodTrendsChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let endDate = new Date(today);

    if (timeframe === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (timeframe === 'month') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
    } else if (dateRange) {
      startDate = new Date(dateRange.start);
      endDate = new Date(dateRange.end);
    } else {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    }

    const days: { date: string; value: number | null; label: string }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const moodEntry = moods.find(m => m.date === dateStr);

      const label = current.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      days.push({
        date: dateStr,
        value: moodEntry?.value ?? null,
        label
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [moods, timeframe, dateRange]);

  // Chart dimensions
  const dimensions = useMemo(() => {
    const width = 600;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 50, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    return { width, height, padding, chartWidth, chartHeight };
  }, []);

  const { width, height, padding, chartWidth, chartHeight } = dimensions;

  // Calculate points for the line chart
  const points = useMemo(() => {
    const dataPoints = chartData.filter(d => d.value !== null);
    if (dataPoints.length === 0) return [];

    return dataPoints.map((d) => {
      const index = chartData.indexOf(d);
      const x = padding.left + (index / Math.max(chartData.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value! - 1) / 4) * chartHeight;
      return { x, y, value: d.value!, date: d.date, label: d.label };
    });
  }, [chartData, chartWidth, chartHeight, padding]);

  // Create path for the line
  const linePath = points.length > 1
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  const getMoodEmoji = (value: number) => {
    const mood = MOODS.find(m => m.value === value);
    return mood?.emoji || '';
  };

  const getMoodColor = (value: number) => {
    const colors = [
      'rgb(239, 68, 68)',   // red-500 (Low)
      'rgb(251, 146, 60)',  // orange-400 (Steady)
      'rgb(250, 204, 21)',  // yellow-400 (Calm)
      'rgb(74, 222, 128)',  // green-400 (Upbeat)
      'rgb(34, 197, 94)'    // green-500 (Radiant)
    ];
    return colors[value - 1] || colors[2];
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
          <CardDescription>
            {timeframe === 'week' ? 'Last 7 days' : timeframe === 'month' ? 'Last 30 days' : 'Custom range'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No mood data available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trends</CardTitle>
        <CardDescription>
          {timeframe === 'week' ? 'Last 7 days' : timeframe === 'month' ? 'Last 30 days' : 'Custom range'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-w-full"
            style={{ minWidth: '400px' }}
          >
            {/* Y-axis labels */}
            {MOODS.map((mood, i) => {
              const y = padding.top + chartHeight - (i / 4) * chartHeight;
              return (
                <g key={mood.value}>
                  <line
                    x1={padding.left - 5}
                    y1={y}
                    x2={padding.left}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <text
                    x={padding.left - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-xs fill-current"
                    opacity="0.7"
                  >
                    {mood.emoji}
                  </text>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.05"
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            {chartData.map((d, i) => {
              // Show fewer labels on mobile
              const showLabel = chartData.length <= 10 || i % Math.ceil(chartData.length / 7) === 0;
              if (!showLabel && i !== chartData.length - 1) return null;

              const x = padding.left + (i / Math.max(chartData.length - 1, 1)) * chartWidth;
              const y = height - padding.bottom + 15;

              return (
                <text
                  key={d.date}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="text-xs fill-current"
                  opacity="0.7"
                >
                  {d.label}
                </text>
              );
            })}

            {/* Line connecting points */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.6"
              />
            )}

            {/* Data points */}
            {points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill={getMoodColor(point.value)}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all hover:r-8"
                >
                  <title>{`${point.label}: ${getMoodEmoji(point.value)} (${point.value})`}</title>
                </circle>
              </g>
            ))}

            {/* Empty slots (no mood recorded) */}
            {chartData.map((d, i) => {
              if (d.value !== null) return null;
              const x = padding.left + (i / Math.max(chartData.length - 1, 1)) * chartWidth;
              const y = height - padding.bottom + 5;

              return (
                <circle
                  key={d.date}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="currentColor"
                  opacity="0.2"
                >
                  <title>{`${d.label}: No mood recorded`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
