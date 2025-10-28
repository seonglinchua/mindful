export type MoodEntry = {
  date: string;
  value: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  content: string;
};

export type BreathSession = {
  id: string;
  date: string;
  duration: number; // seconds
  pattern: string; // pattern key like "4-4-6", "box", etc.
  completedAt: string; // ISO timestamp
};
