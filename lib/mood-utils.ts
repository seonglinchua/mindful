export type MoodEntry = {
  date: string;
  value: number;
};

export const MOODS = [
  { emoji: "😞", label: "Low", value: 1 },
  { emoji: "😐", label: "Steady", value: 2 },
  { emoji: "🙂", label: "Calm", value: 3 },
  { emoji: "😄", label: "Upbeat", value: 4 },
  { emoji: "🤩", label: "Radiant", value: 5 },
] as const;

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
