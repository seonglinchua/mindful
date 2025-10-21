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
import { useLocalStorage } from "@/lib/use-local-storage";
import { BREATH_PRESETS, getBreathPhase } from "@/lib/breath-utils";
import { MOODS, calculateStreak } from "@/lib/mood-utils";
import { formatDisplayDate, todayKey } from "@/lib/date-utils";
import type { MoodEntry, JournalEntry } from "@/lib/types";

export default function Home() {
  const today = todayKey();

  const [preset, setPreset] = useState<number>(BREATH_PRESETS[0].value);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loop, setLoop, loopHydrated] = useLocalStorage<boolean>(
    "mindful:breath-loop",
    false,
  );

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

  useEffect(() => {
    if (!isRunning || startTime === null) return;

    let frame: number;

    const tick = () => {
      const diff = (Date.now() - startTime) / 1000;
      const clamped = Math.min(diff, preset);

      setElapsed(clamped);

      if (clamped >= preset) {
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
  }, [isRunning, startTime, preset, loop]);

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
      };
    }

    if (wholeElapsed >= totalSeconds) {
      return {
        label: "Session complete",
        secondsRemaining: 0,
        secondsInPhase: 0,
      };
    }

    return getBreathPhase(wholeElapsed);
  }, [totalSeconds, wholeElapsed]);

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
      return [...filtered, { date: today, value }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
    });
  };

  const handleIntentionChange = (value: string) => {
    setIntentions((prev) => ({
      ...prev,
      [today]: value,
    }));
  };

  const handleJournalSave = () => {
    const content = journalDraft.trim();
    if (!content) return;

    setJournalEntries((prev) => [
      { id: `entry-${Date.now()}`, date: today, content },
      ...prev,
    ]);
    setJournalDraft("");
  };

  const hydrationReady =
    moodsHydrated && journalsHydrated && intentionsHydrated && loopHydrated;

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
          <CardHeader className="flex flex-col gap-4 pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Breathing guide</CardTitle>
              <CardDescription>4-4-6 cadence with quick presets.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {BREATH_PRESETS.map((presetOption) => (
                <Button
                  key={presetOption.value}
                  variant={
                    presetOption.value === preset ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePresetChange(presetOption.value)}
                >
                  {presetOption.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-white/90 to-primary/5 p-6 shadow-sm dark:from-slate-900/70 dark:to-primary/10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="flex items-center gap-3">
                  <Switch
                    checked={loop}
                    disabled={!hydrationReady}
                    onCheckedChange={(state) => setLoop(state)}
                    aria-label="Loop breathing session"
                  />
                  <span className="text-sm text-muted-foreground">Loop</span>
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

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleStartPause}>
                {isRunning ? "Pause" : elapsed > 0 ? "Resume" : "Begin"}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
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
              <div className="rounded-lg border border-border/80 bg-card/70 p-4 shadow-floating sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.2rem] text-secondary">
                  Journal entries
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">
                  {journalEntries.length}
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

            {!hydrationReady ? (
              <p className="text-sm text-muted-foreground">
                Loading your data...
              </p>
            ) : todaysMood ? (
              <p className="text-sm text-muted-foreground">
                Logged for <span className="font-medium">{formatDisplayDate(today)}</span>. Keep it up!
              </p>
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
              Capture a thought from today. Entries stay on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={journalDraft}
              onChange={(event) => setJournalDraft(event.target.value)}
              placeholder="Breathe in, notice, and write what you discover..."
              disabled={!hydrationReady}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{journalDraft.trim().length} characters</span>
              <Button size="sm" onClick={handleJournalSave} disabled={!journalDraft.trim() || !hydrationReady}>
                Save entry
              </Button>
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
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
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

      <DataManager />
    </main>
  );
}
