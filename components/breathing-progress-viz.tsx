"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BreathSession } from "@/lib/types";

interface BreathingProgressVizProps {
  sessions: BreathSession[];
}

export function BreathingProgressViz({ sessions }: BreathingProgressVizProps) {
  const stats = useMemo(() => {
    if (!sessions.length) return null;

    // Calculate total time and sessions
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration / 60, 0);
    const totalSessions = sessions.length;

    // Group by pattern
    const byPattern = sessions.reduce(
      (acc, session) => {
        acc[session.pattern] = (acc[session.pattern] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const patternData = Object.entries(byPattern).map(([pattern, count]) => ({
      pattern,
      count,
      percentage: ((count / totalSessions) * 100).toFixed(1),
    }));

    // Group by day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = sessions.filter(
      (s) => new Date(s.date) >= thirtyDaysAgo
    );

    const byDay = recentSessions.reduce(
      (acc, session) => {
        const date = new Date(session.date).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, sessions: 0, minutes: 0 };
        }
        acc[date].sessions += 1;
        acc[date].minutes += session.duration / 60;
        return acc;
      },
      {} as Record<string, { date: string; sessions: number; minutes: number }>
    );

    const dailyData = Object.values(byDay)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sessions: d.sessions,
        minutes: Number(d.minutes.toFixed(1)),
      }));

    // Calculate streak
    let currentStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(byDay).sort().reverse();

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - tempStreak);
      const expected = expectedDate.toISOString().split("T")[0];

      if (sortedDates[i] === expected) {
        tempStreak++;
      } else {
        break;
      }
    }

    currentStreak = tempStreak;

    return {
      totalMinutes: Math.round(totalMinutes),
      totalSessions,
      patternData,
      dailyData,
      currentStreak,
      averagePerDay: (totalMinutes / Math.max(dailyData.length, 1)).toFixed(1),
    };
  }, [sessions]);

  if (!sessions.length || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breathing Progress</CardTitle>
          <CardDescription>No breathing sessions recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Start a breathing exercise to see your progress
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--muted))",
  ];

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        sessions: number;
        minutes: number;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <div className="font-medium">{payload[0].payload.date}</div>
        <div className="text-sm mt-1">
          <div>Sessions: {payload[0].payload.sessions}</div>
          <div>Minutes: {payload[0].payload.minutes}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMinutes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Streak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Per Day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averagePerDay}</div>
            <div className="text-sm text-muted-foreground">minutes</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
          <CardDescription>Track your breathing practice consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sessions" name="Sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pattern Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Distribution</CardTitle>
          <CardDescription>Which breathing patterns you use most</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.patternData}
                  dataKey="count"
                  nameKey="pattern"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.pattern} (${entry.percentage}%)`}
                >
                  {stats.patternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col justify-center space-y-3">
              {stats.patternData.map((item, index) => (
                <div key={item.pattern} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.pattern}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} sessions ({item.percentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
