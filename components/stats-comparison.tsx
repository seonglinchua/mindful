"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Activity, Heart, BookOpen, Target } from "lucide-react";
import type { MoodEntry, BreathSession, JournalEntry } from "@/lib/types";

interface StatsComparisonProps {
  moods: MoodEntry[];
  breathSessions: BreathSession[];
  journalEntries: JournalEntry[];
  intentions: Record<string, string>;
}

interface WeekStats {
  avgMood: number;
  moodCount: number;
  breathSessions: number;
  breathMinutes: number;
  journalEntries: number;
  intentionsSet: number;
}

export function StatsComparison({
  moods,
  breathSessions,
  journalEntries,
  intentions,
}: StatsComparisonProps) {
  const comparison = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const calculateStats = (start: Date, end: Date): WeekStats => {
      // Mood stats
      const weekMoods = moods.filter((m) => {
        const date = new Date(m.date);
        return date >= start && date < end;
      });
      const avgMood = weekMoods.length
        ? weekMoods.reduce((sum, m) => sum + m.value, 0) / weekMoods.length
        : 0;

      // Breathing stats
      const weekBreath = breathSessions.filter((s) => {
        const date = new Date(s.date);
        return date >= start && date < end;
      });
      const breathMinutes = weekBreath.reduce((sum, s) => sum + s.duration / 60, 0);

      // Journal stats
      const weekJournals = journalEntries.filter((j) => {
        const date = new Date(j.date);
        return date >= start && date < end;
      });

      // Intentions stats
      const weekIntentions = Object.keys(intentions).filter((key) => {
        const date = new Date(key);
        return date >= start && date < end;
      }).length;

      return {
        avgMood: Number(avgMood.toFixed(2)),
        moodCount: weekMoods.length,
        breathSessions: weekBreath.length,
        breathMinutes: Math.round(breathMinutes),
        journalEntries: weekJournals.length,
        intentionsSet: weekIntentions,
      };
    };

    const thisWeek = calculateStats(oneWeekAgo, now);
    const lastWeek = calculateStats(twoWeeksAgo, oneWeekAgo);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      thisWeek,
      lastWeek,
      changes: {
        avgMood: calculateChange(thisWeek.avgMood, lastWeek.avgMood),
        moodCount: calculateChange(thisWeek.moodCount, lastWeek.moodCount),
        breathSessions: calculateChange(thisWeek.breathSessions, lastWeek.breathSessions),
        breathMinutes: calculateChange(thisWeek.breathMinutes, lastWeek.breathMinutes),
        journalEntries: calculateChange(thisWeek.journalEntries, lastWeek.journalEntries),
        intentionsSet: calculateChange(thisWeek.intentionsSet, lastWeek.intentionsSet),
      },
    };
  }, [moods, breathSessions, journalEntries, intentions]);

  const StatCard = ({
    title,
    icon: Icon,
    thisWeek,
    lastWeek,
    change,
    unit = "",
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    thisWeek: number;
    lastWeek: number;
    change: number;
    unit?: string;
  }) => {
    const TrendIcon =
      change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
    const trendColor =
      change > 0
        ? "text-green-600 dark:text-green-400"
        : change < 0
          ? "text-red-600 dark:text-red-400"
          : "text-muted-foreground";

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </CardDescription>
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{change > 0 ? "+" : ""}{change}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold">
                {thisWeek}
                {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
              </div>
              <div className="text-xs text-muted-foreground">This week</div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Last week: </span>
              <span className="font-medium">
                {lastWeek}
                {unit}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Week-Over-Week Comparison</CardTitle>
          <CardDescription>
            Compare your wellness metrics from this week to last week
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Average Mood"
          icon={Heart}
          thisWeek={comparison.thisWeek.avgMood}
          lastWeek={comparison.lastWeek.avgMood}
          change={comparison.changes.avgMood}
          unit="/5"
        />
        <StatCard
          title="Mood Entries"
          icon={Activity}
          thisWeek={comparison.thisWeek.moodCount}
          lastWeek={comparison.lastWeek.moodCount}
          change={comparison.changes.moodCount}
        />
        <StatCard
          title="Breathing Sessions"
          icon={Activity}
          thisWeek={comparison.thisWeek.breathSessions}
          lastWeek={comparison.lastWeek.breathSessions}
          change={comparison.changes.breathSessions}
        />
        <StatCard
          title="Breathing Minutes"
          icon={Activity}
          thisWeek={comparison.thisWeek.breathMinutes}
          lastWeek={comparison.lastWeek.breathMinutes}
          change={comparison.changes.breathMinutes}
          unit="min"
        />
        <StatCard
          title="Journal Entries"
          icon={BookOpen}
          thisWeek={comparison.thisWeek.journalEntries}
          lastWeek={comparison.lastWeek.journalEntries}
          change={comparison.changes.journalEntries}
        />
        <StatCard
          title="Daily Intentions"
          icon={Target}
          thisWeek={comparison.thisWeek.intentionsSet}
          lastWeek={comparison.lastWeek.intentionsSet}
          change={comparison.changes.intentionsSet}
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <div className="font-medium">Understanding Your Progress</div>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Green arrows indicate improvement from last week</li>
              <li>Red arrows show areas where you can increase engagement</li>
              <li>Consistency is key - even small improvements add up over time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
