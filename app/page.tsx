"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataManager } from "@/components/data-manager";
import { ThemeToggle } from "@/components/theme-toggle";
import { BreathingGuide } from "@/components/breathing-guide";
import { MoodTrendsChart } from "@/components/mood-trends-chart";
import { MoodInsights } from "@/components/mood-insights";
import { MoodCalendar } from "@/components/mood-calendar";
import { BreathingHistory } from "@/components/breathing-history";
import { JournalManager } from "@/components/journal-manager";
import { DateRangeSelector } from "@/components/date-range-selector";
import { ReminderSettingsComponent } from "@/components/reminder-settings";
import { useLocalStorage } from "@/lib/use-local-storage";
import { BREATH_PRESETS, BREATH_PATTERNS, getBreathPhase } from "@/lib/breath-utils";
import { useBreathAudio } from "@/lib/use-breath-audio";
import { MOODS, calculateStreak } from "@/lib/mood-utils";
import { formatDisplayDate, todayKey } from "@/lib/date-utils";
import type { MoodEntry, JournalEntry, BreathSession, DateRange, Timeframe } from "@/lib/types";
import { useToast } from "@/components/toast";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Home() {
  const today = todayKey();
  const { showToast } = useToast();

  const [preset, setPreset] = useState<number>(BREATH_PRESETS[0].value);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loop, setLoop, loopHydrated] = useLocalStorage<boolean>(
    "mindful:breath-loop",
    false,
  );
  const [breathPattern, setBreathPattern, patternHydrated] = useLocalStorage<string>(
    "mindful:breath-pattern",
    "4-4-6",
  );
  const [audioEnabled, setAudioEnabled, audioHydrated] = useLocalStorage<boolean>(
    "mindful:breath-audio",
    false,
  );
  const [showGuide, setShowGuide, guideHydrated] = useLocalStorage<boolean>(
    "mindful:breath-guide",
    true,
  );

  const [breathSessions, setBreathSessions, sessionsHydrated] =
    useLocalStorage<BreathSession[]>("mindful:breath-sessions", []);

  const [moods, setMoods, moodsHydrated] = useLocalStorage<MoodEntry[]>(
    "mindful:moods",
    [],
  );
  const [intentions, setIntentions, intentionsHydrated] = useLocalStorage<
    Record<string, string>
  >("mindful:intentions", {});
  const [journalEntries, setJournalEntries, journalsHydrated] =
    useLocalStorage<JournalEntry[]>("mindful:journals", []);

  const [journalDraft, setJournalDraft] = useState("");
  const [journalTags, setJournalTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [moodNotes, setMoodNotes] = useState("");
  const [showMoodNotes, setShowMoodNotes] = useState(false);

  // Analytics state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<Timeframe>('week');
  const [analyticsDateRange, setAnalyticsDateRange] = useState<DateRange | undefined>();
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Use breath audio hook
  useBreathAudio(Math.floor(elapsed), breathPattern, isRunning, audioEnabled);

  useEffect(() => {
    if (!isRunning || startTime === null) return;

    let frame: number;

    const tick = () => {
      const diff = (Date.now() - startTime) / 1000;
      const clamped = Math.min(diff, preset);

      setElapsed(clamped);

      if (clamped >= preset) {
        // Session complete - save it
        const session: BreathSession = {
          id: `session-${Date.now()}`,
          date: today,
          duration: preset,
          pattern: breathPattern,
          completedAt: new Date().toISOString(),
        };

        setBreathSessions((prev) => [session, ...prev]);
        showToast(`Breathing session complete! ${preset}s with ${BREATH_PATTERNS[breathPattern]?.name}`, "success");

        if (loop) {
          const now = Date.now();
          setStartTime(now);
          setElapsed(0);
        } else {
          setIsRunning(false);
        }
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isRunning, startTime, preset, loop, breathPattern, today, setBreathSessions, showToast]);

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    const restartFrom = elapsed >= preset ? 0 : elapsed;
    if (restartFrom !== elapsed) {
      setElapsed(restartFrom);
    }
    setStartTime(Date.now() - restartFrom * 1000);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setStartTime(null);
  };

  const handlePresetChange = (value: number) => {
    setPreset(value);
    setElapsed(0);
    setStartTime(null);
    setIsRunning(false);
  };

  const handlePatternChange = (patternKey: string) => {
    setBreathPattern(patternKey);
    setElapsed(0);
    setStartTime(null);
    setIsRunning(false);
  };

  const totalSeconds = preset;
  const wholeElapsed = Math.floor(elapsed);
  const remainingSeconds = Math.max(totalSeconds - wholeElapsed, 0);
  const progress = Math.min(
    totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0,
    100,
  );
  const activePhase = useMemo(() => {
    if (totalSeconds === 0) {
      return {
        label: "Ready",
        secondsRemaining: 0,
        secondsInPhase: 0,
        phaseIndex: 0,
      };
    }

    if (wholeElapsed >= totalSeconds) {
      return {
        label: "Session complete",
        secondsRemaining: 0,
        secondsInPhase: 0,
        phaseIndex: 0,
      };
    }

    return getBreathPhase(wholeElapsed, breathPattern);
  }, [totalSeconds, wholeElapsed, breathPattern]);

  const todaysSessions = useMemo(
    () => breathSessions.filter((session) => session.date === today),
    [breathSessions, today],
  );

  const totalBreathMinutes = useMemo(() => {
    return Math.floor(
      breathSessions.reduce((sum, session) => sum + session.duration, 0) / 60
    );
  }, [breathSessions]);

  const todaysMood = useMemo(
    () => moods.find((entry) => entry.date === today),
    [moods, today],
  );

  const streak = useMemo(
    () => calculateStreak(moods, today),
    [moods, today],
  );

  const averageMood = useMemo(() => {
    if (moods.length === 0) return null;
    const total = moods.reduce((sum, entry) => sum + entry.value, 0);
    return total / moods.length;
  }, [moods]);

  const sortedJournalEntries = useMemo(
    () =>
      [...journalEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [journalEntries],
  );

  const handleMoodSelect = (value: number) => {
    setMoods((prev) => {
      const filtered = prev.filter((entry) => entry.date !== today);
      const newEntry: MoodEntry = {
        date: today,
        value,
        notes: moodNotes.trim() || undefined
      };
      return [...filtered, newEntry].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
    });
    setMoodNotes("");
    setShowMoodNotes(false);
  };

  // Load existing mood notes if any
  useEffect(() => {
    if (todaysMood?.notes) {
      setMoodNotes(todaysMood.notes);
    }
  }, [todaysMood]);

  const handleIntentionChange = (value: string) => {
    setIntentions((prev) => ({
      ...prev,
      [today]: value,
    }));
  };

  const handleJournalSave = () => {
    const content = journalDraft.trim();
    if (!content) return;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: today,
      content,
      tags: journalTags.length > 0 ? journalTags : undefined
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    setJournalDraft("");
    setJournalTags([]);
    setNewTag("");
    showToast("Journal entry saved", "success");
  };

  const handleJournalEdit = (id: string, content: string, tags?: string[]) => {
    setJournalEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, content, tags } : entry
      )
    );
  };

  const handleJournalDelete = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !journalTags.includes(tag)) {
      setJournalTags([...journalTags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setJournalTags(journalTags.filter(t => t !== tag));
  };

  const hydrationReady =
    moodsHydrated &&
    journalsHydrated &&
    intentionsHydrated &&
    loopHydrated &&
    patternHydrated &&
    audioHydrated &&
    guideHydrated &&
    sessionsHydrated;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <section className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-[0.25rem] text-secondary">
            Mindful
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            A daily ritual for calmer, brighter days.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Flow through guided breathing, log your mood, capture reflections, and
            watch your streak grow. Everything stays on this device thanks to
            private local storage.
          </p>
        </section>
        <ThemeToggle />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 pb-4">
            <div>
              <CardTitle>Breathing guide</CardTitle>
              <CardDescription>
                Choose your pattern and duration for mindful breathing.
              </CardDescription>
            </div>

            {/* Pattern Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Breathing pattern:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BREATH_PATTERNS).map(([key, pattern]) => (
                  <Button
                    key={key}
                    variant={breathPattern === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePatternChange(key)}
                    disabled={!hydrationReady || isRunning}
                  >
                    {pattern.name}
                  </Button>
                ))}
              </div>
              {BREATH_PATTERNS[breathPattern] && (
                <p className="text-xs text-muted-foreground">
                  {BREATH_PATTERNS[breathPattern].description}
                </p>
              )}
            </div>

            {/* Duration Presets */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Duration:</p>
              <div className="flex flex-wrap gap-2">
                {BREATH_PRESETS.map((presetOption) => (
                  <Button
                    key={presetOption.value}
                    variant={
                      presetOption.value === preset ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handlePresetChange(presetOption.value)}
                    disabled={!hydrationReady || isRunning}
                  >
                    {presetOption.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Visual Breathing Guide */}
            {showGuide && (
              <BreathingGuide
                elapsed={wholeElapsed}
                pattern={breathPattern}
                isRunning={isRunning}
              />
            )}

            {/* Timer Display */}
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-white/90 to-primary/5 p-6 shadow-sm dark:from-slate-900/70 dark:to-primary/10">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3rem] text-secondary">
                    {activePhase.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tabular-nums">
                      {activePhase.secondsRemaining.toString().padStart(2, "0")}s
                    </span>
                    <span className="text-sm text-muted-foreground">
                      remaining • {wholeElapsed}s elapsed
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={loop}
                      disabled={!hydrationReady}
                      onCheckedChange={(state) => setLoop(state)}
                      aria-label="Loop breathing session"
                    />
                    <span className="text-sm text-muted-foreground">Loop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={audioEnabled}
                      disabled={!hydrationReady}
                      onCheckedChange={(state) => setAudioEnabled(state)}
                      aria-label="Enable audio cues"
                    />
                    <span className="text-sm text-muted-foreground">Audio cues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showGuide}
                      disabled={!hydrationReady}
                      onCheckedChange={(state) => setShowGuide(state)}
                      aria-label="Show visual guide"
                    />
                    <span className="text-sm text-muted-foreground">Visual guide</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Session ends in {remainingSeconds}s
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleStartPause} disabled={!hydrationReady}>
                {isRunning ? "Pause" : elapsed > 0 ? "Resume" : "Begin"}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={!hydrationReady}>
                Reset
              </Button>
            </div>

            {/* Today's Sessions */}
            {todaysSessions.length > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                <span className="font-medium">{todaysSessions.length}</span> session
                {todaysSessions.length > 1 ? "s" : ""} completed today
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md shadow-primary/10">
          <CardHeader>
            <CardTitle>Daily stats</CardTitle>
            <CardDescription>
              Keep an eye on your trend at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/80 bg-card/70 p-4 shadow-floating">
                <p className="text-xs uppercase tracking-[0.2rem] text-secondary">
                  Average mood
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums">
                    {averageMood ? averageMood.toFixed(1) : "—"}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
              </div>
              <div className="rounded-lg border border-border/80 bg-card/70 p-4 shadow-floating">
                <p className="text-xs uppercase tracking-[0.2rem] text-secondary">
                  Current streak
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {streak}
                </p>
              </div>
              <div className="rounded-lg border border-border/80 bg-card/70 p-4 shadow-floating">
                <p className="text-xs uppercase tracking-[0.2rem] text-secondary">
                  Journal entries
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {journalEntries.length}
                </p>
              </div>
              <div className="rounded-lg border border-border/80 bg-card/70 p-4 shadow-floating">
                <p className="text-xs uppercase tracking-[0.2rem] text-secondary">
                  Breath minutes
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {totalBreathMinutes}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Stats update instantly as your local entries change. No account or
              network required.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mood check-in</CardTitle>
            <CardDescription>
              Tap the emoji that best matches how you feel right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-5 gap-3">
              {MOODS.map((mood) => {
                const isActive = todaysMood?.value === mood.value;
                return (
                  <Button
                    key={mood.value}
                    variant={isActive ? "default" : "outline"}
                    className="flex h-auto flex-col gap-1 px-3 py-4 text-2xl"
                    onClick={() => handleMoodSelect(mood.value)}
                    disabled={!hydrationReady}
                  >
                    <span>{mood.emoji}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {mood.label}
                    </span>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Daily intention
              </p>
              <Input
                value={intentions[today] ?? ""}
                maxLength={80}
                onChange={(event) => handleIntentionChange(event.target.value)}
                placeholder="What do you want to cultivate today?"
                disabled={!hydrationReady}
              />
            </div>

            {/* Mood Notes (Optional) */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMoodNotes(!showMoodNotes)}
                className="flex items-center gap-2 h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              >
                {showMoodNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Add notes to mood (optional)
              </Button>
              {showMoodNotes && (
                <Textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="What's on your mind? Any context for your mood today?"
                  disabled={!hydrationReady}
                  className="min-h-[80px]"
                />
              )}
            </div>

            {!hydrationReady ? (
              <p className="text-sm text-muted-foreground">
                Loading your data...
              </p>
            ) : todaysMood ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Logged for <span className="font-medium">{formatDisplayDate(today)}</span>. Keep it up!
                </p>
                {todaysMood.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    Note: {todaysMood.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Logging once a day keeps your streak alive.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal</CardTitle>
            <CardDescription>
              Capture a thought from today. Entries stay on this device. Supports markdown formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={journalDraft}
              onChange={(event) => setJournalDraft(event.target.value)}
              placeholder="Breathe in, notice, and write what you discover..."
              disabled={!hydrationReady}
              className="min-h-[120px]"
            />
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className={journalDraft.length > 5000 ? "text-orange-500" : "text-muted-foreground"}>
                  {journalDraft.trim().length} characters
                  {journalDraft.length > 5000 && " (Consider keeping entries concise)"}
                </span>
              </div>
              <Button size="sm" onClick={handleJournalSave} disabled={!journalDraft.trim() || !hydrationReady}>
                Save entry
              </Button>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add tags (e.g., gratitude, work, family)..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={!hydrationReady}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim() || !hydrationReady}>
                  Add Tag
                </Button>
              </div>
              {journalTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {journalTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                        disabled={!hydrationReady}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Recent entries
              </p>
              {sortedJournalEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing here yet—your reflections will appear as you save them.
                </p>
              ) : (
                <ul className="space-y-3">
                  {sortedJournalEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-lg border border-border/70 bg-card/70 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2rem] text-secondary">
                        {formatDisplayDate(entry.date)}
                      </p>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.tags.map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Explore your mood patterns, breathing history, and journal entries
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </Button>
          </div>
        </CardHeader>
        {showAnalytics && (
          <CardContent className="space-y-6">
            {/* Date Range Selector */}
            <DateRangeSelector
              timeframe={analyticsTimeframe}
              dateRange={analyticsDateRange}
              onTimeframeChange={setAnalyticsTimeframe}
              onDateRangeChange={setAnalyticsDateRange}
            />

            {/* Mood Analytics */}
            <div className="grid gap-6 lg:grid-cols-2">
              <MoodTrendsChart
                moods={moods}
                timeframe={analyticsTimeframe}
                dateRange={analyticsDateRange}
              />
              <MoodInsights moods={moods} timeframe={analyticsTimeframe === 'custom' ? 'all' : analyticsTimeframe} />
            </div>

            {/* Mood Calendar */}
            <MoodCalendar moods={moods} />

            {/* Breathing History */}
            <BreathingHistory
              sessions={breathSessions}
              timeframe={analyticsTimeframe}
              dateRange={analyticsDateRange}
            />
          </CardContent>
        )}
      </Card>

      {/* Journal Manager */}
      <JournalManager
        journals={journalEntries}
        onEdit={handleJournalEdit}
        onDelete={handleJournalDelete}
      />

      {/* Reminder Settings */}
      <ReminderSettingsComponent />

      <DataManager />
    </main>
  );
}
