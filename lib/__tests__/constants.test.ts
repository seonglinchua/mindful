import {
  STORAGE_KEYS,
  TOAST_MESSAGES,
  DEFAULT_DURATIONS,
  TIMEFRAME_OPTIONS,
  MOOD_LABELS,
  UI_LABELS,
  VALIDATION,
} from '../constants';

describe('constants', () => {
  describe('STORAGE_KEYS', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS.MOOD_ENTRIES).toBe('moodEntries');
      expect(STORAGE_KEYS.JOURNAL_ENTRIES).toBe('journalEntries');
      expect(STORAGE_KEYS.BREATH_SESSIONS).toBe('breathSessions');
      expect(STORAGE_KEYS.THEME).toBe('theme');
      expect(STORAGE_KEYS.REMINDERS).toBe('reminders');
    });

    it('should have unique values', () => {
      const values = Object.values(STORAGE_KEYS);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('TOAST_MESSAGES', () => {
    it('should have all required toast messages', () => {
      expect(TOAST_MESSAGES.MOOD_SAVED).toBeDefined();
      expect(TOAST_MESSAGES.JOURNAL_SAVED).toBeDefined();
      expect(TOAST_MESSAGES.BREATH_SESSION_SAVED).toBeDefined();
      expect(TOAST_MESSAGES.DATA_EXPORTED).toBeDefined();
    });

    it('should have non-empty message strings', () => {
      Object.values(TOAST_MESSAGES).forEach((message) => {
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DEFAULT_DURATIONS', () => {
    it('should have positive durations', () => {
      expect(DEFAULT_DURATIONS.TOAST).toBeGreaterThan(0);
      expect(DEFAULT_DURATIONS.BREATH_SESSION).toBeGreaterThan(0);
      expect(DEFAULT_DURATIONS.REMINDER_SNOOZE).toBeGreaterThan(0);
    });

    it('should have reasonable toast duration', () => {
      expect(DEFAULT_DURATIONS.TOAST).toBeGreaterThanOrEqual(1000);
      expect(DEFAULT_DURATIONS.TOAST).toBeLessThanOrEqual(10000);
    });
  });

  describe('TIMEFRAME_OPTIONS', () => {
    it('should have three timeframe options', () => {
      expect(TIMEFRAME_OPTIONS).toHaveLength(3);
    });

    it('should have label and value for each option', () => {
      TIMEFRAME_OPTIONS.forEach((option) => {
        expect(option.label).toBeDefined();
        expect(option.value).toBeDefined();
      });
    });
  });

  describe('MOOD_LABELS', () => {
    it('should have 5 mood labels', () => {
      expect(Object.keys(MOOD_LABELS)).toHaveLength(5);
    });

    it('should have non-empty label strings', () => {
      Object.values(MOOD_LABELS).forEach((label) => {
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('UI_LABELS', () => {
    it('should have common action labels', () => {
      expect(UI_LABELS.SAVE).toBe('Save');
      expect(UI_LABELS.CANCEL).toBe('Cancel');
      expect(UI_LABELS.CONFIRM).toBe('Confirm');
      expect(UI_LABELS.DELETE).toBe('Delete');
    });

    it('should have tab labels', () => {
      expect(UI_LABELS.MOOD_TAB).toBe('Mood');
      expect(UI_LABELS.BREATHE_TAB).toBe('Breathe');
      expect(UI_LABELS.JOURNAL_TAB).toBe('Journal');
    });
  });

  describe('VALIDATION', () => {
    it('should have positive validation limits', () => {
      expect(VALIDATION.JOURNAL_MIN_LENGTH).toBeGreaterThanOrEqual(0);
      expect(VALIDATION.JOURNAL_MAX_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION.TAG_MAX_LENGTH).toBeGreaterThan(0);
      expect(VALIDATION.MAX_TAGS).toBeGreaterThan(0);
    });

    it('should have sensible journal length limits', () => {
      expect(VALIDATION.JOURNAL_MIN_LENGTH).toBeLessThan(VALIDATION.JOURNAL_MAX_LENGTH);
    });
  });
});
