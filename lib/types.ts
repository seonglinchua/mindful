export type MoodEntry = {
  date: string;
  value: number;
  notes?: string; // Optional notes for mood entry
};

export type JournalEntry = {
  id: string;
  date: string;
  content: string;
  tags?: string[]; // Optional tags/categories
};

export type BreathSession = {
  id: string;
  date: string;
  duration: number; // seconds
  pattern: string; // pattern key like "4-4-6", "box", etc.
  completedAt: string; // ISO timestamp
};

export type DateRange = {
  start: string;
  end: string;
};

export type MoodInsight = {
  bestDay: string;
  worstDay: string;
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  consistencyScore: number;
};

export type Timeframe = 'week' | 'month' | 'custom';
