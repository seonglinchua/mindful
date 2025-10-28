"use client";

import { useMemo, useState } from "react";
import { BreathSession, DateRange, Timeframe } from "@/lib/types";
import { BREATH_PATTERNS } from "@/lib/breath-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Clock } from "lucide-react";

interface BreathingHistoryProps {
  sessions: BreathSession[];
  timeframe?: Timeframe;
  dateRange?: DateRange;
}

export function BreathingHistory({ sessions, timeframe = 'month', dateRange }: BreathingHistoryProps) {
  const [showAll, setShowAll] = useState(false);

  const filteredSessions = useMemo(() => {
    const today = new Date();
    let startDate: Date;

    if (dateRange) {
      startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return sessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    }

    if (timeframe === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (timeframe === 'month') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
    } else {
      return sessions;
    }

    return sessions.filter(s => new Date(s.date) >= startDate);
  }, [sessions, timeframe, dateRange]);

  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.completedAt.localeCompare(a.completedAt);
    });
  }, [filteredSessions]);

  const stats = useMemo(() => {
    const totalMinutes = Math.floor(
      filteredSessions.reduce((sum, s) => sum + s.duration, 0) / 60
    );
    const totalSessions = filteredSessions.length;

    const patternCounts: Record<string, number> = {};
    filteredSessions.forEach(s => {
      patternCounts[s.pattern] = (patternCounts[s.pattern] || 0) + 1;
    });

    const favoritePattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0];

    const avgDuration = totalSessions > 0
      ? Math.floor(filteredSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions / 60)
      : 0;

    return {
      totalMinutes,
      totalSessions,
      favoritePattern: favoritePattern ? favoritePattern[0] : null,
      avgDuration
    };
  }, [filteredSessions]);

  const displaySessions = showAll ? sortedSessions : sortedSessions.slice(0, 10);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const getPatternName = (patternKey: string) => {
    return BREATH_PATTERNS[patternKey]?.name || patternKey;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-5 h-5" />
          Breathing Session History
        </CardTitle>
        <CardDescription>
          {timeframe === 'week' ? 'Last 7 days' : timeframe === 'month' ? 'Last 30 days' : 'Custom range'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalMinutes}</div>
            <div className="text-xs text-muted-foreground">Total Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.avgDuration}</div>
            <div className="text-xs text-muted-foreground">Avg Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold truncate">{stats.favoritePattern ? getPatternName(stats.favoritePattern) : 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Favorite</div>
          </div>
        </div>

        {/* Session List */}
        {sortedSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No breathing sessions recorded for this period.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {displaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {getPatternName(session.pattern)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(session.completedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatDuration(session.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedSessions.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 w-full text-sm text-primary hover:underline"
              >
                {showAll ? 'Show less' : `Show all ${sortedSessions.length} sessions`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
