"use client";

import { useMemo } from "react";
import { MoodEntry, MoodInsight } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Calendar, Award, Activity } from "lucide-react";
import { MOODS } from "@/lib/mood-utils";

interface MoodInsightsProps {
  moods: MoodEntry[];
  timeframe?: 'week' | 'month' | 'all';
}

export function MoodInsights({ moods, timeframe = 'month' }: MoodInsightsProps) {
  const insights = useMemo((): MoodInsight | null => {
    if (moods.length === 0) return null;

    const today = new Date();
    let filteredMoods = moods;

    if (timeframe === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      filteredMoods = moods.filter(m => new Date(m.date) >= weekAgo);
    } else if (timeframe === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 29);
      filteredMoods = moods.filter(m => new Date(m.date) >= monthAgo);
    }

    if (filteredMoods.length === 0) return null;

    // Find best and worst days
    const sortedByValue = [...filteredMoods].sort((a, b) => b.value - a.value);
    const bestDay = sortedByValue[0].date;
    const worstDay = sortedByValue[sortedByValue.length - 1].date;

    // Calculate average mood
    const averageMood = filteredMoods.reduce((sum, m) => sum + m.value, 0) / filteredMoods.length;

    // Calculate trend (compare first half to second half)
    if (filteredMoods.length >= 4) {
      const sorted = [...filteredMoods].sort((a, b) => a.date.localeCompare(b.date));
      const midpoint = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, midpoint);
      const secondHalf = sorted.slice(midpoint);

      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;

      const difference = secondHalfAvg - firstHalfAvg;
      let moodTrend: 'improving' | 'declining' | 'stable';

      if (difference > 0.3) {
        moodTrend = 'improving';
      } else if (difference < -0.3) {
        moodTrend = 'declining';
      } else {
        moodTrend = 'stable';
      }

      // Calculate consistency (standard deviation)
      const variance = filteredMoods.reduce((sum, m) => {
        return sum + Math.pow(m.value - averageMood, 2);
      }, 0) / filteredMoods.length;
      const stdDev = Math.sqrt(variance);
      const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 30)));

      return {
        bestDay,
        worstDay,
        averageMood,
        moodTrend,
        consistencyScore
      };
    }

    return {
      bestDay,
      worstDay,
      averageMood,
      moodTrend: 'stable',
      consistencyScore: 50
    };
  }, [moods, timeframe]);

  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMoodLabel = (value: number) => {
    const mood = MOODS.find(m => m.value === Math.round(value));
    return mood ? `${mood.emoji} ${mood.label}` : '';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendMessage = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Your mood has been improving!';
      case 'declining':
        return 'Your mood has been declining. Consider self-care activities.';
      default:
        return 'Your mood has been stable.';
    }
  };

  const getBestDayOfWeek = useMemo(() => {
    const dayOfWeekCounts: Record<string, { total: number; count: number }> = {};

    moods.forEach(mood => {
      const dayOfWeek = new Date(mood.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayOfWeekCounts[dayOfWeek]) {
        dayOfWeekCounts[dayOfWeek] = { total: 0, count: 0 };
      }
      dayOfWeekCounts[dayOfWeek].total += mood.value;
      dayOfWeekCounts[dayOfWeek].count += 1;
    });

    const averages = Object.entries(dayOfWeekCounts).map(([day, data]) => ({
      day,
      average: data.total / data.count
    }));

    if (averages.length === 0) return null;

    return averages.sort((a, b) => b.average - a.average)[0];
  }, [moods]);

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Insights</CardTitle>
          <CardDescription>Not enough data to generate insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log your mood regularly to see personalized insights and patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Insights</CardTitle>
        <CardDescription>
          {timeframe === 'week' ? 'Last 7 days' : timeframe === 'month' ? 'Last 30 days' : 'All time'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trend */}
          <div className="flex items-start gap-3">
            {getTrendIcon(insights.moodTrend)}
            <div>
              <h4 className="font-semibold mb-1">Mood Trend</h4>
              <p className="text-sm text-muted-foreground">{getTrendMessage(insights.moodTrend)}</p>
            </div>
          </div>

          {/* Average Mood */}
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-semibold mb-1">Average Mood</h4>
              <p className="text-sm text-muted-foreground">
                {getMoodLabel(insights.averageMood)} ({insights.averageMood.toFixed(1)})
              </p>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Consistency Score</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {Math.round(insights.consistencyScore)}% - {
                  insights.consistencyScore > 75 ? 'Very consistent' :
                  insights.consistencyScore > 50 ? 'Moderately consistent' :
                  'Variable moods'
                }
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${insights.consistencyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Best and Worst Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">🌟</div>
                <h4 className="font-semibold">Best Day</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {getDayOfWeek(insights.bestDay)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(insights.bestDay)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">💭</div>
                <h4 className="font-semibold">Challenging Day</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {getDayOfWeek(insights.worstDay)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(insights.worstDay)}
              </p>
            </div>
          </div>

          {/* Best Day of Week Pattern */}
          {getBestDayOfWeek && (
            <div className="flex items-start gap-3 pt-4 border-t">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-semibold mb-1">Weekly Pattern</h4>
                <p className="text-sm text-muted-foreground">
                  You tend to feel best on <strong>{getBestDayOfWeek.day}s</strong>
                  {' '}({getBestDayOfWeek.average.toFixed(1)} avg)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
