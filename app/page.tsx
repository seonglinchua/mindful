"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Leaf, LockSimple, Moon, SunHorizon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/lib/use-local-storage";

type MoodEntry = { date: string; value: number };
type JournalEntry = { id: string; date: string; content: string };

const BREATH_PATTERN = [
  { label: "Inhale", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Exhale", seconds: 6 },
] as const;
const CYCLE_SECONDS = BREATH_PATTERN.reduce((sum, phase) => sum + phase.seconds, 0);
const PRESETS = [{ label: "1 minute", value: 60 }, { label: "2 minutes", value: 120 }] as const;
const MOODS = [
  { emoji: "😞", label: "Low", value: 1 },
  { emoji: "😐", label: "Steady", value: 2 },
  { emoji: "🙂", label: "Calm", value: 3 },
  { emoji: "😄", label: "Upbeat", value: 4 },
  { emoji: "🤩", label: "Radiant", value: 5 },
] as const;

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date: string, full = false) => new Intl.DateTimeFormat("en-US", {
  ...(full ? { weekday: "long" as const } : {}),
  month: full ? "long" : "short",
  day: "numeric",
  ...(full ? { year: "numeric" as const } : {}),
}).format(new Date(`${date}T12:00:00`));

const calculateStreak = (entries: MoodEntry[], today: string) => {
  const dates = new Set(entries.map((entry) => entry.date));
  const cursor = new Date(`${today}T12:00:00`);
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const getPhase = (elapsed: number) => {
  const position = elapsed % CYCLE_SECONDS;
  let start = 0;
  for (let index = 0; index < BREATH_PATTERN.length; index += 1) {
    const phase = BREATH_PATTERN[index];
    if (position < start + phase.seconds) {
      return { index, label: phase.label, seconds: Math.max(phase.seconds - Math.floor(position - start), 1) };
    }
    start += phase.seconds;
  }
  return { index: 0, label: "Inhale", seconds: 4 };
};

export default function Home() {
  const [today, setToday] = useState<string | null>(null);
  const [preset, setPreset] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [deletedJournal, setDeletedJournal] = useState<JournalEntry | null>(null);
  const [reflectionStatus, setReflectionStatus] = useState("");
  const [intentionStatus, setIntentionStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [loop, setLoop, loopReady] = useLocalStorage("mindful:breath-loop", false);
  const [moods, setMoods, moodsReady] = useLocalStorage<MoodEntry[]>("mindful:moods", []);
  const [intentions, setIntentions, intentionsReady] = useLocalStorage<Record<string, string>>("mindful:intentions", {});
  const [journals, setJournals, journalsReady] = useLocalStorage<JournalEntry[]>("mindful:journals", []);

  useEffect(() => {
    const update = () => setToday(localDateKey());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!running || startedAt === null) return;
    let frame: number;
    const tick = () => {
      const next = Math.min((Date.now() - startedAt) / 1000, preset);
      setElapsed(next);
      if (next >= preset) {
        if (loop) {
          setStartedAt(Date.now());
          setElapsed(0);
        } else setRunning(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loop, preset, running, startedAt]);

  useEffect(() => {
    if (intentionStatus !== "saving") return;
    const timer = window.setTimeout(() => setIntentionStatus("saved"), 500);
    return () => window.clearTimeout(timer);
  }, [intentionStatus]);

  const toggleTimer = () => {
    if (running) return setRunning(false);
    const next = elapsed >= preset ? 0 : elapsed;
    setElapsed(next);
    setStartedAt(Date.now() - next * 1000);
    setRunning(true);
  };

  const wholeElapsed = Math.floor(elapsed);
  const phase = getPhase(wholeElapsed);
  const previousPhase = BREATH_PATTERN[(phase.index + 2) % 3].label;
  const nextPhase = BREATH_PATTERN[(phase.index + 1) % 3].label;
  const progress = Math.min((elapsed / preset) * 100, 100);
  const remainingSeconds = Math.max(preset - wholeElapsed, 0);
  const remainingLabel = `${Math.floor(remainingSeconds / 60)}:${`${remainingSeconds % 60}`.padStart(2, "0")}`;
  const todaysMood = useMemo(() => today ? moods.find((item) => item.date === today) : undefined, [moods, today]);
  const streak = useMemo(() => today ? calculateStreak(moods, today) : 0, [moods, today]);
  const averageMood = useMemo(() => moods.length ? moods.reduce((sum, mood) => sum + mood.value, 0) / moods.length : null, [moods]);
  const week = useMemo(() => {
    if (!today) return [];
    const anchor = new Date(`${today}T12:00:00`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() - (6 - index));
      const key = localDateKey(date);
      return { key, label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date), mood: moods.find((item) => item.date === key) };
    });
  }, [moods, today]);
  const ready = Boolean(today && loopReady && moodsReady && intentionsReady && journalsReady);

  const selectMood = (value: number) => {
    if (!today) return;
    setMoods((items) => {
      const withoutToday = items.filter((item) => item.date !== today);
      return todaysMood?.value === value
        ? withoutToday
        : [...withoutToday, { date: today, value }];
    });
  };
  const saveJournal = () => {
    const content = draft.trim();
    if (!content || !today) return;
    if (editingJournalId) {
      setJournals((items) =>
        items.map((item) =>
          item.id === editingJournalId ? { ...item, content } : item,
        ),
      );
      setReflectionStatus("Reflection updated on this device");
    } else {
      setJournals((items) => [
        { id: `entry-${Date.now()}`, date: today, content },
        ...items,
      ]);
      setReflectionStatus("Reflection saved on this device");
    }
    setDraft("");
    setEditingJournalId(null);
    setDeletedJournal(null);
  };

  const editLatestJournal = () => {
    if (!journals[0]) return;
    setDraft(journals[0].content);
    setEditingJournalId(journals[0].id);
    setReflectionStatus("Editing latest reflection");
  };

  const deleteLatestJournal = () => {
    if (!journals[0]) return;
    setDeletedJournal(journals[0]);
    setJournals((items) => items.slice(1));
    setEditingJournalId(null);
    setDraft("");
    setReflectionStatus("");
  };

  const undoJournalDelete = () => {
    if (!deletedJournal) return;
    setJournals((items) => [deletedJournal, ...items]);
    setDeletedJournal(null);
    setReflectionStatus("Deletion undone");
  };

  return (
    <main className="mindful-shell">
      <aside className="day-rail" aria-label="Daily rhythm">
        <div className="brand-mark"><Leaf size={28} weight="duotone" /><span>Mindful</span></div>
        <div className="day-steps">
          <div className="day-step day-step--morning">
            <span className="day-step__icon"><SunHorizon size={25} weight="light" /></span>
            <div><p>Morning</p><span>Set an intention and start your day with care.</span></div>
          </div>
          <div className="day-step day-step--now" aria-current="step">
            <span className="day-step__icon"><i /></span>
            <div><p>Now</p><span>Pause. Breathe. Come back to the present.</span></div>
          </div>
          <div className="day-step day-step--evening">
            <span className="day-step__icon"><Moon size={25} weight="light" /></span>
            <div><p>Evening</p><span>Reflect on your day and close with gratitude.</span></div>
          </div>
        </div>
      </aside>

      <section className="practice-area">
        <header className="practice-header">
          <h1>A calmer moment, one breath at a time.</h1>
          <p>Breathe with intention, check in with your mood, and capture what matters. Everything stays privately on this device.</p>
          <time>{today ? formatDate(today, true) : "Preparing today…"}</time>
        </header>
        <div className="breath-practice">
          <p className="breath-practice__eyebrow">4–4–6 breathing</p>
          <div className="breath-stage">
            <div className="phase-neighbor" aria-hidden="true"><span><ArrowLeft size={21} /></span><p>{previousPhase}</p></div>
            <div className={`breath-circle ${running ? "is-running" : ""}`} data-phase={phase.label.toLowerCase()} style={{ "--session-progress": `${progress * 3.6}deg` } as React.CSSProperties}>
              <div className="breath-circle__content"><p>{phase.label}</p><strong>{`${phase.seconds}`.padStart(2, "0")}<small>s</small></strong><span>{phase.seconds} seconds</span><span>4–4–6 breathing</span></div>
            </div>
            <div className="phase-neighbor" aria-hidden="true"><span><ArrowRight size={21} /></span><p>{nextPhase}</p></div>
          </div>
          <p className="sr-only" aria-live="polite">{running ? `${phase.label}.` : elapsed >= preset ? "Breathing session complete." : elapsed > 0 ? "Breathing session paused." : "Breathing session ready."}</p>
          <div
            className="session-progress"
            role="progressbar"
            aria-label="Breathing session progress"
            aria-valuemin={0}
            aria-valuemax={preset}
            aria-valuenow={wholeElapsed}
            aria-valuetext={elapsed >= preset ? "Session complete" : `${remainingLabel} remaining`}
          >
            <div className="session-progress__track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
            <span>{elapsed >= preset ? "Session complete" : `${remainingLabel} remaining`}</span>
          </div>
          <div className="breath-controls">
            <div className="preset-control" aria-label="Session length">
              {PRESETS.map((option) => <Button key={option.value} type="button" variant="segmented" className={preset === option.value ? "is-active" : ""} onClick={() => { setPreset(option.value); setElapsed(0); setStartedAt(null); setRunning(false); }}>{option.label}</Button>)}
            </div>
            <label className={`loop-control ${loop ? "is-active" : ""}`}><Switch checked={loop} onCheckedChange={setLoop} disabled={!ready} aria-label="Loop breathing session" /><span>Loop</span></label>
          </div>
          <Button className="begin-button" onClick={toggleTimer}>{running ? "Pause" : elapsed > 0 ? "Resume" : "Begin"}</Button>
          {elapsed > 0 ? <Button type="button" variant="quiet" size="compact" className="reset-session" onClick={() => { setRunning(false); setElapsed(0); setStartedAt(null); }}>Reset session</Button> : <p className="keyboard-hint">Select Begin to start</p>}
        </div>
      </section>

      <aside className="checkin-panel" aria-label="Daily check-in">
        <div className="stats-row">
          <div><span>Mood streak</span><strong>{streak} {streak === 1 ? "day" : "days"}</strong></div>
          <div><span>Overall mood</span><strong>{averageMood ? averageMood.toFixed(1) : "—"} / 5</strong></div>
          <div><span>Total reflections</span><strong>{journals.length}</strong></div>
        </div>
        <section className="panel-section"><h2>Mood check-in</h2><p>How are you feeling right now?</p><div className="mood-options">
          {MOODS.map((mood) => { const selected = todaysMood?.value === mood.value; return <Button key={mood.value} type="button" variant="mood" className={selected ? "is-selected" : ""} onClick={() => selectMood(mood.value)} disabled={!ready} aria-pressed={selected} title={selected ? `Clear ${mood.label} mood` : `Log ${mood.label} mood`}><span>{mood.emoji}</span><small>{mood.label}</small></Button>; })}
        </div></section>
        <section className={`panel-section mood-trend ${moods.length < 2 ? "mood-trend-empty" : ""}`}><h2>7-day mood</h2>
          {moods.length >= 2 ? <div className="mood-chart">
            <div className="mood-scale" aria-hidden="true"><span>5</span><span>1</span></div>
            <div className="mood-bars" aria-label="Seven-day mood history">
              {week.map((day) => { const description = `${day.label}: ${day.mood ? `${day.mood.value} out of 5` : "no mood logged"}`; return <div key={day.key}><span className="mood-value" aria-hidden="true">{day.mood?.value ?? "—"}</span><span role="img" title={description} style={{ height: `${day.mood ? 20 + day.mood.value * 9 : 8}px` }} className={`mood-bar ${day.key === today ? "is-today" : ""}`} aria-label={description} /><small>{day.label}</small></div>; })}
            </div>
          </div> : <div className="trend-empty-state"><p>Your 7-day trend appears after two mood check-ins.</p><span>{moods.length} of 2 check-ins</span></div>}
        </section>
        <section className="panel-section"><h2 id="daily-intention-heading">Daily intention</h2><p>Set a gentle intention for today.</p><Input id="daily-intention" aria-labelledby="daily-intention-heading" value={today ? (intentions[today] ?? "") : ""} onChange={(event) => { if (!today) return; setIntentions((items) => ({ ...items, [today]: event.target.value })); setIntentionStatus("saving"); }} placeholder="What do you want to cultivate today?" maxLength={80} disabled={!ready} /><p className="save-status" aria-live="polite">{intentionStatus === "saving" ? "Saving…" : intentionStatus === "saved" ? "Saved on this device" : ""}</p></section>
        <section className="panel-section reflection-section"><h2 id="reflection-heading">Reflection</h2><p>Capture a thought from today.</p><Textarea id="reflection-entry" aria-labelledby="reflection-heading" value={draft} onChange={(event) => { setDraft(event.target.value); setReflectionStatus(editingJournalId ? "Editing latest reflection" : ""); }} placeholder="Breathe in, notice, and write what you discover…" maxLength={1500} disabled={!ready} /><div className="reflection-actions"><span>{draft.length} / 1500</span><Button type="button" className="reflection-save" size="compact" onClick={saveJournal} disabled={!draft.trim() || !ready}>{editingJournalId ? "Update reflection" : "Save reflection"}</Button></div>
          <p className="reflection-status" aria-live="polite">{reflectionStatus}</p>
          {deletedJournal ? <div className="undo-notice" role="status"><span>Reflection deleted</span><Button type="button" variant="quiet" size="compact" onClick={undoJournalDelete}>Undo</Button></div> : null}
          {journals[0] ? <div className="latest-entry"><div><span>Latest reflection · {formatDate(journals[0].date)}</span><p>{journals[0].content}</p></div><div className="entry-actions"><Button type="button" variant="quiet" size="compact" onClick={editLatestJournal}>Edit</Button><Button type="button" variant="destructive" size="compact" onClick={deleteLatestJournal} aria-label={`Delete reflection from ${formatDate(journals[0].date)}`}>Delete</Button></div></div> : null}
        </section>
      </aside>
      <footer className="privacy-note"><LockSimple size={15} weight="fill" />Private by design. Everything stays on this device. No account or network required.</footer>
    </main>
  );
}
