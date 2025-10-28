"use client";

import { useState } from "react";
import { DateRange, Timeframe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface DateRangeSelectorProps {
  timeframe: Timeframe;
  dateRange?: DateRange;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function DateRangeSelector({
  timeframe,
  dateRange,
  onTimeframeChange,
  onDateRangeChange
}: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(timeframe === 'custom');
  const [startDate, setStartDate] = useState(dateRange?.start || '');
  const [endDate, setEndDate] = useState(dateRange?.end || '');

  const handleTimeframeClick = (newTimeframe: Timeframe) => {
    if (newTimeframe === 'custom') {
      setShowCustom(true);
      onTimeframeChange(newTimeframe);
    } else {
      setShowCustom(false);
      onTimeframeChange(newTimeframe);
      onDateRangeChange(undefined);
    }
  };

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start <= end) {
        onDateRangeChange({
          start: startDate,
          end: endDate
        });
      }
    }
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getWeekAgoString = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeframeClick('week')}
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeframeClick('month')}
            >
              Last 30 Days
            </Button>
            <Button
              variant={timeframe === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeframeClick('custom')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Custom Range
            </Button>
          </div>

          {showCustom && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={getTodayString()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={getTodayString()}
                    min={startDate}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApplyCustomRange}
                  disabled={!startDate || !endDate}
                  size="sm"
                  className="flex-1"
                >
                  Apply Range
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(getWeekAgoString());
                    setEndDate(getTodayString());
                  }}
                >
                  Last Week
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
