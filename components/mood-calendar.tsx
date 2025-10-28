"use client";

import { useState, useMemo } from "react";
import { MoodEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MOODS } from "@/lib/mood-utils";

interface MoodCalendarProps {
  moods: MoodEntry[];
  onDayClick?: (date: string, mood?: MoodEntry) => void;
}

export function MoodCalendar({ moods, onDayClick }: MoodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: string | null;
      dayNumber: number | null;
      mood?: MoodEntry;
      isToday: boolean;
      isCurrentMonth: boolean;
    }> = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayNumber: day,
        mood: moods.find(m => m.date === dateStr),
        isToday: false,
        isCurrentMonth: false
      });
    }

    // Current month's days
    const today = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayNumber: day,
        mood: moods.find(m => m.date === dateStr),
        isToday: dateStr === today,
        isCurrentMonth: true
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayNumber: day,
        mood: moods.find(m => m.date === dateStr),
        isToday: false,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate, moods]);

  const getMoodEmoji = (value: number) => {
    const mood = MOODS.find(m => m.value === value);
    return mood?.emoji || '';
  };

  const getMoodColor = (value: number) => {
    const colors = [
      'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',       // Low
      'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700', // Steady
      'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700', // Calm
      'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',     // Upbeat
      'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' // Radiant
    ];
    return colors[value - 1] || '';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (day: typeof monthData[0]) => {
    if (day.date && onDayClick) {
      onDayClick(day.date, day.mood);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mood Calendar</CardTitle>
            <CardDescription>{monthName}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {monthData.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!day.isCurrentMonth}
              className={`
                aspect-square p-1 rounded-lg border-2 transition-all
                ${day.isCurrentMonth ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-30'}
                ${day.isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${day.mood ? getMoodColor(day.mood.value) : 'bg-background border-border hover:bg-muted/50'}
                flex flex-col items-center justify-center
                relative group
              `}
            >
              <span className={`text-xs ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                {day.dayNumber}
              </span>
              {day.mood && (
                <span className="text-lg leading-none">
                  {getMoodEmoji(day.mood.value)}
                </span>
              )}
              {day.mood?.notes && (
                <div className="absolute bottom-1 right-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              )}

              {/* Tooltip on hover */}
              {day.mood && (
                <div className="absolute z-10 invisible group-hover:visible bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-lg bottom-full mb-2 whitespace-nowrap">
                  {MOODS.find(m => m.value === day.mood!.value)?.label}
                  {day.mood.notes && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-[200px] whitespace-normal">
                      {day.mood.notes.slice(0, 100)}
                      {day.mood.notes.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Mood Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {MOODS.map(mood => (
              <div
                key={mood.value}
                className={`flex items-center gap-2 p-2 rounded-lg border-2 ${getMoodColor(mood.value)}`}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
