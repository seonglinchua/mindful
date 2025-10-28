/**
 * Application-wide constants
 */

// Storage keys for localStorage
export const STORAGE_KEYS = {
  MOOD_ENTRIES: 'moodEntries',
  JOURNAL_ENTRIES: 'journalEntries',
  BREATH_SESSIONS: 'breathSessions',
  THEME: 'theme',
  REMINDERS: 'reminders',
} as const;

// Toast/notification messages
export const TOAST_MESSAGES = {
  MOOD_SAVED: 'Mood entry saved successfully',
  MOOD_ERROR: 'Failed to save mood entry',
  JOURNAL_SAVED: 'Journal entry saved successfully',
  JOURNAL_DELETED: 'Journal entry deleted',
  JOURNAL_ERROR: 'Failed to save journal entry',
  BREATH_SESSION_SAVED: 'Breathing session saved successfully',
  BREATH_SESSION_ERROR: 'Failed to save breathing session',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully',
  DATA_IMPORT_ERROR: 'Failed to import data',
  DATA_CLEARED: 'All data cleared successfully',
  COPY_SUCCESS: 'Copied to clipboard',
  COPY_ERROR: 'Failed to copy to clipboard',
} as const;

// Date format strings
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY_SHORT: 'MMM D',
  DISPLAY_LONG: 'MMMM D, YYYY',
  TIME: 'HH:mm:ss',
} as const;

// Default durations in seconds
export const DEFAULT_DURATIONS = {
  TOAST: 5000,
  BREATH_SESSION: 300, // 5 minutes
  REMINDER_SNOOZE: 600, // 10 minutes
} as const;

// Timeframe options
export const TIMEFRAME_OPTIONS = [
  { label: 'This Week', value: 'week' as const },
  { label: 'This Month', value: 'month' as const },
  { label: 'Custom Range', value: 'custom' as const },
] as const;

// Mood labels and descriptors
export const MOOD_LABELS = {
  LOW: 'Low',
  STEADY: 'Steady',
  CALM: 'Calm',
  UPBEAT: 'Upbeat',
  RADIANT: 'Radiant',
} as const;

// Breathing pattern names
export const BREATH_PATTERN_NAMES = {
  RELAXATION: '4-4-6',
  SLEEP: '4-7-8',
  BOX: 'box',
  ENERGIZING: '4-2',
} as const;

// UI text labels
export const UI_LABELS = {
  MOOD_TAB: 'Mood',
  BREATHE_TAB: 'Breathe',
  JOURNAL_TAB: 'Journal',
  ANALYTICS_TAB: 'Analytics',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  DELETE: 'Delete',
  EDIT: 'Edit',
  EXPORT: 'Export',
  IMPORT: 'Import',
  CLOSE: 'Close',
  START: 'Start',
  STOP: 'Stop',
  PAUSE: 'Pause',
  RESUME: 'Resume',
} as const;

// Validation limits
export const VALIDATION = {
  JOURNAL_MIN_LENGTH: 1,
  JOURNAL_MAX_LENGTH: 10000,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS: 10,
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

// Color theme names
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  INVALID_DATA: 'Invalid data format',
  STORAGE_FULL: 'Storage is full. Please clear some data.',
  NOT_FOUND: 'Item not found',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  DELETED: 'Item deleted successfully',
  UPDATED: 'Updated successfully',
} as const;
