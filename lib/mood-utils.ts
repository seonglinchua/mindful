import type { MoodEntry } from './types';

/**
 * Available mood levels with their display properties
 * Each mood has an emoji, label, and numeric value (1-5)
 * @constant
 */
export const MOODS = [
  { emoji: "😞", label: "Low", value: 1 },
  { emoji: "😐", label: "Steady", value: 2 },
  { emoji: "🙂", label: "Calm", value: 3 },
  { emoji: "😄", label: "Upbeat", value: 4 },
  { emoji: "🤩", label: "Radiant", value: 5 },
] as const;

/**
 * Calculates the current mood tracking streak
 * A streak is the number of consecutive days (including today or yesterday) with mood entries
 * The streak breaks at the first day without an entry
 *
 * @param entries - Array of mood entries to analyze
 * @param today - ISO date string (YYYY-MM-DD) representing today's date
 * @returns Number of consecutive days with mood entries, or 0 if no entries exist
 *
 * @example
 * // With entries on 2024-01-15, 2024-01-14, 2024-01-13
 * calculateStreak(entries, "2024-01-15") // Returns 3
 *
 * @example
 * // With a gap on 2024-01-13
 * calculateStreak([
 *   { date: "2024-01-15", value: 3 },
 *   { date: "2024-01-14", value: 4 },
 *   { date: "2024-01-12", value: 5 }, // Gap here
 * ], "2024-01-15") // Returns 2
 */
export const calculateStreak = (entries: MoodEntry[], today: string) => {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const hasToday = sorted[0]?.date === today;

  let streak = 0;
  const cursor = new Date(`${today}T00:00:00`);
  if (!hasToday) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (const entry of sorted) {
    const entryDate = new Date(`${entry.date}T00:00:00`);
    if (entryDate.getTime() === cursor.getTime()) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (entryDate.getTime() < cursor.getTime()) {
      break;
    }
  }

  return streak;
};
